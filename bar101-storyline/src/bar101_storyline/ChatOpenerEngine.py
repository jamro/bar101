import random
from openai import OpenAI
import os
import json

all_openers = [
    "Hey, how's it going?",
    "Long night?",
    "You made it, didn't you?",
    "Is it quiet tonight?",
    "Still dry outside?",
    "No cameras up there, right?",
    "Is the smoke thicker today?",
    "No signals reach here, do they?",
    "Is the city loud today?",
    "Did you walk the long way?",
    "Still breathing in Stenograd?",
    "Are the systems feeling jumpy?",
    "Are the lines starting to blur?",
    "Storm above us?",
    "They still scanning topside?",
    "Same boots, different dust - right?",
    "Is the air heavier today?",
    "You still trust your steps?",
    "Does the city feel colder?",
    "Did you make it through the day?",
    "You look like you've seen some things - rough day?",
    "Rough one out there?",
    "City treating you alright?",
    "Long walk to get here?",
    "You keeping steady?",
    "Quiet night, huh?",
    "Looks like you needed a pause - that right?",
    "Everything holding up okay?",
    "Feel like a slow night to you?",
    "Got out before the rush?",
    "You alright?",
    "One of those days?",
    "Feels cooler down here, doesn't it?",
    "Is the whole city running hot today?",
    "Did you make it through the noise?",
    "Are people restless tonight?",
    "Something bring you down here?",
    "No trouble getting here?",
    "Is the city acting weird lately?",
    "Timing's good - not too busy, huh?",
    "Everything feel off today?",
    "You're not here by accident, are you?",
    "Heard the streets are tense again?",
    "Did the city spit you out again?",
    "Do the streets feel heavier today?",
    "How's the path down here?",
    "Night's only just started, hasn't it?",
    "Same city, different story - yeah?",
    "Another quiet night for you?",
    "Did you time it well - calm right now?",
    "City been kind to you?",
    "You look like you dodged something - true?",
    "Is it always this quiet when you come in?",
    "You know your way around down here?",
    "Still breathing, aren't you?",
    "You feel it too - something's off, right?",
    "Everything outside still spinning?",
    "You made it in one piece?",
    "It's one of those nights, isn't it?",
    "Did you slip in easy tonight?",
    "Is your night just starting or ending?"
]

get_system_message = lambda background, customer, recent_story, outcome_timeline, events: f"""#BACKGROUND
{background}

# PROFILE
Name: {customer['name']}
Age: {customer['age']}
Sex: {customer['sex']}
Job Toitle: {customer['job_title']}
Access to information: {customer['access']}
Hobby: {customer['hobby']}
Comunication style: {customer['communication']}

{customer['details']}

# RECENT STORY OF {customer['name']}
{recent_story}

# GLOBAL STORY SUMMARY
{outcome_timeline}

# RECENT GLOBAL EVENTS
{json.dumps(events, indent=2)}
"""

get_hobby_story_prompt = lambda customer: f"""You are {customer['name']}.
Write a realistic and engaging story (150-200 words) describing a recent situation in which 
RECENT GLOBAL EVENTS impacted your personal hobby.

# Instructions:
- Use only knowledge, experiences, and perspectives that {customer['name']} would reasonably have.
- Keep the tone natural and conversational - like you're telling this to a friend.
- The story must be technically accurate, plausible, and grounded in reality — do not invent unrealistic scenarios.
- Describe a specific event that occurred recently (within the past few weeks).
- The situation should span around 1 to 6 hours — include relevant details about when, where, what happened, and how global events influenced it.
- Make it interesting and immersive by focusing on details, emotions, or unexpected outcomes.
"""

get_neutral_prompt = lambda customer, question: f"""Imagine you are {customer['name']}. 
Once you have entered the bar, bartender Alex served you a drink and started a conversation by asking you: "{question}".
Write a short monologue in response - not a dialogue. 
Use this moment to reveal hobby of {customer['name']} and related activities. 
Assume the bartender doesn't know what your hobby is.

# Guidelines
- Format: 4-8 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions)
- Tone: Conversational and natural
- Language: Avoid technical jargon, vague statements, or overly generic wording
- Be specific about the hobby and its nuances. {customer['name']} is an expert in the hobby.
- Make sure details about hobby are realistic and technically correct - do not make things up
- Do not ask questions or request any actions from Alex
- Monologue should end naturally — no need for dramatic conclusion or exit line
- Ensure smooth and natural transtion from answering bartender's to talking about your hobby
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language
- Suspicious: Gives a bit more, but still cautious
- Neutral: Comfortable enough to speak plainly
- Trusting: Open and more personal
- Very Trusting: Speaks freely, includes more background about yourself and the world

# Across all versions:
- ALWAYS mention your hobby explicite and something related to it
- ALWAYS refer to some recent event that affected your hobby
- As trust increases, shift from public and widely known information to private insights, personal experiences, and secrets known only by the character
- Include world background and recent events appropriate to the level of trust

# Output
Return the result using the generate_monologue_variants function.
"""

