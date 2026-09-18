import { Fragment } from "react";
import TokenChip from "./TokenChip";
import type { Token, GeneratedToken } from "./types";

interface Props {
  tokens: (Token | GeneratedToken)[];
  onHover?: (token: GeneratedToken, rect: DOMRect) => void;
  onLeave?: () => void;
}

// Chips flow inline like words; a token containing newline(s) forces a real line
// break after it, so the model's paragraphs and list structure survive.
function TokenStream({ tokens, onHover, onLeave }: Props) {
  return (
    <div style={{ lineHeight: 2, marginTop: 10 }}>
      {tokens.map((t, i) => {
        const breaks = (t.display.match(/\n/g) ?? []).length;
        return (
          <Fragment key={i}>
            <TokenChip token={t} onHover={onHover} onLeave={onLeave} />
            {Array.from({ length: breaks }, (_, k) => (
              <br key={k} />
            ))}
          </Fragment>
        );
      })}
    </div>
  );
}

export default TokenStream;
