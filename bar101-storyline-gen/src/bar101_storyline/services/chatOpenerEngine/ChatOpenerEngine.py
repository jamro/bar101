import random
from openai import OpenAI
import os
import json
from utils import ask_llm
from .openers import all_openers
from .prompts import get_system_message, get_neutral_prompt, get_hobby_prompt, get_hobby_story_prompt
from utils import retry_on_error
from .functions import generate_monologue_variants
    
class ChatOpenerEngine:
    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None

    def get_neutral_opener(self):
        return random.choice(all_openers)
    
    def find_customer_by_id(self, customer_id):
        for customer in self.customers:
            if customer["id"] == customer_id:
                return customer
        return None
    
    def get_hobby_opener(self, customer_id, count=3):
        # find the key customer in self.customers
        key_customer = self.find_customer_by_id(customer_id)

        # create random set of customers with the key customer
        customer_set = [key_customer]
        while len(customer_set) < count and len(customer_set) < len(self.customers):
            random_customer = random.choice(self.customers)
            if random_customer not in customer_set:
                customer_set.append(random_customer)
        
        random.shuffle(customer_set)

        # create openers
        openers = []
        for customer in customer_set:
            openers.append({
                "correct": customer["id"] == customer_id,
                "message":  random.choice(customer["openers"])
            })

        return openers
    
    def get_wrong_opener_response(self, customer_id):
        customer = self.find_customer_by_id(customer_id)
        if customer is None:
            raise ValueError(f"Customer with ID {customer_id} not found.")
        
        # Generate a wrong opener response
        wrong_opener = customer["wrong_opener"]
        return wrong_opener
    
    @retry_on_error(max_attempts=3)
    def get_neutral_conversation(self, question, customer_id, character_stats, recent_story, outcome_timeline, events, hobby_story):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            character_stats,
            recent_story, 
            outcome_timeline,
            events
        )
        prompt = get_neutral_prompt(customer, question)
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": get_hobby_story_prompt(customer)},
            {"role": "assistant", "content": hobby_story},
            {"role": "user", "content": prompt}
        ]
        response = ask_llm(self.client, messages=messages, functions=[generate_monologue_variants])
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        return [
            params["very_suspicious"],
            params["suspicious"],
            params["neutral"],
            params["trusting"],
            params["very_trusting"]
        ]
    
    @retry_on_error(max_attempts=3)
    def get_hobby_conversation(self, question, customer_id, character_stats, recent_story, outcome_timeline, events, hobby_story):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            character_stats,
            recent_story, 
            outcome_timeline,
            events
        )
        prompt = get_hobby_prompt(customer, question)
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": get_hobby_story_prompt(customer)},
            {"role": "assistant", "content": hobby_story},
            {"role": "user", "content": prompt}
        ]
        response = ask_llm(self.client, messages=messages, functions=[generate_monologue_variants])
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        return [
            params["very_suspicious"],
            params["suspicious"],
            params["neutral"],
            params["trusting"],
            params["very_trusting"]
        ]
    
    def get_opener_story(self, customer_id, character_stats, recent_story, outcome_timeline, events):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            character_stats,
            recent_story, 
            outcome_timeline,
            events
        )
        prompt = get_hobby_story_prompt(customer)
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = ask_llm(self.client, messages=messages)
        return response.choices[0].message.content
    
    def get_opener(self, customer_id, character_stats, recent_story, outcome_timeline, events, log_callback=None):
        neutral_question = self.get_neutral_opener()

        log_callback(f"[dim]{customer_id} generates hobby story...[/dim]") if log_callback else None
        story = self.get_opener_story(customer_id, character_stats, recent_story, outcome_timeline, events)
        log_callback(f"[dim]{customer_id} answers neutral question...[/dim]") if log_callback else None
        neutral_answer = self.get_neutral_conversation(neutral_question, customer_id, character_stats, recent_story, outcome_timeline, events, story)
        log_callback(f"[dim]{customer_id} answers hobby question...[/dim]") if log_callback else None
        hobby_answer = self.get_hobby_conversation(self.get_hobby_opener(customer_id), customer_id, character_stats, recent_story, outcome_timeline, events, story)
        response = {
            "customer_id": customer_id,
            "questions": {
                "neutral": neutral_question,
                "hobby": self.get_hobby_opener(customer_id),
            },
            "wrong_hobby_answer": self.get_wrong_opener_response(customer_id),
            "neutral_answer": neutral_answer,
            "hobby_answer": hobby_answer
        }

        return response
        
    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))
        self.customers = self.world_context["bar"]["customers"]