---
title: "Step 9 — Assemble the digest"
---

# Step 9 — Assemble the digest

Stack the proven stages into one briefing, produced on a schedule or on demand, delivered to you in Webex (a DM to yourself or a private digest space).

## What the morning digest looks like

Every day at 8am — or whenever you ask for it — the agent delivers a single message to your private digest space. It's the output of all five earlier stages, condensed:

<div class="webex-chat" markdown>
<div class="webex-chat__header" markdown>
<div class="webex-chat__space-icon">📓</div>
<div class="webex-chat__space-info">
  <span class="webex-chat__space-name">My Digest · private space</span>
  <span class="webex-chat__space-meta">delivered daily 08:00</span>
</div>
</div>
<div class="webex-chat__body" markdown>

<div class="webex-msg" markdown>
<div class="webex-msg__avatar bot">🦞</div>
<div class="webex-msg__content" markdown>
<div class="webex-msg__head">
  <span class="webex-msg__name">Triage assistant</span>
  <span class="webex-msg__badge">Bot</span>
  <span class="webex-msg__time">08:00</span>
</div>
<div class="webex-msg__body">**Good morning. Here's your day.**

**1. Needs you (4)**
• Jamie · Infra — deploy plan sign-off (4pm cutoff)
• Priya · CustomerSuccess — Acme escalation
• Dana · DM — Q3 numbers question
• Mo · Platform — migration blocker

**2. Active topics across your spaces**
deploy plan, Q3 capacity, customer escalation, vLLM upgrade

**3. Yesterday's Platform sync (38 min)**
Decisions: postpone vLLM upgrade, capacity deck owner = you (Friday)
Your action items: draft deck, sign off on upgrade plan

**4. Drafts waiting for your review**
3 drafts ready — reply with the numbers to send.</div>
</div>
</div>

</div>
</div>

## 1. Compose from the validated stages

```
Digest =
  1. What needs me today          (Stage 2, ranked by Stage 4)
  2. Topics across my spaces      (Stage 3)
  3. Meeting summaries + my action items  (Stage 5)
  4. Suggested replies to review  (Stage 6, draft only)
```

## 2. Deliver + schedule

Delivery is a governed `webex.send_message` to your chosen space:

```bash
# deliver to a Webex DM to yourself, or a private 'My Digest' space
# scope: which spaces/DMs are included (start narrow)
# schedule: 8am daily, or on-demand "give me my digest"
```

!!! tip "Scope is your explicit choice"
    Decide which Webex spaces/DMs the digest reads, deliberately, not "all of Webex." That choice is the privacy boundary and it's logged (Step 10).

[Continue to Step 10. Governance & audit →](phase-10.md){ .md-button .md-button--primary }
