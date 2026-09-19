# LLM Visualizer

A small web app for watching a language model write text one token at a time. You type a prompt
and see how the model breaks it into tokens, how confident it was about each word it picked,
and what else it was considering.

## What it does

- **Tokenization**: see how your prompt is split into tokens.
- **Confidence**: each generated token is colored by how sure the model was about it.
- **Alternatives**: hover a token to see the other options the model had at that point.
- **Streaming**: tokens show up live as they're generated.

Next up: showing which earlier words the model is "paying attention to" for each new token.

## How it's built

A Python backend runs a small open model
([Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)) and streams each
token to a React frontend as it's generated.

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

Then open http://localhost:5173.
