from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel
from app.llm import tokenizer 

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
