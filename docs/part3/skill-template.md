---
title: "Skill template — `webex-summarize`"
---

# Skill template — `webex-summarize`

A drop-in OpenClaw skill that bundles the prompts from Steps 4–9 into one callable command. Once installed, anyone can run `/webex digest` or `/webex needs-me` in the TUI and the agent runs the canonical flow with the right prompts and tool calls.

No org names, no space IDs, no API keys hardcoded, works for any user, any Webex tenant.

## Install (one time)

```bash
mkdir -p ~/.openclaw/skills/webex-summarize

cat > ~/.openclaw/skills/webex-summarize/manifest.json <<'JSON'
{
  "name": "webex-summarize",
  "version": "1.0.0",
  "description": "Webex triage assistant: read, cluster, rank, summarize, draft.",
  "commands": [
    {
      "name": "webex digest",
      "summary": "Full Webex digest: needs-me + clusters + meetings + drafts."
    },
    {
      "name": "webex needs-me",
      "summary": "Threads waiting on you across spaces/DMs."
    },
    {
      "name": "webex cluster",
      "summary": "Cluster activity into topics."
    },
    {
      "name": "webex rank",
      "summary": "Rank surfaced items by urgency, with reasons."
    },
    {
      "name": "webex summarize-meeting",
      "summary": "Pull a meeting transcript and summarize."
    },
    {
      "name": "webex draft",
      "summary": "Draft replies for the top items needing your response."
    }
  ],
  "tools_required": [
    "webex.list_spaces",
    "webex.list_messages",
    "webex.list_direct",
    "webex.list_transcripts",
    "webex.send_message"
  ]
}
JSON

cat > ~/.openclaw/skills/webex-summarize/prompts.md <<'MD'
# webex digest
Run the full triage end-to-end:
1. Pull the last 3 days of activity across all spaces and DMs.
2. Filter to threads where I'm @mentioned OR DMs where their message is latest.
3. Cluster the filtered set into topics.
4. Rank by urgency, with a one-line reason per item.
5. For any meeting transcripts in the period, summarize them and split action items as mine vs others'.
6. Draft replies for the top 3 items needing my response — do NOT send.

Output follows the standard persona shape (Summary / Sources / Action items / Suggested next action).

# webex needs-me
Across my Webex spaces and DMs from the last N days (default 3), list only threads awaiting MY reply (I'm @mentioned, or DM where their message is latest). For each: space, who, one-line ask. Exclude anything I've answered.

# webex cluster
Cluster messages from the given scope (default: all my spaces, last 24h) into topics. For each topic: 5-word label, who's involved, 1-line state. Order by activity.

# webex rank
Rank the items I most recently triaged by urgency. Inputs to the score: direct @-mention weight, sender weight, urgency language ("down", "blocked", "asap", "customer"), thread velocity. Show score 1-10 and the ONE reason per item.

# webex summarize-meeting
Download the transcript of the named meeting (default: most recent transcript I have access to). Produce:
- 3-5 sentence summary
- Decisions made
- Open questions
- Action items split as Mine | Others'

# webex draft
For each top item needing my response, draft a short reply. Show them — do NOT send. I will say "send #N" to approve a specific draft.
MD
```

## Use it

```bash
openclaw tui --session digest

# Then in the TUI:
/webex digest
/webex needs-me 7        # last 7 days
/webex cluster
/webex rank
/webex summarize-meeting Platform-sync
/webex draft
```

## How OpenClaw picks up the skill

`openclaw onboard` and `openclaw channels reload` re-scan `~/.openclaw/skills/`. After dropping the files above:

```bash
openclaw channels reload
defenseclaw status | grep -A2 Skill
# the skill scanner (if installed) re-evaluates the new skill
```

## Why no API keys / space IDs in the skill

The skill only contains **prompts** and **tool names**. Webex auth (your OAuth refresh token, client ID/secret) lives in `~/.defenseclaw/.env` from Step 1. Space IDs are looked up at runtime from `webex.list_spaces`. So anyone can install this skill and have it work against their own Webex tenant, no edits needed.

## Customizing per-team

To narrow the scope (only specific spaces), edit the prompt text in `prompts.md` to include filters like:

```
…across my Webex spaces tagged "external", DMs only…
```

The persona handles the global rules (output shape, no auto-send); the skill prompts handle what to read.

[🎉 Series complete →](../series-complete.md){ .md-button .md-button--primary }
