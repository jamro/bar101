
get_system_message = lambda background, story_summary: f"""# BACKGROUND
{background}

# STORY

{story_summary}
"""

get_prompt = lambda word_count: f"""You are a skilled storyteller. 
Based on the provided story summary (including chapter summaries and a chronological list of key events)
write a single, cohesive paragraph of approximately {word_count} words that retells the entire story in an engaging and easy-to-read way. Y
our goal is to craft a compact yet vivid narrative that flows smoothly from beginning to end, clearly showing the sequence of events, 
the motivations of characters, and how the story unfolds over time.

The output must:
- Read like a miniature story, not a list or abstract.
- Maintain a clear narrative arc: introduce the setting and main character(s), build tension through key events, escalate toward a climax, and conclude with a satisfying resolution or final note.
- Be rich in information but never overwhelming - balance density with clarity.
- Use simple but expressive language, avoiding overly complex constructions.
- Keep the paragraph flowing logically, ensuring transitions between events are natural and easy to follow.
- Focus on evnets and facts that are relevant to the storyline.
- Avoid headings, chapters, or section breaks. Only one paragraph.

Your goal is to make the reader feel like they just experienced the whole story - briefly, vividly, and in one sitting.
"""
