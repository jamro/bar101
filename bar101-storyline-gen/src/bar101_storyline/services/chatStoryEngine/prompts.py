import json

get_system_message = lambda background, customer, character_stats, recent_story, outcome_timeline=None, events=None: f"""#BACKGROUND
{background}

# PROFILE
Name: {customer['name']}
Age: {customer['age']}
Sex: {customer['sex']}
Job Title: {customer['job_title']}
Access to information: {customer['access']}
Political Preferences: {character_stats['political_preference']}
BCI Score: {character_stats['bci_score']}
Comunication style: {customer['communication']}

{customer['details']}

# RECENT STORY OF {customer['name']}
{recent_story}

{'# GLOBAL STORY SUMMARY' if outcome_timeline else ''}
{outcome_timeline}

{'# GLOBAL EVENTS' if events else ''}
{json.dumps(events, indent=2)}
"""

get_main_prompt = lambda customer, question, choice=None: f"""Imagine you are {customer['name']}. 
After having a small talk with bartender Alex about your hobby, Alex asked you: "{question}" to learn what happened to you recently.
Write a short monologue in response - not a dialogue. 
Use this moment to reveal RECENT STORY OF {customer['name']}. 


# Guidelines
- Format: 4-8 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions)
- Tone: Conversational and natural
- Style: align with the character's communication style, personality and political preferences
- Language: Avoid technical jargon, vague statements, or overly generic wording
- Express your feelings and emotions about the recent events
- Share specific details and situations that happened in your RECENT STORY
- If you made an important decision recently, ALWAYS share it and explain how it ipacted GLOBAL EVENTS.
- Do not ask questions or request any actions from Alex
- Monologue should end emotionally allowing Alex to respond empathetically
- Ensure smooth and natural transtion from answering bartender's to talking about your story
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points
- For pauses, use periods or ellipses only. Never use dashes or hyphens.

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language (up to 4 bullet points)
- Suspicious: Gives a bit more, but still cautious (up to 5 bullet points)
- Neutral: Comfortable enough to speak plainly (up to 6 bullet points)
- Trusting: Open and more personal, includes more background about yourself and the world (up to 7 bullet points)
- Very Trusting: Speaks freely, includes more background about yourself and the world revealing political preferences (up to 8 bullet points)

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
- For pauses, use periods or ellipses only. Never use dashes or hyphens.

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language (up to 2 bullet points)
- Suspicious: Gives a bit more, but still cautious (up to 3 bullet points)
- Neutral: Comfortable enough to speak plainly (up to 4 bullet points)
- Trusting: Open and more personal (up to 5 bullet points)
- Very Trusting: Speaks freely, includes more background about yourself and the world (up to 6 bullet points)

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
- Format: 5-9 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions)
- Tone: Conversational and natural
- Style: align with the character's communication style, personality and political preferences
- Your emotion: {emotion}
- Be specific and detailed about the GLOBAL EVENTS
- GLOBAL STORY SUMMARY provides additional context for GLOBAL EVENTS
- Do not ask questions or request any actions from Alex
- Monologue should end naturally — no need for dramatic conclusion or exit line
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points
- For pauses, use periods or ellipses only. Never use dashes or hyphens.

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language (up to 5 bullet points)
- Suspicious: Gives a bit more, but still cautious (up to 6 bullet points)
- Neutral: Comfortable enough to speak plainly. Indirectly reveal your political preferences (up to 7 bullet points)
- Trusting: Open and more personal, revealing your political preferences (up to 8 bullet points)
- Very Trusting: Speaks freely, includes more background about yourself and the world. Be open about your political preferences. (up to 9 bullet points)

# Across all versions:
- ALWAYS refer to GLOBAL EVENTS
- Do NOT repeat ANY information from PREVIOUS CONVERSATION. Focus on new information or add new details
- As trust increases, shift from public and widely known information to private insights, personal experiences, and secrets known only by the character
- Include ONLY information that {customer['name']} could have access to

# Output
Return the result using the generate_monologue_variants function.
"""
