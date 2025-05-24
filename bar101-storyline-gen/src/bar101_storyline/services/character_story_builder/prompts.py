import json

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
11. Do not mention Bar 101 or the bartender.

# Optional structure for clarity:
Event -> Immediate disruption -> Emotional or behavioral shift -> Coping or adaptation -> Lingering tension or result

# Output
Return the result using the `store_character_chapter` function.
"""

get_dilemma_prompt = lambda character_stats, dilemma, choice, outcome: f"""
# CHARACTER DECISION
Due to recent event: {dilemma['trigger_event']}, character had to make a decision.
The dilemma was: {dilemma['dilemma']}.
It was hard for the character due to: {dilemma['reason']}.
The character's decision was: {choice} 
The decision lead to the following outcome: {outcome}.

You are provided with:
- A CHARACTER PROFILE (background, beliefs, occupation, emotional state, relationships, etc.)
- CHARACTER'S CURRENT STORY (what has happened to them so far)
- CHARACTER DECISION

# Your Task:
Write and store a 150-word paragraph showing what actions the character took as a result of the decision and what was the outcome of the decision.
Explain how the decision lead to the outcome.
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
10. Do not mention Bar 101 or the bartender.

# Output
Return the result using the `store_character_chapter` function.
"""