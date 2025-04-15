import random
from openai import OpenAI
import os
import json

all_openers = [
  "Yeah... makes me wonder how your week's been.",
  "Sounds like you've had a lot going on lately, huh?",
  "I get that - been a strange stretch of days for you too?",
  "Kinda feels like things haven't been normal for a while. You noticing that?",
  "Funny how things shift without anyone saying much. You seen that around you?",
  "Feels like everyone's on edge. You too?",
  "Things still feel steady in your world?",
  "You get the sense something's been building lately?",
  "You ever feel like the air's just... heavier now?",
  "Makes me wonder what your days have been like recently.",
  "Can't help but feel like everyone's carrying something these days. You too?",
  "You notice people acting different lately?",
  "Been a while since things felt predictable, huh?",
  "You still keeping the same rhythm, or things gotten weird?",
  "That makes me think - what's been different for you lately?",
  "Feels like there's a story behind that tone. You alright?",
  "I've been hearing strange little things all week. Any make their way into your life?",
  "Ever get that feeling like the ground's shifting just a little under everything?",
  "Makes me think - how's life been treating you these days?",
  "I can't tell if it's just me or if the city's... changed. What's it feel like to you?",
  "You keeping out of the mess, or does it keep finding you?",
  "You still feeling like yourself lately?",
  "Not sure if it's just the weather or something else, but people seem different. You notice that?",
  "You seem like someone who notices things. What've you been picking up on lately?",
  "It's been a rough season for some. You managing okay?",
  "You getting by alright with everything swirling around?",
  "You ever get tired of pretending things are fine?",
  "Hard to keep track of what's normal anymore. What's that look like for you?",
  "You ever feel like you're walking a little more carefully these days?",
  "Whatever's been going on, seems like you've been managing it quietly.",
  "Folks don't always talk, but they carry plenty. You carrying much these days?"
]

get_system_message = lambda background, customer, recent_story, outcome_timeline=None, events=None: f"""#BACKGROUND
{background}

# PROFILE
Name: {customer['name']}
Age: {customer['age']}
Sex: {customer['sex']}
Job Toitle: {customer['job_title']}
Access to information: {customer['access']}
Comunication style: {customer['communication']}

{customer['details']}

# RECENT STORY OF {customer['name']}
{recent_story}

{'# GLOBAL STORY SUMMARY' if outcome_timeline else ''}
{outcome_timeline}

{'# GLOBAL EVENTS' if events else ''}
{json.dumps(events, indent=2)}
"""

get_main_prompt = lambda customer, question: f"""Imagine you are {customer['name']}. 
After having a small talk with bartender Alex about your hobby, Alex asked you: "{question}" to learn what happened to you recently.
Write a short monologue in response - not a dialogue. 
Use this moment to reveal RECENT STORY OF {customer['name']}

# Guidelines
- Format: 4-8 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions)
- Tone: Conversational and natural
- Language: Avoid technical jargon, vague statements, or overly generic wording
- Express your feelings and emotions about the recent events
- Share specific details and situations that happened in your RECENT STORY
- Do not ask questions or request any actions from Alex
- Monologue should end emotionally allowing Alex to respond empathetically
- Ensure smooth and natural transtion from answering bartender's to talking about your story
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language
- Suspicious: Gives a bit more, but still cautious
- Neutral: Comfortable enough to speak plainly
- Trusting: Open and more personal
- Very Trusting: Speaks freely, includes more background about yourself and the world

# Across all versions:
- ALWAYS refer to some recent event and share your story
- As trust increases, shift from public and widely known information to private insights, personal experiences, and secrets known only by the character
- With each level cover facts from the previous level and extend them with more details
- Include world background, recent events and your story appropriate to the level of trust
- End each monologue variant with the same clearly emotional state, allowing Alex to respond empathetically

# Output
Return the result using the generate_monologue_variants function.
"""

get_emotional_prompt = lambda customer, emotion: f"""Imagine you are {customer['name']} who feels {emotion}.

# Task
1. Provide what Alex said to you that made you feel better and understand.
2. Write a short monologue in response to what Alex said 

# Guidelines
- Format: 2-6 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions)
- Tone: Conversational and natural
- Your emotion: You feel understood and better
- Do NOT share any additional details ahout RECENT STORY - focus on your feelings and emotions
- Do not ask questions or request any actions from Alex
- Monologue should end naturally — no need for dramatic conclusion or exit line
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language
- Suspicious: Gives a bit more, but still cautious
- Neutral: Comfortable enough to speak plainly
- Trusting: Open and more personal
- Very Trusting: Speaks freely, includes more background about yourself and the world

# Across all versions:
- NEVER refer to recent events
- As trust increases, share more personal insights and feelingsy
- As trust increases, answer with more bullet points (2 for very suspiciousup to  6 for very trusting)

# Output
Return the result using the generate_monologue_variants function.
"""

get_factual_prompt = lambda customer, emotion, main_variants: f"""Imagine you are {customer['name']} who feels {emotion}.
You just had following coversation with bartender Alex (assume you had all of variants below):

# PREVIOUS CONVERSATION
{json.dumps(main_variants, indent=2)}

# Task
1. Provide what Alex said to you push you to share more details about GLOBAL EVENTS. Style: Not ephatical, but rather pushy. Keep it short and generic as it must fit any variant of previous conversation.
2. Write a short monologue in response to what Alex said 

# Guidelines
- Format: 5-8 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions)
- Tone: Conversational and natural
- Your emotion: {emotion}
- Be specific and detailed about the GLOBAL EVENTS
- GLOBAL STORY SUMMARY provides additional context for GLOBAL EVENTS
- Do not ask questions or request any actions from Alex
- Monologue should end naturally — no need for dramatic conclusion or exit line
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language
- Suspicious: Gives a bit more, but still cautious
- Neutral: Comfortable enough to speak plainly
- Trusting: Open and more personal
- Very Trusting: Speaks freely, includes more background about yourself and the world

# Across all versions:
- ALWAYS refer to GLOBAL EVENTS
- Do NOT repeat ANY information from PREVIOUS CONVERSATION. Focus on new information or add new details
- As trust increases, shift from public and widely known information to private insights, personal experiences, and secrets known only by the character
- Include ONLY information that {customer['name']} could have access to

# Output
Return the result using the generate_monologue_variants function.
"""

