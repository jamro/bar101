from rich.console import Console

global_llm_cost = 0

def get_global_llm_cost():
    global global_llm_cost
    return global_llm_cost

model_cost_per_1m_tokens = {
    "gpt-4.1": {
        "prompt": 2,        
        "completion": 8
    },
    "gpt-4.1-mini": {
        "prompt": 1.1,        
        "completion": 4.4
    },
}

console = Console()

def ask_llm(client, messages, functions=None, model="gpt-4.1"):
    global global_llm_cost
    if functions is not None:
      response = client.chat.completions.create(
          model=model,
          messages=messages, 
          functions=functions
      )
    else:
      response = client.chat.completions.create(
          model=model,
          messages=messages, 
      )
    usage = response.usage

    if usage and model in model_cost_per_1m_tokens:
        prompt_tokens = usage.prompt_tokens
        completion_tokens = usage.completion_tokens
        total_tokens = usage.total_tokens

        cost_prompt = (prompt_tokens / 1000000) * model_cost_per_1m_tokens[model]["prompt"]
        cost_completion = (completion_tokens / 1000000) * model_cost_per_1m_tokens[model]["completion"]
        total_cost = cost_prompt + cost_completion

        global_llm_cost += total_cost

        console.print(f"[green bold]${total_cost:.6f}/${global_llm_cost:.2f}[/green bold] - Prompt: {prompt_tokens} tokens, Completion: {completion_tokens} tokens")
    else:
        console.print("[red]Error: Model cost information not available.[/red]")

        
    return response