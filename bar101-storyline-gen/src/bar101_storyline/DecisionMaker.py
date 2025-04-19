from openai import OpenAI
import os
import json
import random

all_openers = [
  "You look like something's on your mind.",
  "Trouble following you down here tonight?",
  "You look like you're carrying more than a drink.",
  "That look - something weighing you down?",
  "Whatever's chasing you, it hasn't caught you yet.",
  "Noticed the pause in your eyes. Want to fill it?",
  "Something you're not saying. Want to try?",
  "Let me know if that drink isn't strong enough for what's on your mind.",
  "You're stirring more than your glass.",
  "Whatever's circling you, it followed you in.",
  "I've seen that look before - usually before something breaks.",
  "Looks like your drink isn't the only thing that needs settling.",
  "Looks like you've got more on your plate than that drink.",
  "No metrics down here. You can say it.",
  "Something's off - in you, not the drink.",
  "You're not here for the cocktails, are you?",
  "Something you left unsaid. Still time.",
  "Bar's a good place for dilemmas. Want to test that?",
  "You're carrying a decision, aren't you?",
  "Whatever's heavy - you don't have to hold it alone.",
  "You look like you know something you wish you didn't.",
  "Drink's honest. You can be too.",
  "You're here, but not really. What's pulling you back?",
  "That exhale - something behind it?",
  "No council ears here. You're safe.",
  "You seem like you've seen something no one else has.",
  "You're bracing for something. Want to talk before it hits?",
  "Want to test a thought out loud?",
  "Whatever's wrong - you're not the first to bring it here.",
  "Something you can't say up there?",
  "You keeping something safe, or keeping it secret?",
  "Feel like you're hiding from a truth?",
  "Some thoughts are safer in the dark. Want to try?",
  "The drink is simple. You're not.",
  "There's a question on your face. Want to ask it?",
  "You're pacing inside. Want to unpack it?",
  "Looks like a choice is chasing you.",
  "Hard to carry questions alone. Want help?",
  "Want to talk about what the drink isn't touching?",
  "You okay if I ask what's really bothering you?",
  "Feels like you're hiding from more than cameras.",
  "Looks like part of you stayed outside.",
  "Looks like someone asked you a question you haven't answered yet."
]


get_system_message = lambda background, customer, events=None: f"""#BACKGROUND
{background}

# PROFILE
Name: {customer['name']}
Age: {customer['age']}
Sex: {customer['sex']}
Job Toitle: {customer['job_title']}
Access to information: {customer['access']}
Comunication style: {customer['communication']}

{customer['details']}

{'# GLOBAL EVENTS' if events else ''}
{json.dumps(events, indent=2)}
"""


get_dilemma_prompt = lambda customer, trigger_event, dilemma, reason, question, choice_a, choice_b: f"""Imagine you are {customer['name']}. 
You have an important decision to make, and you are in a dilemma: {dilemma}.
The dilemma is triggered by the following event: {trigger_event}.
It is dificult since {reason}.
You have to choose between two options:
- Option A: {choice_a}
- Option B: {choice_b}
During conversation with bartender Alex, he asked: "{question}" to learn what bothers you.
Write a short internal monologue in response about the dilemma - no dialogue, no narration. This is your voice, your thoughts, spoken aloud to Alex in the moment.

# Guidelines
- Format: 3-7 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions, 10 - 15 words long)
- Tone: Conversational and natural
- Purpose: Reveal a current dilemma you're struggling with
- Language: Avoid technical jargon, vague statements, or overly generic wording
- What to Share: A specific decision that's bothering you right now
- Do NOT ask Alex for advice or help
- Do not ask questions or request any actions from Alex
- End the monologue on a neutral but thoughtful note, leaving emotional space for Alex to respond or for you to continue sharing your beliefs later
- Keep the tone true to the world of Stenograd — subtle, loaded, layered with quiet tension
- Share specific details and situations that triggered the dilemma
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Alludes to facing a tough choice but stays cryptic; the dilemma and options are hinted at, not stated (up to 3 bullet points)
- Suspicious: Acknowledges a real dilemma and two possible paths, but offers minimal context or reasoning (up to 4 bullet points)
- Neutral: Clearly outlines the dilemma and both options, shares enough background to be understood without getting personal (up to 5 bullet points)
- Trusting: Describes the situation openly, share all the facts behind and only key personal stakes (up to 6 bullet points)
- Very Trusting: Fully unpacks the dilemma, includes personal stakes, reasons behind the dilemma, and emotional undertones (up to 7 bullet points)

# Across all versions:
- As trust increases, shift from surface-level unease to deep internal conflict
- As trust increases, move from safe public info to private, dangerous, or compromising details
- ALWAYS admit to a dilemma, and always share two choices - level of detail and emotional texture will vary depending on the trust level
- The higher the trust, the more bullet points you can use
- For high trust levels, share directly what's bothering you, what choices you consider and why?
- Reflect on how the system, the city, or the past shaped your current hesitation
- Do not rush to resolution — this is an exploration, not a conclusion
- End in a way that allows beliefs or worldview to be revealed in the next turn
- NEVER mention "Option A" or "Option B" phrases but use the actual meaning of the choice

# Output
Return the result using the generate_monologue_variants function.
"""

