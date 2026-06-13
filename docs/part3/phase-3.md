---
title: "Step 3 — Stage 1: Read (prove access)"
---

# Step 3 — Stage 1: Read (prove access)

Before any intelligence, prove the plain read works and is audited.

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
