import torch
from app.llm import tokenizer, get_model
from app.store import store

def _eos_ids(model):
    eos = model.generation_config.eos_token_id
    return set(eos) if isinstance(eos, list) else {eos}

def run_generation(gen_id, prompt, max_tokens=128, temperature=0.7, do_sample=False, top_k=40, k_display=10):
    model = get_model()
    eos_ids = _eos_ids(model)

    # wrap the user's prompt in the chat format the instruct model was trained on:
    #   <|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n
    messages = [{"role": "user", "content": prompt}]
    enc = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_tensors="pt", return_dict=True
    )
    input_ids = enc["input_ids"]
    prompt_len = input_ids.shape[1]

    yield ("start", {
        "gen_id": gen_id,
        "prompt_tokens": [
            {"id": int(t), "display": tokenizer.decode([int(t)])}
                for t in tokenizer(prompt)["input_ids"]      # raw prompt, no chat template
            ],
    })

    generated = []

    for step in range(max_tokens):
        with torch.no_grad():
            next_logits = model(input_ids).logits[0, -1]      # (vocab,)

        # the model's actual distribution — used only for reporting
        true_probs = torch.softmax(next_logits, dim=-1)

        if do_sample:
            logits = next_logits / temperature
            if top_k:                                          # drop the tail
                kth_val = torch.topk(logits, top_k).values[-1]
                logits = torch.where(logits < kth_val,
                                     torch.full_like(logits, float("-inf")),
                                     logits)
            sample_probs = torch.softmax(logits, dim=-1)
            next_id = int(torch.multinomial(sample_probs, num_samples=1))
        else:
            next_id = int(torch.argmax(true_probs))           

        if next_id in eos_ids:
            break

        top_probs, top_ids = torch.topk(true_probs, k_display)
        topk = [
            {"id": int(i), "display": tokenizer.decode([int(i)]), "prob": float(p)}
            for p, i in zip(top_probs, top_ids)
        ]

        record = {
            "idx": prompt_len + step,
            "id": next_id,
            "display": tokenizer.decode([next_id]),
            "prob": float(true_probs[next_id]),
            "topk": topk,
        }

        generated.append(record)

        yield ("token", record)

        input_ids = torch.cat([input_ids, torch.tensor([[next_id]])], dim=1)

    store.put(gen_id, {
        "input_ids": input_ids[0].tolist(), 
        "prompt_len": prompt_len, 
        "generated": generated
    })

    yield("done", {"gen_id": gen_id, "n_tokens": len(generated)})