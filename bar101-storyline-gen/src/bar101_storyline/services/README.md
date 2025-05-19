# Bar101 Storyline Services

This directory contains the core services that power the Bar101 storyline generation system. Each service is responsible for a specific aspect of the narrative generation and character interaction.

## Services Overview

### CharacterStoryBuilder
Generates character-specific story chapters based on global events and character profiles. It creates narrative content that shows how external events affect individual characters' lives, maintaining consistency with their background, beliefs, and emotional state. The service tracks character development through BCI (Bar Customer Index) scores and ensures narrative continuity.

### ChatOpenerEngine
Manages the initial conversation starters between the bartender and customers. It generates contextually appropriate opening lines that help establish rapport and set the tone for deeper conversations.

### ChatStoryEngine
Handles the dynamic generation of customer conversations with the bartender. It creates multiple variants of responses based on the customer's trust level, personality, and current emotional state. The service ensures conversations feel natural and reveal character-specific stories while maintaining consistency with the global narrative.

### DecisionMaker
Processes and generates character decisions in response to events and dilemmas. It evaluates potential outcomes and their impact on both individual characters and the broader narrative.

### NewsWriter
Creates news articles and reports about events happening in the Bar101 world. It ensures news content is consistent with the overall narrative and provides context for character interactions.

### PlotShaper
Coordinates the overall narrative structure and ensures story coherence. It manages plot arcs, character interactions, and the progression of events in the Bar101 world.

### TimelineIntegrator
Maintains and updates the chronological sequence of events. It ensures that all story elements, character actions, and world events are properly synchronized and consistent across the narrative.

### TreePacker
Manages the hierarchical organization of story elements and their relationships. It helps maintain the structure of the narrative and ensures proper connections between different story components.

### KeyCustomerPicker
Identifies and manages key customers who play significant roles in the narrative. It helps determine which characters should be involved in specific story arcs and events.

## Service Integration

These services work together in the following sequence to create a dynamic, interactive narrative system:

1. The NewsWriter describe past events via news broadcast
2. The PlotShaper forks the plot into variants
3. The KeyCustomerPicker identifies key characters for the story and creates a dilemma that will shape the story
4. The TimelineIntegrator consistency of all story variants via dilemma
5. The CharacterStoryBuilder generates individual character stories
6. The ChatOpenerEngine initiates conversations
7. The ChatStoryEngine manages main dialogues
8. The DecisionMaker processes dialogue about character choices and their consequences
9. The TreePacker extract all story elements to a single node file