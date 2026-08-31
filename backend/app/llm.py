from transformers import GPT2TokenizerFast

tokenizer = GPT2TokenizerFast.from_pretrained("gpt2")

MODEL_REGISTRY = {
    "gpt2": {"hf_path": "gpt2", "n_layers": 12, "n_heads": 12},
}