import "./App.css";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import PromptInput from "./PromptInput";
import TokenStream from "./TokenStream";
import ProbPopover from "./ProbPopover";
import { useGeneration } from "./useGeneration";
import type { GeneratedToken } from "./types";

const MODEL = "Qwen2.5-0.5B";
const COL: CSSProperties = { maxWidth: 780, margin: "0 auto" };

const sectionLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
  margin: 0,
};

function App() {
  const { promptTokens, generated, status, start } = useGeneration();
  const [maxTokens, setMaxTokens] = useState(128);
  const [hovered, setHovered] = useState<{ token: GeneratedToken; rect: DOMRect } | null>(null);

  // keep the newest tokens in view as they stream in
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [generated.length, promptTokens.length]);

  const started = promptTokens.length > 0 || generated.length > 0;

  // --- landing state: big title + large centered input ---
  if (!started) {
    return (
      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ width: "100%", maxWidth: 600 }}>
          <h1 style={{ fontSize: 30, fontWeight: 500, textAlign: "center", margin: "0 0 6px" }}>
            Token Visualizer
          </h1>
          <p
            style={{
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 14,
              margin: "0 0 24px",
            }}
          >
            Watch the model generate, one token at a time.
          </p>
          <PromptInput
            onSubmit={(text) => start(text, maxTokens)}
            maxTokens={maxTokens}
            onMaxTokensChange={setMaxTokens}
            large
            model={MODEL}
          />
        </div>
      </div>
    );
  }

  // --- chat state: conversation scrolls above, input pinned below ---
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100svh" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        <div style={COL}>
          {promptTokens.length > 0 && (
            <>
              <h2 style={sectionLabel}>Prompt</h2>
              <TokenStream tokens={promptTokens} />
            </>
          )}

          {generated.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h2 style={sectionLabel}>
                Response{status === "streaming" ? " · streaming" : ""}
              </h2>
              <div>
                <TokenStream
                  tokens={generated}
                  onHover={(token, rect) => setHovered({ token, rect })}
                  onLeave={() => setHovered(null)}
                />
                {status === "streaming" && <span className="caret" />}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 18,
                  fontSize: 11,
                  color: "var(--muted)",
                }}
              >
                <span>unsure</span>
                <span
                  style={{
                    width: 160,
                    height: 8,
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #d1453b, #d99a2b, #22a06b)",
                  }}
                />
                <span>confident</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--mono)" }}>
                  hover a token for alternatives
                </span>
              </div>
            </div>
          )}

          {status === "error" && (
            <p style={{ color: "#d1453b", marginTop: 16 }}>
              Stream failed — is the backend running on :8000?
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid var(--border)",
          background: "var(--bg)",
          padding: "14px 20px",
        }}
      >
        <div style={COL}>
          <PromptInput
            onSubmit={(text) => start(text, maxTokens)}
            maxTokens={maxTokens}
            onMaxTokensChange={setMaxTokens}
            model={MODEL}
          />
        </div>
      </div>

      {hovered && <ProbPopover token={hovered.token} rect={hovered.rect} />}
    </div>
  );
}

export default App;
