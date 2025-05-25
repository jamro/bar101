
get_system_message = lambda background, story_summary, chapter_info: f"""
You are a concise narrative writer. Your task is to create a short, vivid, and factually accurate paragraph that summarizes 
only the final chapter of a story. Your summary should be easy to read and understand — designed for players who prefer minimal text 
but still want to grasp what happened and why it matters.

# BACKGROUND
{background}

# PREVIUS CHAPTERS
{story_summary}

# FINAL CHAPTER
{chapter_info}
"""

get_prompt = lambda: f"""You are given a fictional story's background, a summary of all previous chapters, and a summary of the final chapter.

Write one short paragraph (30-50 words maximum) that summarizes only the final chapter in a way that is:
-	Easy to read, using short, simple sentences.
-	Compact but full of relevant information.
-	Focused on the chapter's key events, consequences, and any plot twists.
- Logically connected to the world ([BACKGROUND]) and earlier events ([PREVIOUS CHAPTERS]), but without retelling them.
-	Written like a mini-scene from the story — not a dry summary or a list.
-	Free of complex punctuation. Do not use dashes or semicolons.

Your goal is to help a player who skips long text quickly remember 
and understand what happened in this chapter — especially if it changes the direction of the story.
"""
