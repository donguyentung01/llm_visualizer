# LLM Visualizer

A small web app for watching a language model generate text one token at a time. You type a
prompt and see how it gets split into tokens, how confident the model was about each token it
picked, and which other tokens it was considering.

## What it does

- **Tokenization**: the prompt is shown as token chips. Hover a chip to see its token ID.
- **Confidence**: each generated token is colored by the probability the model gave it.
- **Alternatives**: hover a generated token to see the top 10 candidates at that step and their
  probabilities.
- **Streaming**: tokens show up as they're generated.

Attention visualization (which earlier tokens each new token attends to) is next on the list.

## How it works

The backend is FastAPI running
[Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct) through Hugging Face
`transformers`. I use my own generation loop instead of `model.generate()` so I can grab the
probability distribution at every step. It uses the KV cache, and the tokens are streamed to the
browser over server-sent events. The model loads in bf16 and runs fine on CPU.

The frontend is React + TypeScript (Vite). It reads the stream with `EventSource`.

The endpoints are described in [`docs/api.md`](./docs/api.md).

## Running locally

Backend:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Then open http://localhost:5173. The model weights (~1 GB) are downloaded the first time you
generate something.
