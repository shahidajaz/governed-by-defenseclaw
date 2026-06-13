---
title: "Step 2 — Wire Webex as governed tools"
---

# Step 2 — Wire Webex as governed tools

Give the agent a small set of Webex actions to call, each one a governed tool that passes DefenseClaw's gate. The REST under each tool is exact; only the OpenClaw registration mechanism is yours to confirm against your install.

!!! warning "[confirm], the one environment-specific piece"
    How OpenClaw registers a local tool/skill (manifest format, where it lives) is the single thing to confirm against your install, paste your OpenClaw tool/skill config and this becomes exact. Everything the tools *call* (the REST below) is verified.

A small helper holds the refresh token, mints access tokens, and exposes these operations. Register them as OpenClaw tools so the agent can call them; each passes `before_tool_call`:

| Tool | REST call (verified) | Scope |
|---|---|---|
| `webex.list_spaces` | `GET /v1/rooms` | `spark:rooms_read` |
| `webex.list_messages` | `GET /v1/messages?roomId=…&mentionedPeople=me` | `spark:messages_read` |
| `webex.list_direct` | `GET /v1/messages/direct?personId=…` | `spark:messages_read` |
| `webex.send_message` | `POST /v1/messages` (write, gated) | `spark:messages_write` |
| `webex.list_transcripts` | `GET /v1/meetingTranscripts` (+ download) | `meeting:transcripts_read` |
| `webex.book_meeting` | `POST /v1/meetings` (write, gated) | `meeting:schedules_write` |

## 1. Register the helper's operations as OpenClaw tools

`[confirm OpenClaw's tool/skill registration]`

## 2. Confirm DefenseClaw sees them as governed

The same scan/inspection you used for any tool in Part 1:

```bash
defenseclaw status          # tool inspection: both; Agent RUNNING
defenseclaw tui             # Activity will show webex.* calls as they happen
```

!!! tip "Read vs. write, gate the writes harder"
    `list_*` are reads. `send_message` and `book_meeting` are **writes**, they change the world. Keep those behind an explicit human approval (Phases 8–9) and let DefenseClaw treat them as higher-risk actions. A read that misfires is noise; a send that misfires is an email to your team.

[Continue to Agent persona →](persona.md){ .md-button .md-button--primary }