class ChatStoryEngine:
    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None
        self.model = "gpt-4.1"

        self.variant_props = {
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
        }

        self.generate_main_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generates 5 monologue variants based on trust levels for a given character and stores them. Each variant ends with the same emotional state.",
          "parameters": {
            "type": "object",
            "properties": {
                "ending_emotion": {
                    "description": "Emotion of the at the end of the monologue",
                    "type": "string"
                },
                **self.variant_props
            },
            "required": ["ending_emotion", "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
          }
        }

        self.generate_emotional_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generates 5 monologue variants based on trust levels for a given character and stores them. Include emphatical Alex's phrase that triggered the conversation.",
          "parameters": {
            "type": "object",
            "properties": {
                "alex_phrase": {
                    "description": "Alex's phrase that is highly emphatical and triggered the conversation",
                    "type": "string"
                },
                **self.variant_props
            },
            "required": ["alex_phrase", "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
          }
        }

        self.generate_factual_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generates 5 monologue variants based on trust levels for a given character and stores them. Include Alex's phrase that pushed you to share more details.",
          "parameters": {
            "type": "object",
            "properties": {
                "alex_phrase": {
                    "description": "Alex's phrase that is highly emphatical and triggered the conversation",
                    "type": "string"
                },
                **self.variant_props
            },
            "required": ["alex_phrase", "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
          }
        }

    def get_opener(self):
        return random.choice(all_openers)
    
    def find_customer_by_id(self, customer_id):
        for customer in self.customers:
            if customer["id"] == customer_id:
                return customer
        return None
    
    def get_conversation(self, question, customer_id, recent_story, outcome_timeline, events, log_callback=None):
        log_callback(f"[dim]Generating main conversation of {customer_id}...[/dim]") if log_callback else None
        main = self.get_main_conversation(question, customer_id, recent_story, outcome_timeline, events)
        log_callback(f"[dim]Generating emotional followup of {customer_id}...[/dim]") if log_callback else None
        emotional = self.get_emotional_followup(customer_id, recent_story, main["emotion"])
        log_callback(f"[dim]Generating factual followup of {customer_id}...[/dim]") if log_callback else None
        factual = self.get_factual_followup(customer_id, recent_story, main["emotion"], main["variants"], outcome_timeline, events)
        
        return {
            "main": main,
            "emotional": emotional,
            "factual": factual
        }
    
    def get_emotional_followup(self, customer_id, recent_story, emotion):
        last_error = None
        for i in range(3):
            try:
                response = self._get_emotional_followup(customer_id, recent_story, emotion)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
              
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to fork plot after 3 attempts: {last_error}")

    def get_factual_followup(self, customer_id, recent_story, emotion, main_variants, outcome_timeline, events):
        last_error = None
        for i in range(3):
            try:
                response = self._get_factual_followup(customer_id, recent_story, emotion, main_variants, outcome_timeline, events)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
              
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to fork plot after 3 attempts: {last_error}")


    def get_main_conversation(self, question, customer_id, recent_story, outcome_timeline, events):
        last_error = None
        for i in range(3):
            try:
                response = self._get_main_conversation( question, customer_id, recent_story, outcome_timeline, events)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
              
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to fork plot after 3 attempts: {last_error}")
    
    def _get_emotional_followup(self, customer_id, recent_story, emotion):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            recent_story
        )
        prompt = get_emotional_prompt(customer, emotion)
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = self.client.chat.completions.create(model=self.model, messages=messages, functions=[self.generate_emotional_monologue_variants_func])
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        return {
            "opener": params["alex_phrase"],
            "variants": [
              params["very_suspicious"],
              params["suspicious"],
              params["neutral"],
              params["trusting"],
              params["very_trusting"],
          ]
        }
    
    def _get_factual_followup(self, customer_id, recent_story, emotion, main_variants, outcome_timeline, events):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            recent_story,
            outcome_timeline,
            events
        )
        prompt = get_factual_prompt(customer, emotion, main_variants)

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = self.client.chat.completions.create(model=self.model, messages=messages, functions=[self.generate_factual_monologue_variants_func])
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        return {
            "opener": params["alex_phrase"],
            "variants": [
              params["very_suspicious"],
              params["suspicious"],
              params["neutral"],
              params["trusting"],
              params["very_trusting"],
          ]
        }
    
    def _get_main_conversation(self, question, customer_id, recent_story, outcome_timeline, events):
        customer = self.find_customer_by_id(customer_id)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            recent_story, 
            outcome_timeline,
            events
        )
        prompt = get_main_prompt(customer, question)
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = self.client.chat.completions.create(model=self.model, messages=messages, functions=[self.generate_main_monologue_variants_func])
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        return {
            "opener": question,
            "variants": [
              params["very_suspicious"],
              params["suspicious"],
              params["neutral"],
              params["trusting"],
              params["very_trusting"],
          ],
          "emotion": params["ending_emotion"],
        }
    
    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))
        self.customers = self.world_context["bar"]["customers"]