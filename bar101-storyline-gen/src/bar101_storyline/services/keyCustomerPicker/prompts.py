
get_system_message = lambda world_context, customer, character_stats, outcome_info, timeline_info: f"""# BACKGROUND
{world_context['background']}

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

# STORY SUMMARY
{outcome_info}

# TIMELINE
{timeline_info}
"""

get_dilemma_prompt = lambda customer_name, branch_a, branch_b, events_a, events_b: f"""
# NEXT CHAPTER (VARIANT A)
**{branch_a}**
Events: 
{events_a}

# NEXT CHAPTER (VARIANT B)
**{branch_b}**
Events: 
{events_b}

-----
Describe how actions or decisions of {customer_name} influenced the story's transition from the TIMELINE to the NEXT CHAPTER. 
{customer_name} faced a binary, mutually exclusive choice — leading the story down the path of either VARIANT A or VARIANT B.
Both choices must be triggered by the same situation, but they diverge in their consequences.
Their influence MUST BE DIRECT leading to NEXT CHAPTER events. The decision is shaped in part by their conversations with Alex, the bartender (do not mention Alex directly in the events or variants).
Both paths were viable and probable, but {customer_name} ultimately made a decision that steered the story forward.
Make sure that the dilema and actions are inline with the character's personality, job position and area of influence. {customer_name} MUST be authorized to perform actions related to the decision.
Make sure both variants are mutually exclusive and {customer_name} must chose one or the other.

As a result provide:
- Cause: One of recent global events or situations that DIRECTLY lead the customer's make face the dilemma. Explain why it is plausible and inline with the character's profile. It must be a signifficant event. Do not refer to Bar 101 or Alex.
- Dilema theme: For example: 'Leak a document or destroy it', 'Call for reinforcements or handle it alone', 'Delay a project or push it forward unprepared', 'Report a colleague or cover for them', 'Break protocol to help someone or follow orders', 'Sabotage a rival or compete fairly', 'Cancel the operation or proceed at risk', 'Authorize force or seek negotiation', 'Investigate suspicious activity or ignore it'
-	Dilemma: The key conflict or decision they faced. It must be logical result of the Cause from previous step.
- Alignment: Explain why the choice is aligned with {customer_name} job position and area of influence.
- Reason: Why the customer is unsure about the decision and how it is connected with {customer_name} job positition
-	Variant A: The choice that leads to VARIANT A from the TIMELINE
    * Belief A: Belief of {customer_name} that leads to chose VARIANT A. It must be opposite of the belief B.
    * Political support A: Political faction which is supported by the VARIANT A. Possible values: 'harmonists', 'innovators', 'directorate' or 'rebel'
    * Transition Events A: 2-3 events that are between the TIMELINE and VARIANT A ensuring the story's transition. It icludes trigger_event events, customer's actions, and their consequences that leads to VARIANT A. Be specific and provide all necessary details.
-	Variant B: The choice that leads to VARIANT B from the TIMELINE
    * Belief B: Belief of {customer_name} that leads to chose VARIANT B. It must be opposite of the belief A.
    * Political support B: Political faction which is supported by the VARIANT B. Possible values: 'harmonists', 'innovators', 'directorate' or 'rebel'
    * Transition Events B: 2-3 events that are between the TIMELINE and VARIANT B ensuring the story's transition. It icludes trigger_event events, customer's actions, and their consequences that leads to VARIANT B. Be specific and provide all necessary details.
- Preference: Variant that {customer_name} prefers. It must be aligned with character profile, political preferences and backstory. Allowed values: A or B.

"""

get_refine_prompt = lambda: f"""
`refine_customer_dilemma` to make it more vivid, emotionally engaging, and clearly binary, ensuring both choices are mutually exclusive and lead to distinct story outcomes (VARIANT A or VARIANT B).
Maintain the customer's connection to Alex, the bartender, as a key influence on their thought process.
Make sure a smooth and logical transition from the TIMELINE to the VARIANT A and VARIANT B.
Include in transition events the trigger_event events, customer's actions, and their consequences that leads to VARIANT A and VARIANT B.
Keep minimal number of events that ensures smooth and logical story transition.
Avoid overuse of technical jargon when it could lead to confusion or lack of understanding.
"""