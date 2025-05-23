
get_system_message = lambda background, events: f"""# BACKGROUND
{background}

# TIMELINE
{events}
"""

get_brainstorm_prompt = lambda plot_stage, chapter_examples: f"""
Brainstorm 8 distinct ideas for the next chapter of the storyline.
The next chapter should start 3 days after the last event in the timeline and carry on for next 2-3 weeks.
Make sure each version is distinct and push the story in a different direction.
Be specific and detailed about story elements, characters, and events.
Avoid overuse of technical jargon when it could lead to confusion or lack of understanding.
Ensure cause and effect are clear and logical for entire timeline.
Do not repeat events that are already in the timeline - ensure unique plot development.
Be creative and do not copy examples provided below - use them as guidelines only.
Next chapter should build on top of recent events from the timeline but additional should also refer to some more distant in time event
Make sure that the story build that way is engaging and follow best practices for storytelling.
The chapter must be surprising but realistic in the context of the world and the events that happened in the past.
Do not introduce any new characters or locations in the next chapter.

For each idea, explain how it build on the lastest events. In addition, provide more distant in time past event that the chapter refers to.

# Next Chapter: {plot_stage['name']}
- Purpose: {plot_stage['purpose']}
- Core Idea: {plot_stage['core']}
- Examples: 
   * {chapter_examples}

"""

get_fork_prompt = lambda plot_stage, chapter_examples: f"""
Fork the storyline described by creating two two distinct version of the next chapter.
Pick most impactful, engaging and distinct ideas from the brainstorming session before and improve them.
The next chapter should start 3 days after the last event in the timeline and carry on for next 2-3 weeks.
Make sure each version is distinct and push the story in a different direction.
Be specific and detailed about story elements, characters, and events.
For each of the branched chapter, create series of 3 - 5 events that happened between end of the current timeline and the end of the branched chapter.
Events should provide additional context and details to the chapter. Be specific and provide all necessary details.
The events should be clear, compact and easy to understand.
Avoid overuse of technical jargon when it could lead to confusion or lack of understanding.
When referring to system failures, limit to BCI (Behavioral Compliance Index) and it's impact on lifes of citizens or politics.
Ensure cause and effect are clear and logical for entire timeline.
Do not repeat events that are already in the timeline - ensure unique plot development.
Do not introduce any new characters or locations in the next chapter.

# For each branch:
- Make sure they are unique and distinct perspectives allowing the plot to develope in multiple direction. 
- Make sure each branch is engaging, and specific. Avoid technical jargon that could be hard to understand. 
- Make each branch aligned with background of the world.
- All branches must be meaningful and have wide impact on many citizens and/or key politics. 
- Each branch should be continuation of the previous chapter building on the past events.
- Do not mention Bar 101 directly in the branches.

# Next Chapter: {plot_stage['name']}
- Purpose: {plot_stage['purpose']}
- Core Idea: {plot_stage['core']}

"""
