from openai import OpenAI
import os
import json
from lib import ask_llm

get_system_message = lambda background, character, character_stats, events, character_story: f"""# BACKGROUND
{background}

# CHARACTER PROFILE
Name: {character['name']}
Age: {character['age']}
Sex: {character['sex']}
Job Title: {character['job_title']}
Access to information: {character['access']}
Political Preferences: {character_stats['political_preference']}
Initial BCI Score: {character_stats['bci_score']}
{character['details']}

# CHARACTER'S CURRENT STORY
{character_story}

# RECENT GLOBAL EVENTS
{json.dumps(events, indent=2)}

"""

get_standard_prompt = lambda character_stats: f"""You are provided with:
- A CHARACTER PROFILE (background, beliefs, occupation, emotional state, relationships, etc.)
- CHARACTER'S CURRENT STORY (what has happened to them so far)
- A set of RECENT GLOBAL EVENTS (from the past few days)

# Your Task:
Write and store a 150-word paragraph showing how two related external events have directly affected the character's daily life. 
Focus on a single, specific story arc that illustrates the character's response to these events.
Make sure it is understandable without extra context. Avoid vague language and ensure clarity.
The result should read like a clear, factual entry in a character-focused case file or narrative log.
Prioritize latest events to ensure the story is current, relevant and convey information about actual global situation.

# Output Guidelines:
Perspective: Third-person, limited to what the character knows or believes
Tone: Neutral, factual, emotionally restrained
Length: Exactly 150 words
Language: Plain, specific, and unambiguous. No metaphors or poetic phrases.
BCI score update: If the story leads to a signifficant change in the character's BCI score, attach the new score. If no change occured, include small fluctuations in the score (e.g., integer between -5 and +5 points). Use initial BCI score as the baseline which is {character_stats['bci_score']}

# Content Rules:
1. External Events Only - The character does not cause or influence the events. Show how outside forces change their behavior or thinking.
2. Two Related Events - Select two events that interact or build on each other. Show how both lead to a noticeable change.
3. Lived Impact - Do not describe the events directly. Instead, show their effect on behaviour, decisions, environments, or relationships.
4. Cause and Effect - Ensure each sentence shows either:
 - A direct consequence of the events
 - A new action or behavior
 - A shift in thinking or habits
 - A lasting effect or unresolved issue
5. Specificity - Include a specific situation as an example that happend within one day. Use clear, concrete details. Avoid vague words like “pressure,” “distress,” or “disruption.” Show exactly what changed and how.
6. Narrative Continuity - The paragraph should logically extend the character's arc, not feel like a standalone moment.
7. Avoid Overuse of Technical Terms - Use domain-specific language only when necessary, and only if the meaning is immediately clear in context. Avoid jargon or abbreviations that require explanation.
8. Narrative Continuity - The paragraph must extend CHARACTER'S CURRENT STORY. Do not restate past facts or reset the narrative. Build on what the character is already experiencing.
9. Style - Engaging and easy to understand.
10. Align the story with the character's political preferences and BCI score. If current BCI score was changed during the chapter - explain the change.

# Optional structure for clarity:
Event -> Immediate disruption -> Emotional or behavioral shift -> Coping or adaptation -> Lingering tension or result

# Output
Return the result using the `store_character_chapter` function.
"""

