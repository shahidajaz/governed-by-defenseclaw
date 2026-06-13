---
title: "Step 0 — Prerequisites & honest constraints"
---

# Step 0 — Prerequisites & honest constraints

The things that must be true before anything runs.

## Checklist

- **Integration exists.** You created a Webex integration on developer.webex.com; have its Client ID, Client Secret, and Redirect URI ready.
- **You authorize it as yourself.** A user-level integration reads only the spaces **you belong to**, no org-wide access (that needs a Compliance Officer scope we deliberately avoid).
- **Meeting summaries need the Webex AI Assistant.** Transcripts (plain text) are always available if transcription was on; AI-generated summaries require the AI Assistant license.
- **Transcripts, not video.** The agent and the local model can't watch a recording, they read the transcript text.
- **Scope decision.** Start with a few spaces, not "everything." Less data, smaller privacy surface, easier demo.

[Continue to Step 1. Webex integration & OAuth →](phase-1.md){ .md-button .md-button--primary }
