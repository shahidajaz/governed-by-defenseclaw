---
title: "Step 8 — Stage 6: Draft replies (you approve)"
---

# Step 8 — Stage 6: Draft replies (you approve)

Close the loop: for the "needs me" items, draft replies you review and send. The agent never sends on its own.

## What a draft looks like in front of you

The agent prepares the reply but **doesn't send it**. You see exactly what it would send, and you have to actively approve before anything leaves your account:

<div class="webex-chat" markdown>
<div class="webex-chat__header" markdown>
<div class="webex-chat__space-icon">C</div>
<div class="webex-chat__space-info">
  <span class="webex-chat__space-name">CustomerSuccess · reply to Priya</span>
  <span class="webex-chat__space-meta">Draft — not sent yet</span>
</div>
</div>
<div class="webex-chat__body" markdown>

<div class="webex-msg" markdown>
<div class="webex-msg__avatar user-amber">P</div>
<div class="webex-msg__content" markdown>
<div class="webex-msg__head"><span class="webex-msg__name">Priya</span><span class="webex-msg__time">02:14</span></div>
<div class="webex-msg__body">Customer escalation from Acme — need your eyes on this.</div>
</div>
</div>

<div class="webex-msg" markdown>
<div class="webex-msg__avatar bot">🦞</div>
<div class="webex-msg__content" markdown>
<div class="webex-msg__head">
  <span class="webex-msg__name">Triage assistant</span>
  <span class="webex-msg__badge">Draft</span>
</div>
<div class="webex-msg__body">On it — pulling the Acme thread now. I'll have a customer-facing response in the next 30. Cc'ing Jamie for context.</div>
</div>
</div>

</div>
<div class="webex-draft-bar">
  <span class="webex-draft-bar__label">Approve this draft?</span>
  <span class="webex-draft-bar__btn">Edit</span>
  <span class="webex-draft-bar__btn webex-draft-bar__btn--danger">Discard</span>
  <span class="webex-draft-bar__btn webex-draft-bar__btn--primary">Send</span>
</div>
</div>

Only the **Send** button triggers a real `webex.send_message` call. The agent has no path around this — it has no permission to send messages on its own, only to draft them and show you the result.

## 1. Drafting prompts

=== "Standard, top N, no send"

    ```
    "For the top 3 items that need me, draft a short reply each.
     Show them — do NOT send. I'll approve or edit."
    ```

    ??? note "Expected output"
        ```
        Summary
          3 drafts. None sent.

        Draft 1 → CustomerSuccess · reply to Priya
          "On it — pulling the Acme thread now. I'll have a customer-facing
           response in the next 30. Cc'ing Jamie for context."

        Draft 2 → Infra · reply to Jamie
          "Reviewed the deploy plan. One ask: bump the canary window from
           5 to 15 min so we catch the latency tail. Otherwise +1."

        Draft 3 → DM:Dana · reply to Dana
          "Saw it — let me look at Q3 by tomorrow. Quick Q: are we
           accounting for the surge or just steady-state?"

        Action items
          • Mine: approve / edit
          • Others': none

        Suggested next action
          Reply "send #1, hold #2 and #3" and I'll send only the first.
        ```

=== "Same as them, formal"

    ```
    "Same drafts, but more formal — like I'm replying to leadership."
    ```

    ??? note "Expected output"
        Tone shifts to formal, same content, fewer contractions, more structure.

=== "Curt"

    ```
    "Same drafts, but each ≤ 12 words. Just enough to acknowledge."
    ```

    ??? note "Expected output"
        ```
        Draft 1 → Priya: "On it. Customer-facing reply in 30."
        Draft 2 → Jamie: "+1 with one ask — bump canary to 15 min."
        Draft 3 → Dana: "Looking at Q3 by tomorrow."
        ```

## 2. Approve to send

Only an explicit approval triggers a send, a governed, audited `webex.send_message`:

```
"Send draft #2 as-is to that space. Hold the others."
                                      → webex.send_message (gated)
```

!!! warning "Never auto-send"
    Drafting is the assistant's job; sending is yours. Keep a hard human-approval step before any outbound message, and show the draft → approval → audit entry in the demo. That's the trust story.

[Continue to Step 9. Assemble the digest →](phase-9.md){ .md-button .md-button--primary }
