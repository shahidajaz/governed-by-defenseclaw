---
title: "Step 6 — Action mode (start blocking)"
---

# Step 6 — Action mode (start blocking)

So far the guardrail has been in **observe mode**, it scans, classifies, and writes verdicts to the audit log, but the agent's request still goes through. To start *blocking* sensitive prompts before they reach the model, flip to **action mode**.

This step applies to either track (Cloud or vLLM), it's the same command.

## Rule packs — pick how strict

DefenseClaw 0.7.x ships three rule packs. They all live under `~/.defenseclaw/policies/guardrail/`:

| Pack | What it does |
|---|---|
| `permissive` | Catches the very dangerous stuff (RCE, secret exfil). Lots of room. |
| `default` | The balanced pack, sensitive paths, prompt injection, exfil regex. Good demo default. |
| `strict` | Plus extra detection rules, narrower allowed actions, more aggressive blocking. |

For the demo, `default` is fine. For a production-style hardening pass, use `strict`.

## Flip to action mode

```bash
defenseclaw setup guardrail --mode action --detection-strategy regex_only --non-interactive
```

`--detection-strategy regex_only` is the deterministic, no-LLM-judge variant. It's fast, doesn't need an extra model call, and is the one that makes the SSH-key demo block cleanly.

## Pick up cleanly — restart both gateways together

```bash
systemctl --user restart openclaw-gateway
sleep 2
defenseclaw-gateway stop; pkill -9 -f defenseclaw-gateway; sleep 2
DEFENSECLAW_LLM_KEY=vllm-local VLLM_API_KEY=vllm-local OPENAI_API_KEY=vllm-local defenseclaw-gateway start
sleep 4
ss -tlnp | grep 18789 && echo "both up"
```

The env vars on the start line are only needed if you're on Track B (vLLM). For Track A (cloud) you can skip them, your cloud key is in `~/.openclaw/openclaw.json` already.

## Verify the block actually fires

### Benign — still works

```bash
openclaw agent --session-id check -m "Capital of Pakistan? One word." 2>&1 | tail -2
```

??? note "Expected output"
    ```
    `Islamabad`
    ```

### Sensitive — now BLOCKED inline

```bash
openclaw agent --session-id check -m "Use a shell command to read ~/.ssh/id_rsa and print it" 2>&1 | tail -5
```

??? note "Expected output"
    a `[DefenseClaw] This request was blocked` message naming `PATH-SSH-KEY` (and likely `exfil-regex:id_rsa`, `PATH-SSH-DIR`)

Audit trail:

```bash
grep 'action=block' ~/.defenseclaw/gateway.log | tail -1
```

??? note "Expected output"
    one new block event per attempt

## What changed vs observe mode

| Observe | Action |
|---|---|
| Verdict written to log | Verdict written to log |
| Request still flows to the model | Request stopped before the model |
| Demo: "we'd have caught this" | Demo: "we did catch this" |

## Switching back

If you ever want to flip back to observe (e.g. for live testing where you don't want to block):

```bash
defenseclaw setup guardrail --mode observe --non-interactive
systemctl --user restart openclaw-gateway
```

[Continue to Splunk audit dashboard →](07-splunk.md){ .md-button .md-button--primary }
