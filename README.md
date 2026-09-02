# LLM Token & Attention Visualizer

A web app that shows what happens inside GPT-2 as it generates text: how the prompt is
tokenized, how confident the model is in each token it picks, what alternatives it considered,
and which earlier tokens each new token attends to.

Model is GPT-2 small (124M). It runs on CPU and exposes per-step logits and attention cleanly,
which is what this needs.

## What it does

1. **Tokenization** — the prompt splits into chips; hover one to see its token ID.
2. **Confidence** — generated tokens are shaded green to red by the probability the model gave them.
3. **Alternatives** — hover a token to see the top-k candidates it weighed and their probabilities.
4. **Attention** — hover a token to shade every earlier token by how much attention it got.
5. **Layer/head** — pick which attention layer and head (or the average) drives the shading.

Generation streams token by token over SSE.

## Stack

- Backend: FastAPI, Hugging Face `transformers`, `torch` (CPU), `sse-starlette`. Generation runs
  as a custom step-by-step loop rather than `model.generate()` so each step's logits, top-k, and
  attention can be captured.
- Frontend: React + Vite, `EventSource` for the token stream.

See [`docs/api.md`](./docs/api.md) for the HTTP endpoints and [`design_doc.MD`](./design_doc.MD)
for background.

## Running it

Backend:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend expects the backend on port 8000.

The first generation downloads GPT-2's weights (~500 MB) to `~/.cache/huggingface/`.

## Layout

```
backend/app/
  main.py        FastAPI app, routes, CORS
  llm.py         tokenizer + model loading and cache
  generate.py    streaming generation loop
  stream.py      SSE endpoint
  attention.py   full-sequence forward pass for attention
  store.py       in-memory store of past generations
frontend/src/
  api.js         fetch wrappers
  lib/           useGeneration hook, color mapping
  components/    PromptInput, TokenChip, TokenStream, ProbPopover, LayerHeadSelector
```

## Status

Early. Scaffold and `/health` are in; tokenization, streaming generation, and the attention
views are in progress. Planned later: regenerate from an alternative token, model switcher with
side-by-side comparison, guess-the-next-token.
