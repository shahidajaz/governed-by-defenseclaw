---
title: "Optional — Going live with webhooks"
---

# Optional — Going live with webhooks

Everything above uses **polling**, the agent reads Webex on a schedule or when you ask. That's the recommended default and needs no inbound endpoint. This section is the optional upgrade: have Webex push to you the instant a message arrives, so the agent can react proactively (e.g. ping you on Telegram about an urgent message). Skip it unless you specifically need that.

!!! warning "Why this is optional, not default"
    A webhook means standing up a public HTTPS endpoint for Webex to POST to, a new inbound attack surface on a box whose other services might already be exposed. For a digest (a snapshot by nature) that's the wrong trade. Add it only for proactive/instant alerts, and harden it as below.

## 1. Expose a public HTTPS receiver

Via your Cloudflare tunnel (e.g. a `webex-hook.yourdomain.com` hostname → a loopback service on the DGX). **Do not** bind it to `0.0.0.0`; let the tunnel be the only ingress.

## 2. Register the webhook

Using your access token:

```bash
curl -s https://webexapis.com/v1/webhooks \
  -H "Authorization: Bearer <ACCESS_TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"triage-msgs","targetUrl":"https://webex-hook.yourdomain.com/hook",
       "resource":"messages","event":"created","secret":"<RANDOM_SECRET>"}'
# optional: add "filter":"roomId=<ROOM_ID>" to watch specific spaces only
```

## 3. Verify it's really from Webex on every callback

```bash
# Webex sends header  X-Spark-Signature = HMAC-SHA1(rawBody, secret)
# recompute it with your secret and compare; reject on mismatch
# reject if the payload timestamp is older than 5 minutes (replay protection)
# then respond 200 OK
```

## 4. Fetch the content

The callback carries only the message id, not its text:

```bash
curl -s https://webexapis.com/v1/messages/<data.id> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
# (Webex's webhook→REST sync SLA is <10 min for 99.5%; usually instant)
```

!!! tip "It plugs into the same governed path"
    The webhook only *triggers* the read; the agent still pulls and triages through the same `webex.list_messages` tool that passes DefenseClaw's gate. Nothing about the governance or the triage logic changes, you've just swapped "on a schedule" for "on an event." That's why polling now and adding this later is a clean upgrade, not a rewrite.

!!! warning "Harden the receiver"
    Validate `X-Spark-Signature` on every request, enforce the 5-minute replay window, keep the secret out of code, rotate it periodically, and keep the endpoint behind the Cloudflare tunnel, never directly on `0.0.0.0`. An unauthenticated webhook receiver is an open door into your agent.

[Continue to Skill template →](skill-template.md){ .md-button .md-button--primary }