get_beliefs_prompt = lambda customer, trigger_event, dilemma, reason, choice_a, choice_b, beliefs: f"""Imagine you are {customer['name']}. 
You have an important decision to make, and you are in a dilemma: {dilemma}.
The dilemma is triggered by the following event: {trigger_event}.
It is dificult since {reason}.
You have to choose between two options:
- Option A: {choice_a}
- Option B: {choice_b}
  
Following {len(beliefs)} beliefs drives you to Option A:
{json.dumps(beliefs, indent=2)}

During conversation with bartender Alex, you vahe a conversation about your belifs which can be challenged or supported by Alex.
For EACH belief, write a short internal monologue in response about the dilemma - no dialogue, no narration. 
This is your voice, your thoughts, spoken aloud to Alex in the moment related to the belief. Make sure it is undersable without any additional context as this is the first time you share it.

# Guidelines for each belief
- Format: 2-3 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions, 10 - 15 words long)
- Tone: Conversational and natural
- Purpose:  Explain what is your belief and why. Make sure it is clear without any additional context as you did not share it before.
- Language: Avoid technical jargon, vague statements, or overly generic wording. keep it simple, compact and easy to understand
- Do not request any actions from Alex
- End the monologue on a neutral but thoughtful note, leaving space for Alex to challenge or support your beliefs
- Keep the tone true to the world of Stenograd — subtle, loaded, layered with quiet tension
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points
- Reflect on how the system, the city, or the past shaped your current hesitation
- Make sure it is clear what choice the belief is related to
- Do not rush to resolution — this is an exploration, not a conclusion
- NEVER mention "Option A" or "Option B" phrases but use the actual meaning of the choice
- Alex responses for each belief:
   * Create two, short responses of Alex to the monologue. One should be supportive resulting in keeping the belief, and the other should be challenging resulting in changing the belief.
   * Each response should be 2 bullet points long. Each bullet point must be compact, easy to understand, and natural.
   * Response of Alex should not requrie any follow up from {customer['name']}. After the response, {customer['name']} will immediately continue with the next belief. Make sure Alex's response allows that in natural way.
   * First line of Alex's response should refer directly to the belief shared by {customer['name']}.
   * Last line of Alex's response should be a natural shift of the conversation to {customer['name']} to keep talking. Make it natural and smooth. Do not be pushy or too direct. Let {customer['name']} open up in a natural way.

# IMPORTANT
ALWAYS generate 3 monologues - one for each belief. Make sure the number of monologues must match the number of beliefs.

# Output
Return the result using the generate_monologue_variants function.
"""

get_decision_prompt = lambda customer, trigger_event, dilemma, reason, choice_a, choice_b, preference: f"""Imagine you are {customer['name']}.
You're facing a difficult decision: {dilemma}, triggered by {trigger_event}.
It's a hard call because: {reason}.
You must choose between:
- Option A:	{choice_a}
- Option B:	{choice_b}

After speaking with bartender Alex, you make a decision.
Now, create three separate monologues, each showing a different outcome of that conversation:

Monologue 1 - You chose Option A, and Alex helped you decide.
Monologue 2 - You chose Option B, and Alex helped you decide.
Monologue 3 - You made your own choice: Option {preference}. Alex wasn't helpful, but you share your decision anyway driven by your own beliefs and intuition.

Each monologue has five variants, based on how much the speaker trusts Alex:
1.	Very Suspicious - Barely hints at the decision; offers no context. (Max 2 bullets)
2.	Suspicious - Acknowledges the choice vaguely; gives minimal detail. (Max 2 bullets)
3.	Neutral - States the decision clearly; gives light context. (Max 3 bullets)
4.	Trusting - Explains the choice and stakes more openly. (Max 4 bullets)
5.	Very Trusting - Shares in-depth motivation, beliefs, and emotional tension. (Max 4 bullets)

Monologue Format:
-	2-4 short bullet points (up to 10-15 words each)
-	First-person voice, spoken aloud to Alex
-	No narration, no internal thoughts, no dialogue
- Use future tense — describe what the character will do next
-	Focus on clarity, natural tone, and logical flow
-	End with a neutral but reflective closing line
-	Never mention "Option A or B" directly - use real choices

Tone & Setting:
-	Conversational, layered with subtle tension
-	Avoid vague phrasing or technical jargon
-	Reflect how the city, system, or personal history shapes the hesitation

Output:
Use the `generate_monologue_variants` function to return the result.
"""

