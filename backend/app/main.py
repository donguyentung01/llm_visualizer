from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel
from app.llm import tokenizer 
import json 
import uuid 
from sse_starlette.sse import EventSourceResponse
from app.generate import run_generation

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   
    allow_methods=["*"],
    allow_headers=["*"],
)

class TokenizeRequest(BaseModel): 
    text: str

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/tokenize") 
def tokenize(req: TokenizeRequest):
    ids = tokenizer(req.text)["input_ids"]
    return { 
        "tokens": [
            {
                "id": tid, 
                "display": tokenizer.decode([tid]),
            }
            for tid in ids
        ]
    }

@app.get("/generate/stream")
def generate_stream(prompt: str, max_tokens: int = 128,
                    temperature: float = 0.7, do_sample: bool = False):
    gen_id = uuid.uuid4().hex

    def events():
        for name, payload in run_generation(gen_id, prompt, max_tokens, temperature, do_sample):
            yield {"event": name, "data": json.dumps(payload)}

    return EventSourceResponse(events())