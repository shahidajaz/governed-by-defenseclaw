---
title: "Step 9 — Assemble the digest"
---

# Step 9 — Assemble the digest

Stack the proven stages into one briefing, produced on a schedule or on demand, delivered to you in Webex (a DM to yourself or a private digest space).

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
