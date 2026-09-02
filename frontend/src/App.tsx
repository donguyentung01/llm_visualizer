import './App.css'
import PromptInput from "./PromptInput";
import TokenStream from "./TokenStream";
import { useGeneration } from "./useGeneration"

function App() {
  const { promptTokens, generated, status, start } = useGeneration();
  
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>LLM Visualizer</h1>
      <PromptInput onSubmit={start} />
      <TokenStream tokens={promptTokens} /> 
      <TokenStream tokens={generated} />
      {status === "streaming" && <span>▍</span>}
    </div>
  )
}

export default App
