---
title: "Step 6 — Stage 4: Rank importance"
---

# Step 6 — Stage 4: Rank importance

Order what surfaced by how much it matters, designed to be reviewable and tunable, never automatic.

!!! tip "Inputs to the score (explicit)"
    - Direct @you / DM weighs more than a broadcast.
    - Sender (whose asks are usually urgent?).
    - Urgency language ("down", "blocked", "asap", "customer") and deadlines.
    - Thread velocity, a sudden burst often means something's on fire.

## 1. Ranking prompts

=== "Standard rank-with-reasons"

    ```
    "Rank the items you surfaced by how urgently they need me.
     Show the score (1–10) and the ONE reason for each, so I can correct you."
    ```

    ??? note "Expected output"
        ```
        Summary
          Top 4 ranked by urgency.

        Ranked
          1. (9) CustomerSuccess · Priya — "Customer escalation"
             Reason: external customer + 2h SLA mentioned in thread.
          2. (7) Infra · Jamie — "Deploy sign-off"
             Reason: blocks a scheduled rollout for tonight.
          3. (4) DM:Dana — "Q3 note"
             Reason: internal, no deadline cited.
          4. (3) Platform · Mo — "Stuck on migration"
             Reason: stuck but not blocking a release.

        Action items
          • Mine: handle #1 first, then #2
          • Others': none

        Suggested next action
          Want me to draft a reply for #1?
        ```

=== "Customer/production only"

    ```
    "Highlight only items tagged 'customer', 'production', or with 'down/blocked/asap'.
     Drop everything else."
    ```

    ??? note "Expected output"
        Filters out internal noise, best for an on-call quick check.

=== "Group by urgency tier"

    ```
    "Bucket items into: 🔴 needs response today, 🟡 needs response this week,
     ⚪ FYI only. One line per item with the reason."
    ```

    ??? note "Expected output"
        Visual bucketing instead of a numeric score. Easier to skim at standup.

!!! warning "It will be wrong sometimes, design for that"
    Criticality is judgment; the model will misrank. Always show the reason, keep it a suggested ordering (not an action), and let yourself override. A ranker that silently auto-escalates is worse than none.

[Continue to Step 7. Stage 5: Meetings →](phase-7.md){ .md-button .md-button--primary }
