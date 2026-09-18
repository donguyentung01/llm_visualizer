import { useRef } from "react";
import { MAX_TOKENS_LIMIT } from "./useGeneration";

interface Props {
  onSubmit: (text: string) => void;
  large?: boolean;
  model?: string;
  maxTokens: number;
  onMaxTokensChange: (n: number) => void;
}

function PromptInput({ onSubmit, large = false, model, maxTokens, onMaxTokensChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleClick() {
    const el = ref.current;
    if (!el) return;
    const text = el.value;
    if (!text.trim()) return;
    onSubmit(text);
    el.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Enter submits, Shift+Enter makes a newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      className="prompt-box"
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--surface)",
        padding: large ? "16px 16px 12px" : "11px 12px 9px",
        transition: "border-color 120ms",
      }}
    >
      <textarea
        ref={ref}
        rows={large ? 3 : 2}
        placeholder="Enter a prompt…"
        onKeyDown={handleKeyDown}
        style={{
          display: "block",
          width: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          color: "var(--text)",
          font: `${large ? 15 : 13}px/1.5 var(--sans)`,
          resize: "none",
          padding: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginTop: large ? 10 : 6,
        }}
      >
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
          {model}
        </span>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--muted)",
          }}
        >
          max tokens
          <input
            type="number"
            min={1}
            max={MAX_TOKENS_LIMIT}
            value={maxTokens}
            onChange={(e) => {
              const n = Math.round(Number(e.target.value));
              if (Number.isFinite(n)) onMaxTokensChange(Math.min(MAX_TOKENS_LIMIT, Math.max(1, n)));
            }}
            style={{
              width: 56,
              padding: "2px 6px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "transparent",
              color: "var(--text)",
              font: "inherit",
            }}
          />
        </label>
        <button
          onClick={handleClick}
          aria-label="Generate"
          title="Generate"
          style={{
            flexShrink: 0,
            width: large ? 34 : 30,
            height: large ? 34 : 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 13V3" />
            <path d="M3.5 7.5 8 3l4.5 4.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PromptInput;
