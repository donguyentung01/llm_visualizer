import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoConfig

MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
_config = AutoConfig.from_pretrained(MODEL_ID)   # cheap: just downloads config.json

_model = None


def get_model():
    global _model
    if _model is None:
        _model = AutoModelForCausalLM.from_pretrained(MODEL_ID, dtype=torch.float32)
        _model.eval()
    return _model


MODEL_REGISTRY = {
    "qwen2.5-0.5b-instruct": {
        "hf_path": MODEL_ID,
        "n_layers": _config.num_hidden_layers,     # 24
        "n_heads": _config.num_attention_heads,    # 14
    },
}
