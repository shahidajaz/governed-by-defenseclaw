---
title: "Step 4 — Stage 2: \"What needs my response?\""
---

# Step 4 — Stage 2: "What needs my response?"

The killer feature, and it maps onto exact Webex calls, so it's explainable, not magic.

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
