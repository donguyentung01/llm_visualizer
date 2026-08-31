# LLM Token & Attention Visualizer

An interactive web app for seeing **how an LLM generates text, one token at a time** — the
tokenization itself, the model's confidence in each token it picks, the alternatives it
considered, and the attention patterns linking each generated token back to earlier ones.

Built to be genuinely educational: you watch the mechanics of generation, not just the output.

> Primary model: **GPT-2 small (124M)** — small enough to run on CPU, simple enough to introspect
> cleanly (`output_attentions=True`, per-step logits), and rough enough that confidence drops are
> visible when it rambles.

See [`design_doc.MD`](./design_doc.MD) for the full vision and
[`docs/api.md`](./docs/api.md) for the HTTP contract.

---

## Features

The MVP targets the first five visualizations from the design doc:

| # | Feature | What you see |
|---|---------|--------------|
| 1 | Tokenization view | Prompt splits into colored chips; hover a chip for its token ID |
| 2 | Confidence heatmap | Each generated token is shaded green→red by the probability the model gave it |
| 3 | Probability popover | Hover a token to see the top-k alternatives it weighed, with probabilities |
| 4 | Attention relighting | Hover a token to shade every earlier token by how much attention it received |
| 5 | Layer/head selector | Choose which attention layer/head (or the mean) drives the relighting |

Generation **streams** — tokens appear one at a time via Server-Sent Events.

Deferred (see roadmap): click-to-branch, model switcher + side-by-side, "guess the next token".

---

## Tech stack

- **Backend:** Python + FastAPI, Hugging Face `transformers` + `torch` (CPU), `sse-starlette`
  for streaming. A custom token-by-token generation loop (not `.generate()`) so each step's
  logits, top-k, and attention can be captured.
- **Frontend:** React + Vite, native `EventSource` for the token stream.

---

## Project structure

```
llm_visualizer/
├── design_doc.MD          # vision, feature priority, model rationale
├── docs/
│   └── api.md             # HTTP endpoint contract
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py        # FastAPI app, CORS, route wiring
│       ├── models.py      # model/tokenizer registry + cache        (Phase 1+)
│       ├── generate.py    # streaming token-by-token loop           (Phase 2)
│       ├── stream.py      # SSE wrapper for the generation loop     (Phase 2)
│       ├── attention.py   # full-sequence forward pass + cache      (Phase 5)
│       └── store.py       # in-memory generation store              (Phase 2)
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js
        ├── lib/           # color mapping, useGeneration hook
        └── components/    # PromptInput, TokenChip, TokenStream, ProbPopover, LayerHeadSelector
```

---

## Getting started

### Prerequisites

- Python 3.11+ (developed on 3.14)
- Node 18+ (developed on 26)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt          # installs the CPU torch build
uvicorn app.main:app --reload --port 8000
```

Check it: `curl -s localhost:8000/health` → `{"ok":true}`

The first request that loads GPT-2 downloads the tokenizer (~1–2 MB) and, from Phase 2 on, the
model weights (~500 MB) into `~/.cache/huggingface/`.

### Frontend

```bash
cd frontend
npm install
npm run dev                              # http://localhost:5173
```

The dev server expects the backend on `http://localhost:8000` (allowed origin is set in
`backend/app/main.py`).

---

## How generation works (short version)

1. **Tokenize** — the prompt is split into integer token IDs by GPT-2's byte-level BPE tokenizer.
   No model forward pass; instant.
2. **Generate** — a custom loop runs the model one step at a time. Each step: forward pass →
   logits for the next position → softmax → record the chosen token, its probability, and the
   top-k alternatives → append and repeat. Each step is pushed to the browser as an SSE event.
3. **Attention** — after generation, one forward pass over the full realized sequence with
   `output_attentions=True` produces the 12×12 layer/head attention tensors, cached server-side.
   The frontend fetches a single attention row per hover.

The off-by-one that matters everywhere: `logits[0, i]` is the distribution over token `i+1`.

---

## Roadmap

- [x] **Phase 0** — scaffold, `/health`, CORS, frontend talks to backend
- [ ] **Phase 1** — `/tokenize` + token chips with hover IDs (Feature 1)
- [ ] **Phase 2** — streaming generation loop + SSE + in-memory store
- [ ] **Phase 2b** — `EventSource` wiring, chips animate in
- [ ] **Phase 3** — confidence heatmap (Feature 2)
- [ ] **Phase 4** — probability popover (Feature 3)
- [ ] **Phase 5** — attention relighting + `/attention` endpoint (Feature 4)
- [ ] **Phase 6** — layer/head selector (Feature 5)

Later: click-to-branch, model switcher + side-by-side comparison, guess-the-next-token,
confidence sparkline, attention head grid, logit lens.
