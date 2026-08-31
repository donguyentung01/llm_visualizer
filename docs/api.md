# HTTP API contract

Base URL in dev: `http://localhost:8000`. All responses are JSON except the SSE stream.

This is the target contract for the MVP. Endpoints land across phases — see the roadmap in the
[README](../README.md). Anything not yet built is marked _(planned)_.

---

## `GET /health`

Liveness check.

**Response**

```json
{ "ok": true }
```

---

## `POST /tokenize`  _(Phase 1)_

Split text into tokens using the model's tokenizer. No model forward pass — fast.

**Request**

```json
{ "text": "The strawberry sat." }
```

**Response**

```json
{
  "tokens": [
    { "id": 464,   "piece": "The",   "display": "The" },
    { "id": 41236, "piece": "Ġstraw", "display": " straw" },
    { "id": 8396,  "piece": "berry",  "display": "berry" },
    { "id": 3332,  "piece": "Ġsat",   "display": " sat" },
    { "id": 13,    "piece": ".",      "display": "." }
  ]
}
```

- `id` — the integer the model actually sees.
- `piece` — raw byte-level-BPE token. `Ġ` = leading space, `Ċ` = newline. Show this in the
  hover tooltip so the whitespace-is-part-of-the-token idea is visible.
- `display` — `tokenizer.decode([id])`, human-readable. Render this on the chip.

---

## `GET /generate/stream`  _(Phase 2)_

Streaming token-by-token generation over Server-Sent Events. Open with `EventSource`.

**Query params**

| param | default | notes |
|-------|---------|-------|
| `prompt` | _(required)_ | URL-encoded |
| `max_tokens` | `32` | |
| `temperature` | `1.0` | applied to logits before softmax |

**Event stream**

```
event: start
data: {"gen_id":"a1b2c3…","prompt_tokens":[{"id":464,"display":"The","piece":"The"}, …]}

event: token
data: {"idx":5,"id":1842,"display":" red","piece":"Ġred","prob":0.34,
       "topk":[{"id":1842,"display":" red","prob":0.34},{"id":2266,"display":" bright","prob":0.11}, …]}

event: token
data: { … one per decode step … }

event: done
data: {"gen_id":"a1b2c3…","n_tokens":32}
```

- `idx` — global position of the token in `prompt_tokens ++ generated`.
- `prob` — probability the model assigned to the token it emitted (drives the confidence color).
- `topk` — the alternatives considered at that step, highest first (~10).
- The client must `EventSource.close()` on `done` and on error — the stream is not resumable.
- Server keeps the full generation (final `input_ids`, per-token records) in memory keyed by
  `gen_id`, capped at ~16 generations (oldest evicted).

---

## `GET /attention`  _(Phase 5)_

One attention row for a hovered token. Small payload — never returns the full tensor.

**Query params**

| param | example | notes |
|-------|---------|-------|
| `gen_id` | `a1b2c3…` | from the stream's `done`/`start` event |
| `token_idx` | `7` | global index of the hovered token |
| `layer` | `5` | `0..11` for GPT-2 small |
| `head` | `mean` | `0..11`, or `mean` for the average across heads |

**Response**

```json
{ "weights": [0.02, 0.01, 0.40, 0.05, 0.31, 0.14, 0.07, 0.00] }
```

- `weights[k]` = attention from `token_idx` to token `k`. Length is `token_idx + 1` (causal:
  a token attends only to itself and earlier).
- Row sums to ~1. Normalize by the row max for display alpha; don't re-softmax.
- Computed from a single forward pass over the full realized sequence with
  `output_attentions=True`, cached per `gen_id` on first request.

---

## `GET /models`  _(Phase 6, optional)_

Registry so the frontend doesn't hard-code layer/head counts.

**Response**

```json
[ { "id": "gpt2", "n_layers": 12, "n_heads": 12 } ]
```

---

## Errors

Standard FastAPI shape:

```json
{ "detail": "gen_id not found" }
```

- `404` — unknown `gen_id` (evicted or never existed).
- `422` — malformed request body / query params (FastAPI validation).
