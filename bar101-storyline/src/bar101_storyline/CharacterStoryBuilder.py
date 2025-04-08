from openai import OpenAI
import os
import json

get_system_message = lambda background, character, events, character_story, extra_context: f"""# BACKGROUND
{background}

# CHARACTER PROFILE
Name: {character['name']}
Age: {character['age']}
Sex: {character['sex']}
Job Title: {character['job_title']}
Access to information: {character['access']}
{character['details']}

# CHARACTER'S CURRENT STORY
{character_story}

# RECENT GLOBAL EVENTS
{json.dumps(events, indent=2)}

{extra_context}
"""

get_prompt = lambda: f"""You are provided with:
- A CHARACTER PROFILE (background, beliefs, occupation, emotional state, relationships, etc.)
- CHARACTER'S CURRENT STORY (what has happened to them so far)
- A set of RECENT GLOBAL EVENTS (from the past few days)

# Your Task:
Write a 150-word paragraph showing how two related external events have directly affected the character's daily life. 
Focus on a single, specific story arc that illustrates the character's response to these events.
Make sure it is understandable without extra context. Avoid vague language and ensure clarity.
The result should read like a clear, factual entry in a character-focused case file or narrative log.

# Output Guidelines:
Perspective: Third-person, limited to what the character knows or believes
Tone: Neutral, factual, emotionally restrained
Length: Exactly 100 words
Language: Plain, specific, and unambiguous. No metaphors or poetic phrases.

# Content Rules:
1. External Events Only - The character does not cause or influence the events. Show how outside forces change their behavior or thinking.
2. Two Related Events - Select two events that interact or build on each other. Show how both lead to a noticeable change.
3. Lived Impact - Do not describe the events directly. Instead, show their effect on routines, decisions, environments, or relationships.
4. Cause and Effect - Ensure each sentence shows either:
 - A direct consequence of the events
 - A new action or behavior
 - A shift in thinking or habits
 - A lasting effect or unresolved issue
5. Specificity - Include a specific situation as an example that happend within one day. Use clear, concrete details. Avoid vague words like “pressure,” “distress,” or “disruption.” Show exactly what changed and how.
6. Narrative Continuity - The paragraph should logically extend the character’s arc, not feel like a standalone moment.
7. Avoid Overuse of Technical Terms - Use domain-specific language only when necessary, and only if the meaning is immediately clear in context. Avoid jargon or abbreviations that require explanation.
8. Narrative Continuity - The paragraph must extend CHARACTER'S CURRENT STORY. Do not restate past facts or reset the narrative. Build on what the character is already experiencing.
9. If it was explicitly stated that the character faced a DILEMMA recently, begin the story with the dilemma - make their decision and central to the plot.
10. Style - Engaging and easy to understand.

# Optional structure for clarity:
Event -> Immediate disruption -> Emotional or behavioral shift -> Coping or adaptation -> Lingering tension or result
"""

class CharacterStoryBuilder:

    def __init__(self, openai_api_key):
        self.client = OpenAI(api_key=openai_api_key)
        self.world_context = None
        self.model = "gpt-4o"
        self.chapters = {}

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
        self.chapters[character_id].append(chapter)
    
    def create_character_chapter(self, character_id, events, extra_context=""):
        character = None
        for customer in self.world_context["bar"]["customers"]:
            if customer["id"] == character_id:
                character = customer
                break
            
        character_story = self.chapters[character_id]
        character_story = '\n\n'.join(character_story) if len(character_story) > 0 else 'No recent events related the character.'
        system_message = get_system_message(self.world_context['background'], character, events, character_story, extra_context)
        prompt = get_prompt()

        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        response = self.client.chat.completions.create(model=self.model, messages=messages)
        
        chapter = response.choices[0].message.content
 
        return chapter
        