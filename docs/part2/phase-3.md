---
title: "Step 3 — Lock it down (allowlist · gating · sessions)"
---

# Step 3 — Lock it down (allowlist · gating · sessions)

A bot anyone can message is a direct injection path into your agent. OpenClaw's own recommended baseline, shown during onboarding, is allowlists + mention gating + isolated DM sessions + least-privilege tools. Apply all of it now; don't defer it.

!!! tip "OpenClaw's recommended baseline (verbatim intent from onboarding)"
    - Pairing / allowlists + mention gating.
    - Multi-user / shared inbox: split trust boundaries (separate gateway / credentials, ideally separate OS users / hosts).
    - Sandbox + least-privilege tools.
    - Shared inboxes: isolate DM sessions (`session.dmScope: per-channel-peer`) and keep tool access minimal.

## 1. Allowlist your team only

Set the Telegram channel's allowlist to the numeric IDs you collected in Step 1. The setting lives under the Telegram channel in `~/.openclaw/openclaw.json`; `openclaw configure` exposes it interactively:

```bash
openclaw configure
# find the Telegram channel → pairing / allowlist
# add each teammate's numeric id (e.g. 8675309)
# anyone not on the list is ignored
```

## 2. Keep mention gating on

So the bot only acts when addressed (pairs with the BotFather privacy mode from Step 1). This avoids the agent reacting to every line in a busy chat.

## 3. Isolate DM sessions

Each peer is sandboxed from the others, no shared context, no cross-peer leakage:

```yaml
# in ~/.openclaw/openclaw.json (or via openclaw configure)
session.dmScope: per-channel-peer
```

## 4. Reload + confirm guardrail

```bash
openclaw channels reload     # or restart the daemon
defenseclaw status           # confirm Agent RUNNING, guardrail active
```

!!! warning "Do not weaken governance for a channel"
    Every message arriving over Telegram is untrusted. Leave the DefenseClaw guardrail in front (observe at minimum), keep tools least-privilege, and never add an exception that lets channel input bypass scanning. If you later open this beyond your core team, separate the gateway and credentials so a compromise of the public surface can't reach privileged tooling.

[Continue to Step 4. Verify →](phase-4.md){ .md-button .md-button--primary }