get_hobby_prompt = lambda customer, question: f"""Imagine you are {customer['name']}. 
Once you have entered the bar, bartender Alex served you a drink and started a conversation by asking you about your hobby: "{question}".
Write a short monologue in response (not a dialogue) that starts with a short answer to the question and then expands into a more detailed discussion about your hobby.
Use this moment to reveal how recent global events afected hobby of {customer['name']}
Use only information that the {customer['name']} would know

# Guidelines
- Format: 5-9 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions)
- Tone: Conversational and natural
- Language: Avoid technical jargon, vague statements, or overly generic wording
- Be specific about the hobby and its nuances. {customer['name']} is an expert in the hobby.
- Make sure details about hobby are realistic and technically correct - do not make things up
- Do not ask questions or request any actions from Alex
- Monologue should end naturally — no need for dramatic conclusion or exit line
- Ensure smooth and natural transtion from answering bartender's to talking about recent events
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language
- Suspicious: Gives a bit more, but still cautious
- Neutral: Comfortable enough to speak plainly
- Trusting: Open and more personal
- Very Trusting: Speaks freely, includes more background about yourself and the world

# Across all versions:
- ALWAYS refer to some recent event that affected your hobby
- As trust increases, shift from public and widely known information to private insights, personal experiences, and secrets known only by the character
- Include world background and recent events appropriate to the level of trust

# Output
Return the result using the generate_monologue_variants function.
"""
    
class ChatOpenerEngine:
    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None
        self.model = "gpt-4.1"
        self.generate_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generates 5 monologue variants based on trust levels for a given character and stores them",
          "parameters": {
            "type": "object",
            "properties": {
                "very_suspicious": {
                    "description": "List of monologue messages for very suspicious level",
                    "items": {
                        "type": "string"
                    },
                },
                "suspicious": {
                    "description": "List of monologue messages for suspicious level",
                    "items": {
                        "type": "string"
                    },
                },
                "neutral": {
                    "description": "List of monologue messages for neutral level",
                    "items": {
                        "type": "string"
                    },
                },
                "trusting": {
                    "description": "List of monologue messages for trusting level",
                    "items": {
                        "type": "string"
                    },
                },
                "very_trusting": {
                    "description": "List of monologue messages for very trusting level",
                    "items": {
                        "type": "string"
                    },
                }
            },
            "required": ["very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
          }
        }


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
    
    def get_neutral_conversation(self, question, customer_id, recent_story, outcome_timeline, events, hobby_story):
        last_error = None
        for i in range(3):
            try:
                response = self._get_neutral_conversation( question, customer_id, recent_story, outcome_timeline, events, hobby_story)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
              
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to fork plot after 3 attempts: {last_error}")
    
    def get_hobby_conversation(self,  question, customer_id, recent_story, outcome_timeline, events, hobby_story):
        last_error = None
        for i in range(3):
            try:
                response = self._get_hobby_conversation( question, customer_id, recent_story, outcome_timeline, events, hobby_story)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
              
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to fork plot after 3 attempts: {last_error}")
    
    def _get_neutral_conversation(self, question, customer_id, recent_story, outcome_timeline, events, hobby_story):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
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
        response = self.client.chat.completions.create(model=self.model, messages=messages, functions=[self.generate_monologue_variants_func])
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
    
    def _get_hobby_conversation(self, question, customer_id, recent_story, outcome_timeline, events, hobby_story):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
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
        response = self.client.chat.completions.create(model=self.model, messages=messages, functions=[self.generate_monologue_variants_func])
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
    
    def get_opener_story(self, customer_id, recent_story, outcome_timeline, events):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            recent_story, 
            outcome_timeline,
            events
        )
        prompt = get_hobby_story_prompt(customer)
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = self.client.chat.completions.create(model=self.model, messages=messages)
        return response.choices[0].message.content
    
    def get_opener(self, customer_id, recent_story, outcome_timeline, events, log_callback=None):
        neutral_question = self.get_neutral_opener()

        log_callback(f"[dim]{customer_id} generates hobby story...[/dim]") if log_callback else None
        story = self.get_opener_story(customer_id, recent_story, outcome_timeline, events)
        log_callback(f"[dim]{customer_id} answers neutral question...[/dim]") if log_callback else None
        neutral_answer = self.get_neutral_conversation(neutral_question, customer_id, recent_story, outcome_timeline, events, story)
        log_callback(f"[dim]{customer_id} answers hobby question...[/dim]") if log_callback else None
        hobby_answer = self.get_hobby_conversation(self.get_hobby_opener(customer_id), customer_id, recent_story, outcome_timeline, events, story)
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