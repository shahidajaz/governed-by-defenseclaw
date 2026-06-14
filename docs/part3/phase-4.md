---
title: "Step 4 — Stage 2: \"What needs my response?\""
---

# Step 4 — Stage 2: "What needs my response?"

The killer feature — and it maps onto exact Webex calls, so it's explainable, not magic.

## What "needs me" looks like

Same space from [Step 3](phase-3.md), but the agent has flagged two messages as needing your reply. The criteria are deterministic: you're either @mentioned in a group space, or you're in a DM and the last message is theirs (not yours).

<div class="webex-chat" markdown>
<div class="webex-chat__header" markdown>
<div class="webex-chat__space-icon">I</div>
<div class="webex-chat__space-info">
  <span class="webex-chat__space-name">Across your Webex · today</span>
  <span class="webex-chat__space-meta">4 threads need a reply from you</span>
</div>
</div>
<div class="webex-chat__body" markdown>

<div class="webex-msg flagged" markdown>
<div class="webex-msg__avatar user-blue">J</div>
<div class="webex-msg__content" markdown>
<div class="webex-msg__head"><span class="webex-msg__name">Jamie</span><span class="webex-msg__time">Infra · 09:14</span></div>
<div class="webex-msg__body">@you Can you sign off on the deploy plan?</div>
<div class="webex-msg__flag">⚑ You're @mentioned — needs a reply</div>
</div>
</div>

<div class="webex-msg flagged" markdown>
<div class="webex-msg__avatar user-amber">P</div>
<div class="webex-msg__content" markdown>
<div class="webex-msg__head"><span class="webex-msg__name">Priya</span><span class="webex-msg__time">CustomerSuccess · 02:14</span></div>
<div class="webex-msg__body">Customer escalation from Acme — need your eyes on this.</div>
<div class="webex-msg__flag">⚑ You're @mentioned — needs a reply</div>
</div>
</div>

<div class="webex-msg" markdown>
<div class="webex-msg__avatar user-green">M</div>
<div class="webex-msg__content" markdown>
<div class="webex-msg__head"><span class="webex-msg__name">Mo</span><span class="webex-msg__time">Infra · 09:31</span></div>
<div class="webex-msg__body">Oncall handoff settled for next week — Dana → Anna.</div>
</div>
</div>

</div>
</div>

??? info "How the agent decides"
    - **Group spaces:** the agent calls `GET /v1/messages?roomId=…&mentionedPeople=me`. Webex itself filters server-side for messages where you're @mentioned. No model judgment required.
    - **1:1 DMs:** the agent calls `GET /v1/messages/direct?personId=…` and compares the timestamps — if the last message is theirs, it's pending; if yours, you've already replied.
    - **No "give me everything" endpoint exists.** The agent walks your spaces one at a time and only queries rooms you're already a member of. That's by design — it keeps the agent scoped to what you can already see.

!!! tip "How it's actually computed"
    - **Group spaces:** `GET /v1/messages?roomId=…&mentionedPeople=me` returns only messages where **you're @mentioned**. Webex does this filter server-side.
    - **1:1 DMs:** `GET /v1/messages/direct?personId=…` returns the thread; the agent checks whether the latest message is *theirs*, not yours.
    - **Unanswered test:** compare the latest inbound message's timestamp to your last reply in that thread.
    - **Constraint (accurate):** there is **no single "all messages" endpoint**, the agent lists your rooms, then queries per room, and only for rooms you belong to.

## 1. Triage prompts

=== "Standard (last N days)"

    ```
    "Across my Webex spaces and DMs from the last 3 days, list only
     threads awaiting MY reply (I'm @mentioned, or it's a DM where
     their message is latest). For each: space, who, one-line ask.
     Exclude anything I've answered."
    ```

    ??? note "Expected output"
        ```
        Summary
          4 threads waiting on you across 3 spaces + 1 DM.

        Sources
          Infra:msg/4f8a · CustomerSuccess:msg/9c2b · DM:dana:msg/1a93 · ...

        Threads waiting on you
          1. Infra · Jamie · "Can you sign off on the deploy plan?"
          2. CustomerSuccess · Priya · "Customer escalation — need eyes"
          3. DM · Dana · "Did you see my note about Q3?"
          4. Platform · Mo · "Stuck on the migration. Help?"

        Action items
          • Mine: 4 replies pending
          • Others': none

        Suggested next action
          Want me to draft replies for #2 and #4?
        ```

=== "Customer-only"

    ```
    "Same as above, but only threads from external/customer spaces.
     Skip internal."
    ```

    ??? note "Expected output"
        ```
        Summary
          1 thread waiting on you. Customer Success.

        Sources
          CustomerSuccess:msg/9c2b · Priya · 02:14

        Threads
          1. Customer escalation from Acme — need your eyes
             (Priya, 2h ago, no reply yet)

        Action items
          • Mine: respond to Priya
          • Others': none

        Suggested next action
          Draft a reply asking for the ticket #?
        ```

=== "Older / forgotten"

    ```
    "Threads where someone @-mentioned me 7+ days ago and I never replied."
    ```

    ??? note "Expected output"
        Surfaces the things that fell through the cracks. Different prompt → different lens on the same data.

## 2. Save the working version as a skill

When one of these reliably produces the shape you want, save the prompt, see the [skill template appendix](skill-template.md).

[Continue to Step 5. Stage 3: Cluster by topic →](phase-5.md){ .md-button .md-button--primary }
