# Frontend — LLM Token & Attention Visualizer

React + Vite. See the [root README](../README.md) for the full project overview and the
[API contract](../docs/api.md) for the endpoints this talks to.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

Expects the backend running on `http://localhost:8000` (see `../backend`).

## Layout

- `src/api.js` — fetch wrappers
- `src/lib/useGeneration.js` — opens the `EventSource`, accumulates streamed tokens into state
- `src/lib/color.js` — probability → color, attention weight → alpha
- `src/components/` — `PromptInput`, `TokenChip`, `TokenStream`, `ProbPopover`, `LayerHeadSelector`

## Scripts

- `npm run dev` — dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint
