# Frontend

React + Vite. See the [root README](../README.md) for the overview and [API docs](../docs/api.md)
for the endpoints.

## Run

```bash
npm install
npm run dev
```

Serves on http://localhost:5173 and expects the backend on port 8000.

## Layout

- `src/api.js` — fetch wrappers
- `src/lib/useGeneration.js` — opens the `EventSource`, collects streamed tokens into state
- `src/lib/color.js` — probability to color, attention weight to opacity
- `src/components/` — `PromptInput`, `TokenChip`, `TokenStream`, `ProbPopover`, `LayerHeadSelector`

## Scripts

- `npm run dev` — dev server
- `npm run build` — build to `dist/`
- `npm run lint` — ESLint
