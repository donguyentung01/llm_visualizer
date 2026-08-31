# HTTP API

Base URL in dev: `http://localhost:8000`. Everything returns JSON except `/generate/stream`,
which is an SSE stream. Some endpoints aren't built yet; those are marked below.

## GET /health

```json
{ "ok": true }
```

## POST /tokenize

Splits text into tokens with GPT-2's tokenizer. No model call.

Request:

```json
{ "text": "The strawberry sat." }
```

Response:

```json
{
  "tokens": [
    { "id": 464,   "piece": "The",    "display": "The" },
    { "id": 41236, "piece": "Ġstraw", "display": " straw" },
    { "id": 8396,  "piece": "berry",  "display": "berry" },
    { "id": 3332,  "piece": "Ġsat",   "display": " sat" },
    { "id": 13,    "piece": ".",      "display": "." }
  ]
}
```

- `id` — the integer the model sees.
- `piece` — raw byte-level BPE token. `Ġ` is a leading space, `Ċ` a newline. Shown in the chip tooltip.
- `display` — `tokenizer.decode([id])`. Shown on the chip.

## GET /generate/stream

Token-by-token generation over SSE. Open with `EventSource`.

Query params:

| param | default | notes |
|-------|---------|-------|
| `prompt` | required | URL-encoded |
| `max_tokens` | 32 | |
| `temperature` | 1.0 | applied to logits before softmax |

Events:

```
event: start
data: {"gen_id":"a1b2c3","prompt_tokens":[{"id":464,"display":"The","piece":"The"}, ...]}

event: token
data: {"idx":5,"id":1842,"display":" red","piece":"Ġred","prob":0.34,
       "topk":[{"id":1842,"display":" red","prob":0.34},{"id":2266,"display":" bright","prob":0.11}, ...]}

event: done
data: {"gen_id":"a1b2c3","n_tokens":32}
```

- `idx` — position of the token in `prompt_tokens ++ generated`.
- `prob` — probability the model gave the token it picked. Drives the confidence color.
- `topk` — alternatives at that step, highest first, about 10 of them.
- The client closes the stream on `done` or error. It doesn't resume.
- The server keeps each generation in memory keyed by `gen_id`, capped at ~16 (oldest dropped).

## GET /attention

*Not built yet.* Returns one attention row for a hovered token.

Query params:

| param | example | notes |
|-------|---------|-------|
| `gen_id` | `a1b2c3` | from the `start`/`done` event |
| `token_idx` | 7 | position of the hovered token |
| `layer` | 5 | 0–11 |
| `head` | `mean` | 0–11, or `mean` for the average across heads |

Response:

```json
{ "weights": [0.02, 0.01, 0.40, 0.05, 0.31, 0.14, 0.07, 0.00] }
```

- `weights[k]` is attention from `token_idx` to token `k`. Length is `token_idx + 1`, since a
  token only attends to itself and earlier ones.
- The row sums to about 1. Normalize by the row max for display; don't re-run softmax.
- Comes from one forward pass over the full sequence with `output_attentions=True`, cached per
  `gen_id`.

## GET /models

*Not built yet.* Lets the frontend read layer/head counts instead of hard-coding them.

```json
[ { "id": "gpt2", "n_layers": 12, "n_heads": 12 } ]
```

## Errors

```json
{ "detail": "gen_id not found" }
```

- `404` — unknown `gen_id`.
- `422` — bad request body or query params (FastAPI validation).
