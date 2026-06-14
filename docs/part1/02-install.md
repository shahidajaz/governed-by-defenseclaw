---
title: "Step 2 — Install OpenClaw + DefenseClaw"
---

# Step 2 — Install OpenClaw + DefenseClaw

Two installers, in this order. The version pin on OpenClaw matters, it's the version DefenseClaw's installer expects.

## What gets installed where

The two installers drop binaries, config files, and a plugin in a handful of places. Knowing the layout up front makes the rest of this series easier to follow when you need to troubleshoot.

```mermaid
flowchart TB
    subgraph npm["OpenClaw (via npm, system-wide)"]
        OC1["/usr/local/bin/openclaw<br/>the CLI you'll run"]
        OC2["/usr/local/lib/node_modules/openclaw<br/>the gateway + bundled channels (Telegram, Slack, etc.)"]
    end

    subgraph dc["DefenseClaw (via Cisco's install.sh)"]
        DC1["~/.local/bin/defenseclaw<br/>~/.local/bin/defenseclaw-gateway<br/>the CLI and the host gateway"]
        DC2["~/.defenseclaw/<br/>configs, audit DB, gateway logs, policy packs"]
        DC3["~/.openclaw/extensions/defenseclaw/<br/>the plugin that links the two together"]
    end

    style OC1 fill:#eef0ff,stroke:#5a67d8
    style OC2 fill:#eef0ff,stroke:#5a67d8
    style DC1 fill:#fef3c7,stroke:#d97706
    style DC2 fill:#fef3c7,stroke:#d97706
    style DC3 fill:#e8f5e9,stroke:#16a34a
```

??? info "Why the plugin lives under `~/.openclaw/extensions/`"
    OpenClaw can load third-party plugins from any folder under its extensions directory. DefenseClaw's installer drops itself there as `defenseclaw`, and OpenClaw picks it up automatically the next time the gateway starts. That's the bridge: OpenClaw runs the agent, the DefenseClaw plugin sits inside OpenClaw's process and intercepts every model call.

## Install OpenClaw (pinned version)

```bash
sudo /usr/bin/npm uninstall -g openclaw 2>/dev/null
~/.nvm/versions/node/*/bin/npm uninstall -g openclaw 2>/dev/null
hash -r

sudo /usr/bin/npm install -g openclaw@2026.3.24
hash -r

openclaw --version
```

??? note "Expected output"
    OpenClaw 2026.3.24 (cff6dc9)

![OpenClaw install output](../assets/step2-openclaw-install.png)

## Install DefenseClaw

```bash
cat > /tmp/dc-overrides.txt <<'EOF'
click
litellm
EOF

curl -LsSf https://raw.githubusercontent.com/cisco-ai-defense/defenseclaw/main/scripts/install.sh \
  | UV_OVERRIDE=/tmp/dc-overrides.txt bash
```

The installer asks which **connector** to wire up. Pick `4` for **openclaw**:

```
─── Pick agent connector
  1) codex
  2) claudecode
  3) zeptoclaw
  4) openclaw     ← pick this one
  5) none
```

Verify:

```bash
defenseclaw --version
```

??? note "Expected output"
    defenseclaw, version 0.7.2

![DefenseClaw installed successfully](../assets/step2-defenseclaw-installed.png)

[Continue to Step 3 — Pick your model →](03-setup-model.md){ .md-button .md-button--primary }
