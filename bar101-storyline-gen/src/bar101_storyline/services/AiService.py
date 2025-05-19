from openai import OpenAI
from utils import ask_llm
import json

class AiService:

    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)

    def get_messages(self, prompt, system_message = None):
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        return messages

    def ask_llm(self, messages, functions=None, model="gpt-4.1"):
        response = ask_llm(self.client, messages, functions, model)
        return response
    
    def ask_llm_for_function(self, messages, functions, model="gpt-4.1"):
        response = self.ask_llm(messages, functions, model)

        # check if the response is a function with name that match any name in functions
        if not response.choices[0].finish_reason == "function_call" or not any(response.choices[0].message.function_call.name == function["name"] for function in functions):
            raise Exception("The model did not return a function call.")

        params = json.loads(response.choices[0].message.function_call.arguments)

        return params
