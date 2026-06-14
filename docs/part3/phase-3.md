---
title: "Step 3 — Stage 1: Read (prove access)"
---

# Step 3 — Stage 1: Read (prove access)

Before any intelligence, prove the plain read works and is audited. The agent uses the token from [Step 1](phase-1.md) to make a normal Webex REST call — same call the Webex desktop app makes when it loads a space.

## What the agent is looking at

Here's a typical space the agent will read from. It sees the same messages you do, in the same order:

<div class="webex-chat" markdown>
<div class="webex-chat__header" markdown>
<div class="webex-chat__space-icon">I</div>
<div class="webex-chat__space-info">
  <span class="webex-chat__space-name">Infra</span>
  <span class="webex-chat__space-meta">8 members · 47 messages today</span>
</div>
</div>
<div class="webex-chat__body" markdown>

<div class="webex-msg" markdown>
<div class="webex-msg__avatar user-blue">J</div>
<div class="webex-msg__content" markdown>
<div class="webex-msg__head"><span class="webex-msg__name">Jamie</span><span class="webex-msg__time">09:14</span></div>
<div class="webex-msg__body">Deploy plan posted in the channel — need sign-off before 4pm.</div>
</div>
</div>

<div class="webex-msg" markdown>
<div class="webex-msg__avatar user-green">M</div>
<div class="webex-msg__content" markdown>
<div class="webex-msg__head"><span class="webex-msg__name">Mo</span><span class="webex-msg__time">09:31</span></div>
<div class="webex-msg__body">Oncall handoff settled for next week — Dana → Anna.</div>
</div>
</div>

<div class="webex-msg" markdown>
<div class="webex-msg__avatar user-amber">A</div>
<div class="webex-msg__content" markdown>
<div class="webex-msg__head"><span class="webex-msg__name">Anna</span><span class="webex-msg__time">10:02</span></div>
<div class="webex-msg__body">Grafana alert from last night — wrote up the post-mortem, comments welcome.</div>
</div>
</div>

</div>
</div>

When you run the prompts below, the agent calls `GET /v1/rooms` to find this space, then `GET /v1/messages?roomId=...` to pull the messages. Nothing fancy — just two REST calls, both logged by DefenseClaw.

## 1. List spaces, then pull recent messages

Pick whichever fits, they're all the same `webex.list_*` tools under the hood, just different prompt shapes:

=== "Basic"

    ```
    "List my Webex spaces."
    ```

    ??? note "Expected output"
        ```
        Summary
          14 group spaces, 7 1:1 DMs.

        Sources
          GET /v1/rooms · 14 rooms (titles listed below)

        Action items
          • Mine: pick scope for triage
          • Others': none

        Suggested next action
          Want me to pull the last 50 messages from one to verify?
        ```

=== "Targeted"

    ```
    "Show the last 20 messages in <space-name>."
    ```

    Replace `<space-name>` with one of yours, e.g. `Infra`.

    ??? note "Expected output"
        ```
        Summary
          20 messages from Infra over the last 18 hours. 3 threads:
          deploy plan, oncall handoff, a Grafana alert post-mortem.

        Sources
          GET /v1/messages?roomId=... · 20 messages · authors: 4

        Action items
          • Mine: review the alert post-mortem (oncall mentioned you)
          • Others': none

        Suggested next action
          Want a topic cluster of just today across all your spaces?
        ```

=== "Today only"

    ```
    "What's been active across my spaces today? Just space names + count."
    ```

    ??? note "Expected output"
        ```
        Summary
          7 spaces had activity today. Most active: Infra (47), Customer Success (22).

        Sources
          GET /v1/rooms then GET /v1/messages per room

        Action items
          • Mine: none yet — surfacing only
          • Others': none

        Suggested next action
          Want the "needs my response" filter on top?
        ```

## 2. Confirm the read was governed

```bash
defenseclaw tui             # Activity: webex.list_messages, scanned
```

In Splunk:

```spl
index=defenseclaw_local sourcetype="defenseclaw:json" tool=webex*
```

!!! success "Done ="
    Real messages come back from a real space, and the call shows up as a governed tool call in `defenseclaw tui` / Splunk. Nothing clever yet, just proven, audited access.

[Continue to Step 4. Stage 2: What needs my response? →](phase-4.md){ .md-button .md-button--primary }