class DecisionMaker:

    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None
        self.model = "gpt-4.1"

        self.variant_props = {
            "very_suspicious": {
                "description": "List of monologue messages for very suspicious level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            },
            "suspicious": {
                "description": "List of monologue messages for suspicious level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            },
            "neutral": {
                "description": "List of monologue messages for neutral level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            },
            "trusting": {
                "description": "List of monologue messages for trusting level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            },
            "very_trusting": {
                "description": "List of monologue messages for very trusting level. Each message should be a short phrase.",
                "items": {
                    "type": "string"
                },
            }
        }

        self.generate_dilemma_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generates 5 monologue variants based on trust levels for a given character to reveal that they are in a dilemma.",
          "parameters": {
            "type": "object",
            "properties": {
                **self.variant_props
            },
            "required": [ "very_suspicious", "suspicious", "neutral", "trusting", "very_trusting"]
          }
        }

        monologue_structure = {
            "type": "object",
            "properties": {
                "belief": {
                    "type": "string",
                    "description": "Rewritten belief - keep the original form"
                },
                "monologue": {
                    "description": "Monologue message of the customer related to the belief",
                    "type": "array",
                    "items": {
                        "type": "string",
                        "description": "Monologue line"
                    }
                },
                "supportive_response": {
                    "description": "Supportive response of the bartender Alex",
                    "type": "array",
                    "items": {
                        "description": "Supportive response line",
                        "type": "string"
                    }
                },
                "challenging_response": {
                    "description": "Challenging response of the bartender Alex",
                    "type": "array",
                    "items": {
                        "description": "Challenging response line",
                        "type": "string"
                    }
                }
            },
        }

        self.generate_beliefs_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generate THREE monologue variants for each belief. Make sure the number of monologues must match the number of beliefs.",
          "parameters": {
            "type": "object",
            "properties": {
                "monologue_1": {
                    "description": "Monologue for the first belief",
                    **monologue_structure
                },
                "monologue_2": {
                    "description": "Monologue for the second belief",
                    **monologue_structure
                },
                "monologue_3": {
                    "description": "Monologue for the third belief",
                    **monologue_structure
                },
            },
            "required": ["monologue_1", "monologue_2", "monologue_3"]
          }
        }


        self.generate_decision_monologue_variants_func = {
          "name": "generate_monologue_variants",
          "description": "Generate 3 monologues sharing the decision made by the customer. One is choice A influenced by Alex, one is choice B influenced by Alex, and one is the decision made by the customer itself. For each monologue, create 5 variants based on trust levels for a given character.",
          "parameters": {
            "type": "object",
            "properties": {
                "monologue_a": {
                    "type": "object",
                    "description": "5 variants of monologue where the customer shares the decision made to go with choice A influenced by Alex. Expresses gratitude to Alex.",
                    "properties": {
                        **self.variant_props
                    }
                },
                "monologue_b": {
                    "type": "object",
                    "description": "5 variants of monologue where the customer shares the decision made to go with choice B influenced by Alex. Expresses gratitude to Alex.",
                    "properties": {
                        **self.variant_props
                    }
                },
                "monologue_self": {
                    "type": "object",
                    "description": "5 variants of monologue where the customer shares the decision to go prefered path made by itself as discussion with Alex was not helpful.",
                    "properties": {
                        **self.variant_props
                    }
                }
                    
            },
            "required": [ "monologue_a", "monologue_b", "monologue_self"]
          }
        }

    def read_context(self, base_path):
        def read_context_file(file_path):
            try:
                with open(file_path, "r") as f:
                    return json.load(f)
            except FileNotFoundError:
                raise FileNotFoundError(f"File not found at {file_path}")
            
        self.world_context = read_context_file(os.path.join(base_path, "world.json"))

    def expopse_dilemma(self, customer, dilemma, timeline):
        last_error = None
        for i in range(3):
            try:
                response = self._expopse_dilemma(customer, dilemma, timeline)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")
        raise Exception(f"Failed to expose dilemma after 3 attempts: {last_error}")
    

    def _expopse_dilemma(self, customer, dilemma, timeline):
        opener = random.choice(all_openers)
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            timeline
        )
        prompt = get_dilemma_prompt(
            customer,
            dilemma["trigger_event"],
            dilemma["dilemma"],
            dilemma["reason"],
            opener,
            dilemma["choice_a"],
            dilemma["choice_b"]
        )
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = self.client.chat.completions.create(
            model=self.model, 
            messages=messages, 
            functions=[self.generate_dilemma_monologue_variants_func]
        )
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        return {
            "opener": opener,
            "variants": [
              params["very_suspicious"],
              params["suspicious"],
              params["neutral"],
              params["trusting"],
              params["very_trusting"],
          ]
        }
    
    def share_beliefs(self, customer, dilemma, timeline, choice_a, choice_b, beliefs):
        last_error = None
        for i in range(5):
            try:
                response = self._share_beliefs(customer, dilemma, timeline, choice_a, choice_b, beliefs)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")
        raise Exception(f"Failed to share beliefs after 5 attempts: {last_error}")
    
    
    def _share_beliefs(self, customer, dilemma, timeline, choice_a, choice_b, beliefs):
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            timeline
        )
        prompt = get_beliefs_prompt(
            customer,
            dilemma["trigger_event"],
            dilemma["dilemma"],
            dilemma["reason"],
            choice_a,
            choice_b,
            beliefs
        )
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = self.client.chat.completions.create(
            model=self.model, 
            messages=messages, 
            functions=[self.generate_beliefs_monologue_variants_func]
        )
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        monologues = [
            params["monologue_1"],
            params["monologue_2"],
            params["monologue_3"]
        ]

        return monologues
    
    def share_decision(self, customer, dilemma, timeline, choice_a, choice_b):
        last_error = None
        for i in range(3):
            try:
                response = self._share_decision(customer, dilemma, timeline, choice_a, choice_b)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")
        raise Exception(f"Failed to share decision after 3 attempts: {last_error}")
    
    
    def _share_decision(self, customer, dilemma, timeline, choice_a, choice_b):
        system_message = get_system_message(
            self.world_context["background"],
            customer,
            timeline
        )
        prompt = get_decision_prompt(
            customer,
            dilemma["trigger_event"],
            dilemma["dilemma"],
            dilemma["reason"],
            choice_a,
            choice_b,
            dilemma["preference"]
        )
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
        response = self.client.chat.completions.create(
            model=self.model, 
            messages=messages, 
            functions=[self.generate_decision_monologue_variants_func]
        )
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "generate_monologue_variants":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        return {
            "monologue_a": [
                params["monologue_a"]["very_suspicious"],
                params["monologue_a"]["suspicious"],
                params["monologue_a"]["neutral"],
                params["monologue_a"]["trusting"],
                params["monologue_a"]["very_trusting"],
            ],
            "monologue_b": [
                params["monologue_b"]["very_suspicious"],
                params["monologue_b"]["suspicious"],
                params["monologue_b"]["neutral"],
                params["monologue_b"]["trusting"],
                params["monologue_b"]["very_trusting"],
            ],
            "monologue_self": [
                params["monologue_self"]["very_suspicious"],
                params["monologue_self"]["suspicious"],
                params["monologue_self"]["neutral"],
                params["monologue_self"]["trusting"],
                params["monologue_self"]["very_trusting"],
            ]
        }
    
    def get_dilemma_convo(self, customer, dilemma, timeline, log_callback=None):
        log_callback(f"[dim]{customer['id']} share the dilemma...[/dim]") if log_callback else None
        dilemma_chat = self._expopse_dilemma(customer, dilemma, timeline)
        log_callback(f"[dim]{customer['id']} share the beliefs A...[/dim]") if log_callback else None
        belief_a_chat = self.share_beliefs(
            customer, 
            dilemma, 
            timeline, 
            dilemma["choice_a"], 
            dilemma["choice_b"], 
            dilemma["belief_a"]
          )
        log_callback(f"[dim]{customer['id']} share the beliefs B...[/dim]") if log_callback else None
        belief_b_chat = self.share_beliefs(
            customer, 
            dilemma, 
            timeline, 
            dilemma["choice_b"], 
            dilemma["choice_a"], 
            dilemma["belief_b"]
          )
        log_callback(f"[dim]{customer['id']} share the decision...[/dim]") if log_callback else None
        decision_chat = self.share_decision(
            customer, 
            dilemma, 
            timeline, 
            dilemma["choice_a"], 
            dilemma["choice_b"], 
        )
        return {
            "preference": dilemma["preference"],
            "dilemma": dilemma_chat,
            "belief_a": belief_a_chat,
            "belief_b": belief_b_chat,
            "decision": decision_chat
        }
