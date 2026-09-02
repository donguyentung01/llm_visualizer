import TokenChip from "./TokenChip" 
import {Token} from "./types"

function TokenStream({tokens}: {tokens: Token[]}) { 
    return (
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 16 }}>
            {tokens.map((t, i) => <TokenChip key={i} token={t} />)}
        </div>
    )
}

export default TokenStream;