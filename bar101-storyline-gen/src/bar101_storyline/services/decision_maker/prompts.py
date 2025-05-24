import json

get_system_message = lambda background, customer, character_stats, events=None: f"""#BACKGROUND
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
- Share what direction you are leaning towards and how your political preferences and current BCI score may affect the decision
- For pauses, use periods or ellipses only. Never use dashes or hyphens.

# Variants
Write five monologue variants, each showing the level of trust {customer['name']} feels toward the bartender:
	•	Very Suspicious: Hints at facing a tough choice but stays vague; dilemma is implied, options are not clearly stated (up to 3 bullet points).
	•	Suspicious: Admits to a real dilemma and two paths, but gives minimal context or reasoning (up to 4 bullet points).
	•	Neutral: Clearly states the dilemma and both options; provides basic background without sharing personal stakes (up to 5 bullet points).
	•	Trusting: Opens up about the dilemma, explains the facts behind it, and briefly touches on personal stakes (up to 6 bullet points).
	•	Very Trusting: Fully unpacks the dilemma with all facts, personal reasons, and emotional weight (up to 7 bullet points).

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
- For pauses, use periods or ellipses only. Never use dashes or hyphens.

Tone & Setting:
-	Conversational, layered with subtle tension
-	Avoid vague phrasing or technical jargon
-	Reflect how the city, system, or personal history shapes the hesitation

Output:
Use the `generate_monologue_variants` function to return the result.
"""
