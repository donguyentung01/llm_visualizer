import { useRef } from "react"; 

function PromptInput( {onSubmit}: {onSubmit: (text: string) => void  } ) {
    const ref = useRef<HTMLTextAreaElement>(null);

    function handleClick() {
        const el = ref.current; 
        if (!el) return; 

        const text = el.value; 
        if (!text.trim()) return; 
        onSubmit(text)
        el.value = ""
    }

    return (
        <div>
            <textarea
                ref = {ref}
                rows={3}
                placeholder="Ask me something..."
            />
            <button onClick={handleClick}>
                submit 
            </button>
        </div>
    )
}

export default PromptInput;