import {Token} from "./types"

function TokenChip( {token} : {token: Token}) { 
    return (
        <span
            title={`id: ${token.id}`}
            style={{
            border: "1px solid #ccc",
            borderRadius: 4,
            padding: "2px 4px",
            margin: 2,
            whiteSpace: "pre",
            animation: "chipIn 150ms ease-out",
        }}
        >
            {token.display}
        </span>
    )
}

export default TokenChip; 
