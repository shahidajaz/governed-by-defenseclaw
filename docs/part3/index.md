---
title: "Part 3 — Webex Triage Assistant"
---

# Part 3 — Webex Triage Assistant

Turn the governed agent into a Webex triage assistant over the official Webex REST API, it reads your spaces and DMs, tells you what needs your response, clusters topics, ranks urgency, and summarizes meetings. Every step observable; every call audited.

![Part 3 architecture](../assets/part3.png)

## What you'll build

- A **Webex assistant** that tells you what actually needs your attention
- **Meeting summaries** with your action items pulled out
- **Draft replies you review** before anything is sent

## Before you start

- Make sure you've completed [Part 1](../part1/index.md) & [Part 2](../part2/index.md)
- A [Webex developer account](https://developer.webex.com){ target="_blank" rel="noopener" }

## How it works

Three layers, working together:

- **Access**, talks to Webex via its official REST API
- **Reasoning**, the local LLM does the thinking (needs-me, clustering, ranking, summaries, drafts)
- **Governance**. DefenseClaw watches and audits every Webex call

## Project Steps

<div class="step-grid" markdown>
<div markdown>

### Setup + stages

<ul class="step-list">
  <li><a href="phase-0/"><span class="step-num">0</span> Prereqs</a></li>
  <li><a href="phase-1/"><span class="step-num">1</span> Webex OAuth</a></li>
  <li><a href="phase-2/"><span class="step-num">2</span> Wire Webex as tools</a></li>
  <li><a href="phase-3/"><span class="step-num">3</span> Stage 1. Read</a></li>
  <li><a href="phase-4/"><span class="step-num">4</span> Stage 2. Needs me</a></li>
  <li><a href="phase-5/"><span class="step-num">5</span> Stage 3. Cluster</a></li>
</ul>

</div>
<div markdown>

### Stages + wrap-up

<ul class="step-list">
  <li><a href="phase-6/"><span class="step-num">6</span> Stage 4. Rank</a></li>
  <li><a href="phase-7/"><span class="step-num">7</span> Stage 5. Meetings</a></li>
  <li><a href="phase-8/"><span class="step-num">8</span> Stage 6. Drafts</a></li>
  <li><a href="phase-9/"><span class="step-num">9</span> Assemble the digest</a></li>
  <li><a href="phase-10/"><span class="step-num">10</span> Governance &amp; audit</a></li>
  <li><a href="webhooks/"><span class="step-num step-num--dash">—</span> Webhooks (optional)</a></li>
</ul>

</div>
</div>

[Start Step 0. Prerequisites →](phase-0.md){ .md-button .md-button--primary }
