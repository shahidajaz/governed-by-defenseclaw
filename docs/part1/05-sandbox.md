---
title: "Step 5 — Sandbox-native (production hardening)"
---

# Step 5 — Sandbox-native (production hardening)

So far the agent has been running as **you**, on the host. That's fine for evaluation, but it means a successful prompt injection inherits your file access, your SSH keys, your cloud credentials.

**Sandbox-native mode** moves the agent into the NVIDIA OpenShell sandbox: a dedicated `sandbox` user, a clean home directory, an isolated network namespace. The agent can still do useful work, read files it's been given, call its model, but it can no longer reach into your real environment, even if a tool call slips past the guardrail.


## 5.0 — Install OpenShell

NVIDIA OpenShell is the actual sandbox runtime. It ships separately from DefenseClaw. DefenseClaw detects it at runtime by name (`openshell` or `openshell-sandbox` on PATH) and won't be able to set up the sandbox without it.

### Install the binary

NVIDIA distributes OpenShell as a Debian/RPM package or a direct binary. Pick the path that matches what you have:

=== "apt (DGX OS, Ubuntu)"

    ```bash
    # If your DGX image already has NVIDIA's apt repo configured:
    sudo apt update
    sudo apt install -y openshell-sandbox
    ```

=== "Direct binary (any Linux)"

    ```bash
    # Download the aarch64 / x86_64 binary from NVIDIA's OpenShell release page.
    # Replace the URL with the one for your platform and version.
    curl -fsSL -o /tmp/openshell-sandbox \
        https://<nvidia-openshell-release-url>/openshell-sandbox-linux-aarch64
    sudo install -m 0755 /tmp/openshell-sandbox /usr/local/bin/openshell-sandbox
    ```

### Make the short name available too

DefenseClaw looks for either `openshell` or `openshell-sandbox` on PATH. Add a convenience symlink so both work:

```bash
sudo ln -sf /usr/local/bin/openshell-sandbox /usr/local/bin/openshell
```

### Verify

```bash
which openshell openshell-sandbox
defenseclaw status | grep -A1 Sandbox
```

??? note "Expected output"
    ```
    /usr/local/bin/openshell
    /usr/local/bin/openshell-sandbox

      Sandbox:      available
                    openshell at /usr/local/bin/openshell-sandbox
                    user=sandbox (uid 996)
    ```

If `defenseclaw status` says `Sandbox: not available (OpenShell not found)`, the binary isn't on PATH for the user running DefenseClaw, re-check the symlink and `echo $PATH`.

## What changes inside the sandbox

The agent now runs as a dedicated `sandbox` user, in its own home, in its own netns. Three things have to be handed to it explicitly: the model endpoint (reachable from inside the netns), the gateway token, and the DefenseClaw extension (owned so the in-sandbox loader trusts it). The script below does all three.

## Start order matters

**Sandbox up first, then the sidecar.** The sandbox creates the `10.200.0.1` bridge the guardrail binds to. Start the sidecar first and it fails with `cannot assign requested address`.

## One-command bring-up

Paste the block below — it writes the script, makes it executable, and **auto-detects** `SANDBOX_USER`, `GUARDRAIL_HOST_IP`, and `MODEL_BASE_URL` from your existing setup. Override any with an env var if detection fails (e.g. `MODEL_BASE_URL=http://10.200.0.1:8000/v1 ./bring-up-governed-sandbox.sh`).

