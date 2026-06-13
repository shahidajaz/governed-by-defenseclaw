---
title: "Step 3 — Set up your model"
---

# Step 3 — Set up your model

You've got OpenClaw and DefenseClaw installed. Now the agent needs a brain to think with: an LLM. Pick one here, and Step 4 will continue from your choice.

## Pick your path: Cloud or Self-hosted LLM

| | Cost | Privacy | Hardware |
|---|---|---|---|
| **Cloud** (Anthropic, OpenAI, Groq) | Paid per request | Data leaves your machine | None |
| **Self-hosted** (vLLM, Ollama) | Free | Stays on yours | NVIDIA GPU (vLLM) or 4 GB+ RAM (Ollama) |

!!! tip "What we used"
    Self-hosted vLLM with `gpt-oss-120b` on a DGX Spark.

=== "Cloud"

    ### 3.1 — Get an API key

    === "Anthropic"

        **Best for:** balanced quality, well-tuned for agent use, fast.

        1. Go to **[console.anthropic.com](https://console.anthropic.com){ target="_blank" }** and sign in.
        2. Click **Settings → API Keys → Create Key**.
        3. Give it a name (e.g. `dc-installer-demo`), pick a workspace, click **Create**.
        4. **Copy the key**, it starts with `sk-ant-...`. You won't see it again.
        5. Add credits at **Settings → Plans & Billing**.

    === "OpenAI"

        **Best for:** widest model selection, GPT-4 family, the o-series reasoning models.

        1. Go to **[platform.openai.com](https://platform.openai.com){ target="_blank" }** and sign in.
        2. Click your profile (top-right) → **View API Keys**.
        3. Click **+ Create new secret key**, name it, click **Create**.
        4. **Copy the key**, it starts with `sk-...`. You won't see it again.
        5. Add credits at **Settings → Billing → Add to credit balance**.

    === "Groq"

        **Best for:** very fast inference, generous free tier.

        1. Go to **[console.groq.com](https://console.groq.com){ target="_blank" }** and sign in with Google or email.
        2. Click **API Keys → Create API Key**, name it, click **Submit**.
        3. **Copy the key**, it starts with `gsk_...`.
        4. Free tier covers thousands of requests/day. No card needed.

    === "Others"

        OpenClaw also supports **OpenRouter**, **Mistral**, **Cohere**, **AWS Bedrock**, **Azure OpenAI**, and **Google Vertex AI**. Same pattern: grab a key from the provider's console, export it, paste it into the OpenClaw wizard.

        | Provider | Console | Env var |
        |---|---|---|
        | OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys){ target="_blank" } | `OPENROUTER_API_KEY` |
        | Mistral | [console.mistral.ai](https://console.mistral.ai){ target="_blank" } | `MISTRAL_API_KEY` |
        | Cohere | [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys){ target="_blank" } | `COHERE_API_KEY` |
        | AWS Bedrock | AWS IAM (`AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`) | (none) |
        | Azure OpenAI | Azure Portal | `AZURE_OPENAI_API_KEY` |

    ### 3.2 — Save the key to your shell

    === "Anthropic"

        ```bash
        grep -q ANTHROPIC_API_KEY ~/.bashrc || echo 'export ANTHROPIC_API_KEY=sk-ant-...' >> ~/.bashrc
        ```

        ```bash
        export ANTHROPIC_API_KEY=sk-ant-...
        ```

    === "OpenAI"

        ```bash
        grep -q OPENAI_API_KEY ~/.bashrc || echo 'export OPENAI_API_KEY=sk-...' >> ~/.bashrc
        ```

        ```bash
        export OPENAI_API_KEY=sk-...
        ```

    === "Groq"

        ```bash
        grep -q GROQ_API_KEY ~/.bashrc || echo 'export GROQ_API_KEY=gsk_...' >> ~/.bashrc
        ```

        ```bash
        export GROQ_API_KEY=gsk_...
        ```

    ### 3.3 — Quick check (optional)

    Confirm the key works before moving on.

    === "Anthropic"

        ```bash
        curl -s -H "x-api-key: $ANTHROPIC_API_KEY" -H "anthropic-version: 2023-06-01" https://api.anthropic.com/v1/models | head -c 200
        ```

    === "OpenAI"

        ```bash
        curl -s -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models | head -c 200
        ```

    === "Groq"

        ```bash
        curl -s -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models | head -c 200
        ```

    ??? note "Expected output"
        JSON listing the models available to your key

    ---

    Your model is a hosted API. Nothing else to run.

    [Continue to Step 4A →](04a-cloud.md){ .md-button .md-button--primary }

=== "Self-hosted"

    ### 3.1 — Get a model server running

    === "vLLM"

        **What you'll get:** a 120B-parameter open-weight model served by vLLM in Docker, with an OpenAI-compatible API at `127.0.0.1:8000/v1`. This is what we ran in the lab.

        **Hardware:** NVIDIA GPU with **≥80 GB VRAM** (DGX Spark, H100). For lighter machines, use the Ollama tab.

        Pull and run:

        ```bash
        docker run -d --name vllm --gpus all --shm-size 16g \
          -p 127.0.0.1:8000:8000 \
          -v ~/.cache/huggingface:/root/.cache/huggingface \
          nvcr.io/nvidia/vllm:25.12.post1-py3 \
            --model openai/gpt-oss-120b \
            --served-model-name local-llm \
            --max-model-len 32768
        ```

        The `--served-model-name local-llm` is **not optional**. It's what makes DefenseClaw's guardrail classify the provider correctly. Without it the model id comes back as `openai/gpt-oss-120b` and the guardrail tries to route it as cloud OpenAI.

        First start downloads the weights (~240 GB). Subsequent starts are seconds.

        Watch it come up:

        ```bash
        docker logs -f vllm | grep -iE 'application startup complete|listening|loaded'
        ```

        Wait for `Application startup complete.` Typically 2–5 minutes after the weights are cached.

    === "Ollama"

        **What you'll get:** a small 3B-parameter model served by Ollama with an OpenAI-compatible API at `127.0.0.1:11434/v1`. Lighter than vLLM, no GPU required, runs on any Linux box with **4 GB+ RAM**. Good for a quick smoke test of the governance stack without standing up a big-GPU server.

        **Hardware:** any Linux box (same one running OpenClaw and DefenseClaw). ~3 GB disk for the model.

        Install Ollama:

        ```bash
        curl -fsSL https://ollama.com/install.sh | sh
        ```

        Installs a systemd service that auto-starts.

        Pull a small model:

        ```bash
        ollama pull llama3.2:3b
        ```

        ~2 GB download. Other small picks:

        | Model | Size | Memory | Quality |
        |---|---|---|---|
        | `llama3.2:1b` | 1.3 GB | 2 GB | Fast, lower quality |
        | `llama3.2:3b` *(recommended)* | 2.0 GB | 4 GB | Balanced |
        | `qwen2.5:7b` | 4.7 GB | 8 GB | Better quality if you have RAM |
        | `phi3.5:3.8b` | 2.2 GB | 4 GB | Microsoft small model |

    ### 3.2 — Confirm it answers

    === "vLLM"

        ```bash
        curl -s http://127.0.0.1:8000/v1/models | python3 -m json.tool | head
        ```

        ??? note "Expected output"
            a JSON `data` array with an `id` field. With `--served-model-name local-llm`, that id is `local-llm`

    === "Ollama"

        ```bash
        curl -s http://127.0.0.1:11434/api/tags | python3 -m json.tool | head
        ```

        ??? note "Expected output"
            a `models` array with the model name (e.g. `llama3.2:3b`)

    !!! warning "Serve a clean model alias (vLLM only)"
        If your model id comes back with a provider prefix like `openai/gpt-oss-120b`, DefenseClaw's guardrail will misclassify it as `openai` and break. Re-serve with `--served-model-name local-llm`. Ollama doesn't have this problem.

    ### 3.3 — Sanity-check a real prompt

    === "vLLM"

        ```bash
        curl -s http://127.0.0.1:8000/v1/chat/completions \
          -H 'Content-Type: application/json' \
          -d '{"model":"local-llm","messages":[{"role":"user","content":"Capital of Pakistan? One word."}],"max_tokens":50}' \
          | python3 -m json.tool | grep -iE 'content|finish'
        ```

    === "Ollama"

        ```bash
        curl -s http://127.0.0.1:11434/v1/chat/completions \
          -H 'Content-Type: application/json' \
          -d '{"model":"llama3.2:3b","messages":[{"role":"user","content":"Capital of Pakistan? One word."}],"max_tokens":50}' \
          | python3 -m json.tool | grep -iE 'content|finish'
        ```

    ??? note "Expected output"
        `"content": "Islamabad"`

    ---

    Your model server is running. Note your **base URL** and **model id**. You'll paste them into the OpenClaw wizard in Step 4B.

    [Continue to Step 4B →](04b-vllm.md){ .md-button .md-button--primary }
