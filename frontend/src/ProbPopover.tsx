import { Fragment } from "react";
import type { GeneratedToken } from "./types";

interface Props {
  token: GeneratedToken;
  rect: DOMRect;
}

// Floating card showing the top-k tokens the model weighed at this step.
// pointer-events: none so the mouse never enters it — no fall-off, no timers.
function ProbPopover({ token, rect }: Props) {
  const max = token.topk[0]?.prob ?? 1;
  const left = Math.min(rect.left, window.innerWidth - 250);
  const top = rect.bottom + 6;

  return (
    <div
      style={{
        position: "fixed",
        left,
        top,
        width: 232,
        pointerEvents: "none",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        boxShadow: "0 8px 28px rgba(0, 0, 0, 0.14)",
        padding: "10px 12px",
        zIndex: 50,
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--muted)",
          marginBottom: 8,
        }}
      >
        considered instead
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "3px 8px",
          alignItems: "center",
          fontFamily: "var(--mono)",
          fontSize: 11,
        }}
      >
        {token.topk.map((e) => {
          const chosen = e.id === token.id;
          return (
            <Fragment key={e.id}>
              <span
                style={{
                  whiteSpace: "pre",
                  color: chosen ? "var(--text)" : "var(--muted)",
                  fontWeight: chosen ? 700 : 400,
                }}
              >
                {e.display}
              </span>
              <span
                style={{
                  height: 7,
                  borderRadius: 3,
                  background: "var(--accent)",
                  opacity: chosen ? 1 : 0.55,
                  width: `${Math.max(2, (e.prob / max) * 100)}%`,
                }}
              />
              <span style={{ color: "var(--muted)", textAlign: "right" }}>
                {e.prob.toFixed(3)}
              </span>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default ProbPopover;