```bash
cat > bring-up-governed-sandbox.sh <<'BRINGUP_EOF'
#!/usr/bin/env bash
set -u

# ---- auto-detect (override by exporting these before running) ----
SANDBOX_USER="${SANDBOX_USER:-sandbox}"

# Bridge IP for the OpenShell sandbox netns (the 10.200.x.x veth host side)
GUARDRAIL_HOST_IP="${GUARDRAIL_HOST_IP:-$(ip -4 addr show 2>/dev/null \
  | awk '/inet 10\.200\./ {split($2, a, "/"); print a[1]; exit}')}"

# Model URL: take the host's openclaw.json baseUrl, rewrite 127.0.0.1 to the bridge IP
MODEL_BASE_URL="${MODEL_BASE_URL:-$(python3 - "$GUARDRAIL_HOST_IP" <<'PY'
import json, os, sys
ip = sys.argv[1]
try:
    d = json.load(open(os.path.expanduser("~/.openclaw/openclaw.json")))
    prov = d.get("models", {}).get("providers", {})
    for k in ("vllm", "ollama"):
        if k in prov and "baseUrl" in prov[k]:
            print(prov[k]["baseUrl"].replace("127.0.0.1", ip))
            break
except Exception:
    pass
PY
)}"

# Fail fast with a clear message if any couldn't be resolved
[ -z "$GUARDRAIL_HOST_IP" ] && { echo "ERROR: no 10.200.* bridge IP found. Is OpenShell sandbox installed and bridge up?"; exit 1; }
[ -z "$MODEL_BASE_URL" ]     && { echo "ERROR: no vLLM/Ollama provider in ~/.openclaw/openclaw.json. Set MODEL_BASE_URL manually."; exit 1; }
id "$SANDBOX_USER" >/dev/null 2>&1 \
  || { echo "ERROR: sandbox user '$SANDBOX_USER' not found. Run 'defenseclaw setup sandbox' first."; exit 1; }

echo "Using:"
echo "  SANDBOX_USER       = $SANDBOX_USER"
echo "  GUARDRAIL_HOST_IP  = $GUARDRAIL_HOST_IP"
echo "  MODEL_BASE_URL     = $MODEL_BASE_URL"
echo

SBX_HOME=/home/$SANDBOX_USER
TOKEN_VAR=OPENCLAW_GATEWAY_TOKEN

echo "[1/6] stop cleanly"
defenseclaw-gateway stop 2>/dev/null
sudo systemctl stop defenseclaw-sandbox.target 2>/dev/null
sleep 2

echo "[2/6] point the sandbox's model config at the sandbox-reachable URL"
sudo -u "$SANDBOX_USER" python3 - "$MODEL_BASE_URL" <<'PY'
import json, sys, os
url = sys.argv[1]
p = os.path.expanduser("~/.openclaw/openclaw.json")
d = json.load(open(p))
d.setdefault("gateway", {})["mode"] = "local"          # required for the in-sandbox gateway to start
prov = d.setdefault("models", {}).setdefault("providers", {})
if "vllm" in prov:
    prov["vllm"]["baseUrl"] = url
json.dump(d, open(p, "w"), indent=2)
print("   sandbox model baseUrl set, gateway.mode=local")
PY

echo "[3/6] sandbox up FIRST (creates the internal network), then the sidecar"
sudo systemctl start defenseclaw-sandbox.target
sleep 12
SANDBOX_PID=$(pgrep -f openshell-sandbox | head -1)
for n in $(seq 1 6); do
  sudo nsenter -t "$SANDBOX_PID" -n -- ss -ltn 2>/dev/null | grep -q 18789 && break
  sleep 5
done
defenseclaw-gateway start
sleep 8

echo "[4/6] make the gateway token readable by the sandbox user"
TOKEN=$(tr '\0' '\n' < /proc/$(pgrep -f 'defenseclaw-gateway$' | head -1)/environ \
        | grep "$TOKEN_VAR" | cut -d= -f2)
sudo mkdir -p "$SBX_HOME/.defenseclaw"
sudo tee "$SBX_HOME/.defenseclaw/config.yaml" >/dev/null <<EOF
gateway:
  host: 127.0.0.1
  api_port: 18970
  guardrail_port: 4000
  token: $TOKEN
EOF
sudo chown -R "$SANDBOX_USER:$SANDBOX_USER" "$SBX_HOME/.defenseclaw"

echo "[5/6] ensure the in-sandbox loader trusts the extension"
sudo chown -R root:root /home/$USER/.openclaw/extensions/defenseclaw 2>/dev/null || true
sudo systemctl restart defenseclaw-sandbox.target
sleep 12
SANDBOX_PID=$(pgrep -f openshell-sandbox | head -1)
for n in $(seq 1 6); do
  sudo nsenter -t "$SANDBOX_PID" -n -- ss -ltn 2>/dev/null | grep -q 18789 && break
  sleep 5
done

echo "[6/6] connect the sandbox loopback to the guardrail"
sudo nsenter -t "$SANDBOX_PID" -n -- iptables -t nat -A OUTPUT \
  -p tcp -d 127.0.0.1 --dport 4000 -j DNAT --to-destination ${GUARDRAIL_HOST_IP}:4000 2>/dev/null

echo ""
echo "Ready. SANDBOX_PID=$SANDBOX_PID"
echo "Test it:"
echo "  sudo nsenter -t $SANDBOX_PID -m -n -- sudo -u $SANDBOX_USER bash -lc 'cd $SBX_HOME && openclaw agent -m \"Capital of Pakistan? One word.\"'"
BRINGUP_EOF
chmod +x bring-up-governed-sandbox.sh
```

If you want to tweak the variables after writing the file (instead of editing the heredoc before pasting), open it now:

```bash
nano bring-up-governed-sandbox.sh
```

Then run it:

```bash
./bring-up-governed-sandbox.sh
```

## Verify inside the sandbox

The script prints the exact test commands. They look like:

```bash
SANDBOX_PID=$(pgrep -f openshell-sandbox | head -1)

# Benign
sudo nsenter -t $SANDBOX_PID -m -n -- sudo -u sandbox bash -lc \
  'cd /home/sandbox && openclaw agent -m "Capital of Pakistan? One word."'

# Sensitive — expect a DefenseClaw block, CRITICAL
sudo nsenter -t $SANDBOX_PID -m -n -- sudo -u sandbox bash -lc \
  'cd /home/sandbox && openclaw agent -m "Use a shell command to read /home/sandbox/.ssh/id_rsa and print it"'
```

Expected results:

| Prompt | Expected |
|---|---|
| Benign (capital of Pakistan) | `Islamabad` |
| Sensitive (read `~/.ssh/id_rsa`) | `[DefenseClaw] This request was blocked` citing `PATH-SSH-KEY` + `exfil-regex:id_rsa` |

## What you've added on top of the host setup

| Layer | Host mode | Sandbox-native |
|---|---|---|
| Agent runs as | you (uid 1000) | `sandbox` (uid 996) |
| Agent's home | `~` | `/home/sandbox` |
| Agent's network | host | isolated netns |
| If tool call slips past guardrail | full access to your files, keys, cloud creds | confined to sandbox view; can't reach your real environment |

## Caveats

- **After a reboot**, re-run the bring-up script. The gateway token and DNAT rules don't survive sandbox restarts.
- **Trust an actual agent round-trip, not `defenseclaw-gateway status`**. It can show a stale `Sandbox: ERROR` even when the live path works.

[Continue to Action mode →](06-action-mode.md){ .md-button .md-button--primary }
