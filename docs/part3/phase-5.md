---
title: "Step 5 — Stage 3: Cluster by topic"
---

# Step 5 — Stage 3: Cluster by topic

Collapse a noisy space, or several, into a handful of topics, so you read themes instead of hundreds of messages.

## 1. Cluster prompts

=== "Single space, today"

    ```
    "Group today's messages in <space> into topics. For each: a
     5-word label, who's involved, and the 1-line state. Order by activity."
    ```

    ??? note "Expected output"
        ```
        Summary
          47 messages in Infra today → 4 topics.

        Sources
          GET /v1/messages?roomId=Infra · 47 msgs

        Topics
          1. "vLLM upgrade rollout"        — Jamie, Mo, Anna · 18 msgs
              State: rollout pending sign-off from oncall
          2. "Grafana alert noise"         — Jamie, Priya · 12 msgs
              State: filter PR open, awaiting review
          3. "Q3 capacity planning"        — Mo, Anna · 11 msgs
              State: numbers in, deck not started
          4. "Oncall rotation swap"        — Anna, Dana · 6 msgs
              State: swap confirmed for next week

        Action items
          • Mine: review filter PR + sign deploy
          • Others': finish capacity deck

        Suggested next action
          Want me to surface only the topics where you're tagged?
        ```

=== "Across spaces, this week"

    ```
    "Cluster all messages from my last 7 days across spaces/DMs by topic.
     Merge same-topic threads even if they're in different spaces."
    ```

    ??? note "Expected output"
        ```
        Summary
          ~340 messages → 9 cross-space topics.

        Sources
          7 spaces · 4 DMs · 340 msgs · last 7 days

        Topics (top 5)
          1. "Q3 capacity" — Infra + Platform + Mo-DM · 31 msgs
          2. "vLLM upgrade" — Infra + Platform · 24 msgs
          3. "Customer Acme escalation" — Customer Success + Priya-DM · 19 msgs
          4. "Hiring loop for SRE2" — DM:Dana · 12 msgs
          5. "Compliance audit prep" — Compliance + DM:Maria · 8 msgs

        Action items
          • Mine: 3 of 5 have my-mention; replies pending
          • Others': capacity deck (Mo)

        Suggested next action
          Rank these 9 by urgency next?
        ```

=== "Recurring themes"

    ```
    "Which topics keep coming back across the last 2 weeks?
     Just the themes that recurred 3+ days. Not single-shot threads."
    ```

    ??? note "Expected output"
        Surfaces what's stuck vs what's noise. Useful weekly retro input.

!!! tip "Show the before/after in the demo"
    The value is legibility, make it visible: the raw unread count, then the short topic list it became. That contrast is the moment it clicks.

[Continue to Step 6. Stage 4: Rank importance →](phase-6.md){ .md-button .md-button--primary }
