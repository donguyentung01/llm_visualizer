import torch
from app.llm import tokenizer, get_model


def _eos_ids(model):
    eos = model.generation_config.eos_token_id
    return set(eos) if isinstance(eos, list) else {eos}


def generate(prompt, max_tokens=100, temperature=0.7, do_sample=True, top_k=40):
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
            next_id = int(torch.argmax(true_probs))            # greedy

        # stop before printing/appending the end-of-turn token
        if next_id in eos_ids:
            break

        print(step, next_id, repr(tokenizer.decode([next_id])), float(true_probs[next_id]))
        input_ids = torch.cat([input_ids, torch.tensor([[next_id]])], dim=1)

    # return only the assistant's reply, not the templated prompt
    return tokenizer.decode(input_ids[0, prompt_len:])


if __name__ == "__main__":
    print("--- greedy ---")
    print(generate("What is the capital of France?", do_sample=False))
    print()
    print("--- sampled (top_k=40, temp=0.7) ---")
    print(generate("What is the capital of France?", do_sample=True, temperature=0.7, top_k=40))
