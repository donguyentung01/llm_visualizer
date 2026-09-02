import { useRef, useState } from "react";
import type { Token, GeneratedToken, StartPayload, DonePayload } from "./types";

const BASE = "http://localhost:8000";

type Status = "idle" | "streaming" | "done" | "error";

export function useGeneration() {
  const [promptTokens, setPromptTokens] = useState<Token[]>([]);
  const [generated, setGenerated] = useState<GeneratedToken[]>([]);
  const [genId, setGenId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const esRef = useRef<EventSource | null>(null);

  function start(prompt: string) {
    // 1. close any stream already running
    esRef.current?.close();

    // 2. reset state for the new run
    setPromptTokens([]);
    setGenerated([]);
    setGenId(null);
    setStatus("streaming");

    // 3. open the stream
    const url = `${BASE}/generate/stream?prompt=${encodeURIComponent(prompt)}`;
    const es = new EventSource(url);
    esRef.current = es;

    // 4. wire the three named events
    es.addEventListener("start", (e) => {
      const payload = JSON.parse((e as MessageEvent).data) as StartPayload;
      setPromptTokens(payload.prompt_tokens);
      // TODO: setPromptTokens(...)
    });

    es.addEventListener("token", (e) => {
      const tok = JSON.parse((e as MessageEvent).data) as GeneratedToken;
      // TODO: append tok to generated  (use the prev => [...prev, tok] form)
      setGenerated((prev) => [...prev, tok]);
    });

    es.addEventListener("done", (e) => {
      const payload = JSON.parse((e as MessageEvent).data) as DonePayload;
      setGenId(payload.gen_id);
      setStatus("done");
      // TODO: setGenId(...), setStatus("done"), es.close()
      es.close()
    });

    es.onerror = () => {
      setStatus("error");
      es.close();
    };
  }

  return { promptTokens, generated, genId, status, start };
}