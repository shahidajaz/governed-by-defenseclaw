---
title: "Step 8 — Skill + MCP scanners"
---

# Step 8 — Skill + MCP scanners

Throughout the install you'll have seen warnings:

```
! Skill scanner  'skill-scanner' not on PATH
! MCP scanner    'mcp-scanner' not on PATH
```

These are two optional binaries, separate downloads, that scan **agent skill files** and **MCP server configs** at rest, looking for credentials in plaintext, dangerous capabilities, suspicious tool definitions, etc. They complement the runtime prompt-scanner (which is what fires `sev=HIGH` in your demo).

!!! warning "Scanner binaries ship separately from DefenseClaw"
    `defenseclaw setup skill-scanner` and `defenseclaw setup mcp-scanner` only **configure** the analyzers — they don't download the binaries. Install `skill-scanner` and `mcp-scanner` on PATH from NVIDIA's distribution before running the setup commands, or the readiness checks will keep saying "not on PATH".

## Configure (after the binaries are on PATH)

```bash
defenseclaw setup skill-scanner
defenseclaw setup mcp-scanner
```

Each wizard asks about analyzers (behavioral / LLM / meta / trigger / VirusTotal / Cisco AI Defense), LLM provider for the LLM analyzer (if enabled), and policy preset.

!!! tip "If you don't have an LLM key for the LLM analyzer"
    Answer **N** to "Enable LLM analyzer". The behavioral / YARA analyzers work without any LLM. Saying yes without a real key writes broken config and the scanner will fail on every run.

## Verify

```bash
which skill-scanner mcp-scanner
defenseclaw status | grep -E 'Skill scanner|MCP scanner'
```

??? note "Expected output (when binaries are installed)"
    ```
    /usr/local/bin/skill-scanner
    /usr/local/bin/mcp-scanner
      ✓ Skill scanner  available
      ✓ MCP scanner    available
    ```

## Running the scanners

There is no top-level `defenseclaw scan` subcommand — the scanners are invoked indirectly. They run during gateway startup against the directories DefenseClaw watches, or via the standalone binaries:

```bash
# Standalone — point at a directory of skills/MCP configs
skill-scanner --path ~/.openclaw/skills
mcp-scanner --path ~/.openclaw/mcp

# Inside DefenseClaw — see what it reports during status
defenseclaw status
```

## Findings shape

When a scanner fires, output is one block per finding:

??? note "Example finding"
    ```
      Skill: example-tool
      ───────────────────
      Severity:    MEDIUM
      Category:    CRED-IN-SOURCE
      File:        ~/.openclaw/skills/example-tool/handler.py:24
      Snippet:     api_key = "sk-..."
      Suggestion:  Move secret to env var or secrets manager
    ```

Findings flow into the same `audit.db` your Splunk dashboard reads, they'll show up alongside the prompt-scan verdicts in the SIEM view.

## If you don't have the scanner binaries yet

For the purposes of the demo, you can ship without them. CodeGuard (built into DefenseClaw, no install needed) covers the runtime prompt-scan path that Step 4 verifies. Skill/MCP scanners are catalog scanning — pair them with action mode + the sandbox for the full "every artifact governed" story.

[Continue to Other observability tools →](09-observability.md){ .md-button .md-button--primary }
