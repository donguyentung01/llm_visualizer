import type { Token, GeneratedToken } from "./types";
import { probToColor } from "./lib/color";

interface Props {
  token: Token | GeneratedToken;
  onHover?: (token: GeneratedToken, rect: DOMRect) => void;
  onLeave?: () => void;
}

function TokenChip({ token, onHover, onLeave }: Props) {
  // generated tokens carry a probability; prompt tokens don't
  const gen = "prob" in token ? token : null;

  // leading space -> faint dot; each newline -> a ↵ glyph (the line break itself
  // is rendered by TokenStream, this just keeps the chip one row tall)
  const lead = token.display.startsWith(" ");
  const body = (lead ? token.display.slice(1) : token.display).replace(/\r\n?|\n/g, "↵");
  const whitespaceOnly = token.display.trim() === "";

  return (
    <span
      title={gen ? `id: ${token.id} · p=${gen.prob.toFixed(3)}` : `id: ${token.id}`}
      onMouseEnter={
        gen && onHover
          ? (e) => onHover(gen, e.currentTarget.getBoundingClientRect())
          : undefined
      }
      onMouseLeave={gen ? onLeave : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        verticalAlign: "middle",
        fontFamily: "var(--mono)",
        fontSize: 12.5,
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: "1px 3px",
        margin: "0 1px 3px 0",
        whiteSpace: "pre",
        background: gen ? probToColor(gen.prob) : "var(--surface)",
        opacity: whitespaceOnly ? 0.55 : 1,
        cursor: gen ? "help" : "default",
        animation: "chipIn 150ms ease-out",
      }}
    >
      {lead && (
        <span style={{ opacity: 0.3, fontSize: 9, margin: "0 -1px 0 -1px" }}>·</span>
      )}
      {body}
    </span>
  );
}

export default TokenChip;
