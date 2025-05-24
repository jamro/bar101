import json

get_system_message = lambda world_context, customer, timeline_info: f"""# BACKGROUND
{world_context['background']}

# DECISION MAKER:
Name: {customer['name']}
Age: {customer['age']}
Sex: {customer['sex']}
Job Title: {customer['job_title']}
Access to information: {customer['access']}
{customer['details']}

# TIMELINE
{timeline_info}
"""

get_prompt = lambda customer_name, dilemma, choice, outcome, events: f"""
**{customer_name}** faced a dilemma: **{dilemma}**.
**{customer_name}** make a choice: **{choice}**.
The choice leads to the outcome: **{outcome}**.

# NEW EVENTS (triggered by the choice made by **{customer_name}**):
{json.dumps(events, indent=2)}

# INSTRUCTIONS
`refine_events` that occurred as a result of the choice made by **{customer_name}**.
- Ensure smooth and logical transition from the TIMELINE to NEW EVENTS.
- When neccesary edit, merge or remove NEW EVENTS to ensure smooth transition.
- Add neccessary details to NEW EVENTS to make them more logical and meaningful. Introduce new events if needed.
- Include details of decion made by **{customer_name}** in the NEW EVENTS as part of the smooth and logical transition.
- Events must be consistent with the world context and the decision maker's profile.
- Make sure events are plausible and realistic. All events MUST create a logical cause and effect chain.
- Adjust time of events to make them more realistic and logical. Make sure the events are in chronological order.
- Avoid overuse of technical jargon when it could lead to confusion or lack of understanding.
- When referring to system failures, limit to BCI (Behavioral Compliance Index) and it's impact on lifes of citizens.
- Make sure that there are no more then 5 NEW EVENTS while ensuring logical transition and including decision of **{customer_name}**.
- Style: compact, informative, easy to understand
"""