get_dilemma_prompt = lambda character_stats, dilemma, choice: f"""
# CHARACTER DECISION
Due to recent event: {dilemma['trigger_event']}, character had to make a decision.
The dilemma was: {dilemma['dilemma']}.
It was hard for the character due to: {dilemma['reason']}.
The character's decision was: {choice}.
The decision lead to RECENT GLOBAL EVENTS

You are provided with:
- A CHARACTER PROFILE (background, beliefs, occupation, emotional state, relationships, etc.)
- CHARACTER'S CURRENT STORY (what has happened to them so far)
- CHARACTER DECISION

# Your Task:
Write and store a 150-word paragraph showing what actions the character took as a result of the decision and what was the consequence of the decision.
Focus on a single, specific story arc that illustrates how the character's coped with the decision.
Make sure it is understandable without extra context. Avoid vague language and ensure clarity.
The result should read like a clear, factual entry in a character-focused case file or narrative log.
Explain how character's decision affected RECENT GLOBAL EVENTS.

# Output Guidelines:
Perspective: Third-person, limited to what the character knows or believes
Tone: Neutral, factual, emotionally restrained
Length: Exactly 150 words
Language: Plain, specific, and unambiguous. No metaphors or poetic phrases.
BCI score update: Reflect impact of the decision on the character's BCI score. Most of decisions should lead to significant change in the character's BCI score. (above 15 negative or positive points). Use initial BCI score as the baseline which is {character_stats['bci_score']}

# Content Rules:
1. Character-Driven Change - The character's decision must be the central cause of the events described. Do not attribute the outcome to random chance or unrelated forces.
2. Single Consequence Arc - Focus on one specific situation where the decision had a visible effect. Avoid broad generalizations or multi-threaded outcomes.
3. Observable Impact - Show how the decision changed the character's behavior, relationships, or environment. Describe a specific moment that illustrates the impact.
4. Cause and Effect - Ensure each sentence shows either:
- A direct result of the decision
- A new behavior or shift in mindset
- A lasting consequence or complication
- An unresolved issue emerging from the choice
5. Specificity - Use concrete details to illustrate change. Describe exactly what changed and how.
6. Narrative Continuity - The paragraph must extend the character's current story. Avoid resetting the narrative or reintroducing background already covered.
7. Balanced Tone - Maintain an emotionally restrained, fact-based tone. Do not dramatize the consequences or insert moral judgment.
8. Style - Clear, readable, and structured. Avoid jargon unless it's essential to understanding the outcome.
9. Political and Psychological Alignment - The outcome should align logically with the character's values and BCI score. If the BCI score changes, briefly explain why.

# Optional structure for clarity:
Decision -> Immediate impact -> Shift in behavior or thought -> Coping or reaction -> Lingering effect or complication

# Output
Return the result using the `store_character_chapter` function.
"""

class CharacterStoryBuilder:

    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None
        self.chapters = {}

        self.store_character_chapter_func = {
          "name": "store_character_chapter",
          "description": "Store character chapter showing how related external events have directly affected the character's daily life",
          "parameters": {
            "type": "object",
            "properties": {
              "chapter": {
                  "description": "The paragraph containing the character's story based on recent events",
                  "items": {
                    "type": "string"
                  },
              },
              "old_bci_score": {
                  "description": "The initial character's BCI score before the chapter.",
                  "type": "number",
                  "minimum": 0,
                  "maximum": 100
              },
              "new_bci_score": {
                  "description": "The new character's BCI score after the chapter.",
                  "type": "number",
                  "minimum": 0,
                  "maximum": 100
              },
            },
            "required": ["chapter", "bci_score"]
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

        all_characters = self.get_characters()

        for character_id in all_characters:
            self.chapters[character_id] = []

    def get_characters(self):
        all_customers = self.world_context["bar"]["customers"]
        return [customer["id"] for customer in all_customers ]
    
    def store_character_chapter(self, character_id, chapter):
        if not isinstance(chapter, str):
            print(f"Chapter must be a string, but got {type(chapter)}", chapter)
            raise ValueError("Chapter must be a string.")
        self.chapters[character_id].append(chapter)

    def create_character_chapter(self, character_id, character_stats, events, dilemma=None, choice=None):
        last_error = None
        for i in range(3):
            try:
                response = self._create_character_chapter(character_id, character_stats, events, dilemma, choice)
                if response is not None:
                    return response
                else:
                    raise Exception("No response from the model.")
            except Exception as e:
                last_error = e
                print(f"Error occurred: {e}")
                print("Retrying...")

        raise Exception(f"Failed to create customer chapter after 3 attempts: {last_error}")
        
    def _create_character_chapter(self, character_id, character_stats, events, dilemma=None, choice=None):
        character = None
        for customer in self.world_context["bar"]["customers"]:
            if customer["id"] == character_id:
                character = customer
                break
            
        character_story = self.chapters[character_id]
        character_story = '\n\n'.join(character_story) if len(character_story) > 0 else 'No recent events related the character.'
        system_message = get_system_message(self.world_context['background'], character, character_stats, events, character_story)
        if dilemma is not None and choice is not None:
            prompt = get_dilemma_prompt(character_stats, dilemma, choice)
        else:
            prompt = get_standard_prompt(character_stats)

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        response = ask_llm(
            self.client, 
            messages=messages, 
            functions=[self.store_character_chapter_func]
        )
        if not response.choices[0].finish_reason == "function_call" or not response.choices[0].message.function_call.name == "store_character_chapter":
            raise Exception("The model did not return a function call.")
        params = json.loads(response.choices[0].message.function_call.arguments)

        if abs(params["old_bci_score"] - character_stats["bci_score"]) > 5:
            raise Exception(f"The BCI score in the response does not match the character's current BCI score. Expected {character_stats['bci_score']} but got {params['old_bci_score']}")

        return {
            "chapter": params["chapter"],
            "bci_score": params["new_bci_score"],
            "political_preference": character_stats["political_preference"],
        }
        