---
title: "Step 10 — Governance & audit"
---

# Step 10 — Governance & audit

This assistant reads colleagues' messages and can send on your behalf, so governance is the part a security audience cares most about.

!!! tip "What DefenseClaw gives you here"
    - **Every call is a gated tool call:** each `webex.*` action passes `before_tool_call`; reads pass, writes (send/book) are higher-risk and held to approval.
    - **Every action is audited:** who/what/when in the audit DB and Splunk (Part 1, Step 6).
    - **Same observe→action posture:** start in observe for visibility; the action-mode blocking from Part 1 Step 9 covers this surface too.

## 1. Watch all Webex activity in one place

```spl
index=defenseclaw_local sourcetype="defenseclaw:json" tool=webex*
| table _time tool action sev reason
```

!!! warning "Write the \"what it can read\" note before the demo"
    One short paragraph: which spaces are in scope, that it reads message content (not just metadata), that it never sends without your approval, and that every read and send is logged and reviewable. Someone will ask.

[Continue to Optional. Webhooks →](webhooks.md){ .md-button }
[Back to Part 3 overview →](index.md){ .md-button }
