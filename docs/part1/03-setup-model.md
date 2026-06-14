---
title: "Step 3 — Pick your model"
---

# Step 3 — Pick your model

You've got OpenClaw and DefenseClaw installed. Now the agent needs a brain to think with: an LLM. Pick one here, then continue to **Step 4** to set it up.

## Which one fits your setup?

```mermaid
flowchart TD
    A[Pick a model] --> B{Run it locally or<br/>send to the cloud?}
    B -->|Cloud — let someone else host it| C{Which provider?}
    B -->|Local — keep it on your machine| D{Got a GPU?}
    C -->|Anthropic Claude| E[Anthropic]
    C -->|OpenAI GPT| F[OpenAI]
    D -->|Yes — 80GB+ VRAM<br/>e.g. DGX, H100| G[vLLM]
    D -->|No — laptop / small box| H[Ollama]

    style E fill:#eef0ff,stroke:#5a67d8
    style F fill:#eef0ff,stroke:#5a67d8
    style G fill:#e8f5e9,stroke:#16a34a
    style H fill:#e8f5e9,stroke:#16a34a
```

## Cloud or self-hosted? The trade-offs

| | Cost | Privacy | Hardware |
|---|---|---|---|
| **Cloud** (Anthropic, OpenAI) | Paid per request | Data leaves your machine | None |
| **Self-hosted** (vLLM, Ollama) | Free | Stays on yours | NVIDIA GPU (vLLM) or 4 GB+ RAM (Ollama) |

!!! tip "What we used"
    Self-hosted vLLM with `gpt-oss-120b` on a DGX Spark.

## Choose your model

<div class="step-grid" markdown>
<div markdown>

#### Cloud

<ul class="step-list">
  <li><a href="../step3-anthropic/"><span class="step-num">A</span> Anthropic</a></li>
  <li><a href="../step3-openai/"><span class="step-num">O</span> OpenAI</a></li>
</ul>

</div>
<div markdown>

#### Self-hosted

<ul class="step-list">
  <li><a href="../step3-vllm/"><span class="step-num">V</span> vLLM (big GPU)</a></li>
  <li><a href="../step3-ollama/"><span class="step-num">O</span> Ollama (any box)</a></li>
</ul>

</div>
</div>
