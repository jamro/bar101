import json
import random

NEWS_IMAGES = json.load(open("assets/news_images.json"))

get_system_message = lambda background, events, outcome: f"""# BACKGROUND
{background}

# TIMELINE
{json.dumps(events, indent=2)}

# NEWS
{outcome}

# NEWS_IMAGES
{json.dumps(random.sample(NEWS_IMAGES, 20), indent=2)}
"""

get_match_image_id_prompt = lambda news_excerpt: f"""
You are given a news excerpt and a list NEWS_IMAGES. Your task is to:
1. Read the news excerpt carefully.
2. Identify the dominant themes, emotional tone, visual setting, and symbolic motifs present in the text.
3. From the list of NEWS_IMAGES, select the one image that most closely matches the mood, symbolism, or setting of the news.
 - The match does not need to be literal.
 - It should evoke the same feeling, visual metaphor, or atmosphere as the news excerpt.
4. Return the id of the best matching image.
 - Return only the id, no other text.
 - The id must be in the list of NEWS_IMAGES.

News Excerpt:
{news_excerpt}
"""

get_official_prompt = lambda segment_count, extra_context: f"""Write and `publish_news` as a brief news segments (5-10 seconds) as broadcast on Stenograd State Broadcast (SSB) 
the official propaganda channel in a technocratic dictatorship. Use the following:
- Use NEWS as the core update that must be announced
- Use the background from the TIMELINE that provides context for the event
- Pick {segment_count} events from the TIMELINE to create {segment_count} news segments. (if there is no event, in the TIMELINE, generate a new one)

Rules:
1. Use only publicly available information. If an internal or semi-public fact is important, you may only refer to its public effects or visible outcomes, never the internal mechanisms or leaked details.
2. The tone should frame the news in a positive, stabilizing, or rational light, consistent with Stenograd's technocratic narrative.
3. Never lie or contradict the truth — instead, use framing, omission, or emphasis to guide public interpretation.
4. Use punchy language: one headline and 1-2 short lines from the anchor. Make sure it is easy to read and understand. Avoid jargon or overly complex language.
5. Be specific and avoid vague or generic statements. Use concrete details and examples to illustrate your points.
6. Structure the news spot as:
 - Image (on-screen) - The image should be a visual representation of the news segment. The id MUST be in the list of NEWS_IMAGES.
 - Headline (on-screen + voice-over) - Use title case or sentence case only (not all caps)
 - Anchor Line (calm, controlled tone) - 1 sentence stating the event — framed positively or neutrally
 - Contextual Reframing - Short sentence that emphasizes systemic efficiency, resilience, or progress
7. For pauses, use periods or ellipses only. Never use dashes or hyphens.

{extra_context}
"""

get_underground_prompt = lambda segment_count, extra_context: f"""Write and `publish_news` as a brief underground news segments (5-10 seconds) for a pirate broadcast 
in Stenograd — operating outside the control of official state media.
- Use the same NEWS and TIMELINE as the propaganda spot.
- Generate {segment_count} news segments, each focusing on a different issue or event.
- Present a sharper, more emotional, or skeptical tone — the voice of those living under the system, sharing what's really happening.
- Mix verifiable truths with semi-public knowledge, suppressed facts, or well-sourced rumors and leaks.
- Format it like a scrappy, quickly edited cutscene seen on a hacked feed or darknet stream.
- Make sure it is easy to read and understand. Avoid jargon or overly complex language.
- The segemnt should clearly communicatte the NEWS through segments that are punchy and engaging.
- For pauses, use periods or ellipses only. Never use dashes or hyphens.

Structure the news spot as:
 - Image (on-screen) - The image should be a visual representation of the news segment. The id MUST be in the list of NEWS_IMAGES.
 - Headline (on-screen + voice-over) - Use title case or sentence case only (not all caps)
 - Anchor Line (calm, controlled tone) - 1 sentence stating the event - framed negatively or with sarcasm
 - Contextual Reframing - 1-2 sentences that emphasizes systemic efficiency, resilience, or progress

{extra_context}

Constraints:
	1.	Tone may be urgent, ironic, bitter, sarcastic, raw, or emotional — reflect the resistance.
	2.	You may reference internal mechanisms if they are semi-public or leaked — as long as it reflects the kind of info that could circulate in the underground.
	3.	Use short, punchy lines — think pirate radio, activist voice, or citizen journalist.
	4.	Highlight contradictions in the official narrative or connect dots the state won’t.
"""

get_image_prompt = lambda image_description: f"""
Create a stylized, ominous illustration in a vintage propaganda or graphic novel style reminiscent of mid-20th-century dystopian art.
Use a limited, muted color palette dominated by deep browns, desaturated reds, dark beiges, and near-black tones, with selective red accents for emotional emphasis.
All characters should have black skin, circular light-filled eyes, and bright red noses for immediate, symbolic readability.
Figures must be minimal and geometric with simplified anatomy, strong silhouettes, and heavy shadows.
Set the scene in a cracked, decaying environment with worn textures, minimal background detail, and flat but dramatic lighting.
The composition should evoke a feeling of isolation, control, and post-apocalyptic tension.
Use strong symmetry or framing to reinforce themes of surveillance, conformity, or unease.

Scene focus: An abstract, symbolic visualization of a news story:
---
{image_description}
---

Instructions:
-	Do not include any text in the image.
-	Do not show the TV, the news interface, or graphics — only the visual metaphor.
-	Prioritize bold, readable composition suitable for small-scale viewing.
-	Avoid small details or intricate patterns.
"""
