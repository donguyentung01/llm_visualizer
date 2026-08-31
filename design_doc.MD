# LLM Token & Attention Visualizer — Design Doc

## Overview
An interactive web app for visualizing how an LLM generates text, token by token — showing token-level confidence (probability), attention patterns between tokens, and tokenization itself. Built to be genuinely educational (not just a pretty UI), letting users see the mechanics behind generation rather than just the output.

**Differentiation from existing tools (e.g. BertViz):** BertViz is a Python/Jupyter attention-inspection library for static text. This project is a live, streaming, browser-based app that combines attention *and* probability in one unified view, supports live generation (not just inspection of pre-existing text), and adds interactive/playful elements (branching, model comparison, guess-the-next-token).

## Goals
- Make LLM internals (tokenization, next-token probability, attention) visible and explorable, not just described
- Feel like a toy to play with, not a research instrument
- Support comparing models directly (old vs. modern, small vs. large)

## Model choice
- **Primary: GPT-2 small (124M params)** — simple architecture, no speculative decoding, clean `transformers` support for `output_attentions=True`, runs on CPU/modest GPU, and its rougher output is pedagogically useful (visible confidence drops when it rambles).
- **Secondary option: Qwen2.5-0.5B or SmolLM2-360M** — similar size class, modern training, more coherent/lightly instruction-tuned output, same ease of introspection.
- **Considered and set aside: Meta's Muse Glimmer (30B)** — capable open-weight model (Aug 2026 release) but requires 18–20GB VRAM even quantized, and uses a speculative-decoding "drafter" model that complicates clean per-token logprob/attention extraction. Not a good fit for this project's hardware/complexity constraints.
- **Design for multi-model switching** from the start: backend model registry (ID → HF path + layer/head count), in-memory cache of loaded models, consistent API contract across models so the frontend doesn't special-case.

## Architecture
- **Backend:** Python + FastAPI (or Flask), using Hugging Face `transformers` (not `transformers.js`, to get full logits/attention access and avoid client download size/hardware limits).
- **Custom token-by-token generation loop** (not the `.generate()` shortcut) so each step's data (chosen token, full/top-k probability distribution, attention weights) can be captured and streamed.
- **Streaming to frontend** via Server-Sent Events or WebSocket.
- **Attention payload size:** only send the attention data for the layer/head currently selected in the UI, not the full tensor every step — full tensors get large fast (e.g., GPT-2 small = 12 layers × 12 heads per step).
- **Frontend:** React.

## Core user workflow
1. **User enters a prompt** in a chat-style input (like this interface).
2. **User hits Generate** — prompt appears as a chat bubble, then visually splits in place into colored token chips (tokenization view). This step needs no model forward pass — tokenizer only — so it's instant.
   - Hovering a token chip shows its token ID (the integer the model actually sees).
   - Odd/rare-word splits are visually obvious since they break into more, smaller pieces.
3. **Generation streams in**, one token at a time, each colored by its confidence (probability) as it appears — green (confident) to red (uncertain).
4. **Hover any generated token** to reveal, simultaneously but in separate visual channels (to avoid crowding):
   - **Attention → background relighting.** All earlier tokens (prompt *and* prior output — attention is causal and spans the whole sequence so far, not just the prompt) get their background shaded by how much attention weight the hovered token gave them.
   - **Probability → floating popover.** A small card near the cursor shows the top-k alternative tokens the model considered instead, each with its probability.
   - Default to an attention average across heads on hover, with an optional layer/head selector for users who want to dig into specific heads.
5. **Click a token** to branch: regenerate from that point using a different alternative token, showing the new continuation (possibly alongside the original as a "ghost" branch for comparison).

## Visualization features (priority order)
1. Tokenization view (input split into chips, IDs on hover)
2. Confidence heatmap on generated tokens
3. Probability bar chart / popover on hover or click
4. Attention background-relighting on hover
5. Layer/head selector for attention
6. Click-to-branch (regenerate from an alternative token)
7. Model switcher + side-by-side comparison mode (same prompt, two models, diverging confidence/attention shown directly)
8. "Guess the next token" game (user guesses before the model reveals its top-5)

## Stretch / future ideas
- Confidence sparkline under the full response (shape of confidence across the whole generation)
- Attention head/layer grid overview (small multiples across all heads)
- "Spotlight" mode: hover an input word, see how much every output token attended back to it
- Temperature/top-k/top-p playground with live-animating probability distribution
- Greedy vs. sampled vs. beam search comparison on the same prompt
- Perplexity meter on user-pasted text (how "surprised" the model is by human-written input)
- Embedding neighbor explorer (nearest neighbors of a clicked token)
- Context window visualizer (how much of the window is filled)
- "Same prompt, different model size" ladder (GPT-2 small/medium/large/XL side by side)
- Logit lens (intermediate-layer predictions projected through the output head)

## Open questions / things to validate while building
- Exact UX for the layer/head selector so it doesn't compete with the hover interactions
- How branching state is represented in React (tree-like, not linear)
- Whether averaged-attention-on-hover is intuitive enough as a default, or needs a first-run explainer
