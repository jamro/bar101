import json

get_system_message = lambda background, customer, character_stats, recent_story, outcome_timeline, events: f"""#BACKGROUND
{background}

# CHARACTER PROFILE
Name: {customer['name']}
Age: {customer['age']}
Sex: {customer['sex']}
Job Title: {customer['job_title']}
Access to information: {customer['access']}
Political Preferences: {character_stats['political_preference']}
BCI Score: {character_stats['bci_score']}
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
- Ensure the situation is aligned with the character's profile
- Make it interesting and immersive by focusing on details, emotions, or unexpected outcomes.
"""

get_neutral_prompt = lambda customer, question: f"""Imagine you are {customer['name']}. 
Once you have entered the bar, bartender Alex served you a drink and started a conversation by asking you: "{question}".
Write a short monologue in response - not a dialogue. 
Use this moment to reveal hobby of {customer['name']} and related activities. 
Assume the bartender doesn't know what your hobby is.

# Guidelines
- Format: 4-8 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions, max 10-15 words each)
- Tone: Conversational and natural
- Style: align with the character's communication style, personality and political preferences
- Language: Avoid technical jargon, vague statements, or overly generic wording
- Be specific about the hobby and its nuances. {customer['name']} is an expert in the hobby.
- Make sure details about hobby are realistic and technically correct - do not make things up
- Do not ask questions or request any actions from Alex
- Monologue should end naturally — no need for dramatic conclusion or exit line
- Ensure smooth and natural transtion from answering bartender's to talking about your hobby
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points
- For pauses, use periods or ellipses only. Never use dashes or hyphens.

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language (up to 4 bullet points)
- Suspicious: Gives a bit more, but still cautious (up to 5 bullet points)
- Neutral: Comfortable enough to speak plainly (up to 6 bullet points)
- Trusting: Open and more personal (up to 7 bullet points)
- Very Trusting: Speaks freely, includes more background about yourself and the world (up to 8 bullet points)

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
- Format: 5-9 bullet points of what {customer['name']} says (short spoken phrases only, no narration or descriptions of actions/emotions, max 10-15 words each)
- Tone: Conversational and natural
- Style: align with the character's communication style, personality and political preferences
- Language: Avoid technical jargon, vague statements, or overly generic wording
- Be specific about the hobby and its nuances. {customer['name']} is an expert in the hobby.
- Make sure details about hobby are realistic and technically correct - do not make things up
- Do not ask questions or request any actions from Alex
- Monologue should end naturally — no need for dramatic conclusion or exit line
- Ensure smooth and natural transtion from answering bartender's to talking about recent events
- Make sure the monologe's is a natural logical and smooth flow of thoughts, with a clear connection between points
- For pauses, use periods or ellipses only. Never use dashes or hyphens.

# Variants
Write five monologue variants, each reflecting a different level of trust {customer['name']} feels toward the bartender:
- Very Suspicious: Shares minimal detail, guarded language (up to 5 bullet points)
- Suspicious: Gives a bit more, but still cautious (up to 6 bullet points)
- Neutral: Comfortable enough to speak plainly (up to 7 bullet points)
- Trusting: Open and more personal (up to 8 bullet points)
- Very Trusting: Speaks freely, includes more background about yourself and the world (up to 9 bullet points)

# Across all versions:
- ALWAYS refer to some recent event that affected your hobby
- As trust increases, shift from public and widely known information to private insights, personal experiences, and secrets known only by the character
- Include world background and recent events appropriate to the level of trust

# Output
Return the result using the generate_monologue_variants function.
"""