import os
from lib import generate_voiceover
import json
from TTS.api import TTS

root_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "bar101-storytree")
context_path = os.path.join(root_path, "world_context.json")

with open(context_path, "r") as f:
    context = json.load(f)

model =  TTS(model_name="tts_models/en/vctk/vits", progress_bar=True)

# CONTEXT ------------------------------------------------------------------------------------

# Alex
phrases = context["bar"]["bartender"]["phrases"].keys()
for phrase in phrases:
    variants = context["bar"]["bartender"]["phrases"][phrase]
    for i in range(1, len(variants)):
        generate_voiceover(
            "context",
            "aradan",
            variants[i],
            model=model
        )

# Customers
cusomers = context["bar"]["customers"]
for customer in cusomers:
    generate_voiceover(
        "context",
        customer['id'],
        customer['wrong_opener'],
        model=model
    )
    phrases = customer["phrases"].keys()
    for phrase in phrases:
        variants = customer["phrases"][phrase]
        for i in range(1, len(variants)):
            generate_voiceover(
                "context",
                customer['id'],
                variants[i],
                model=model
            )


# NODE FILES ------------------------------------------------------------------------------------
all_files = os.listdir(root_path)
node_files = [f for f in all_files if f.startswith("node_") and f.endswith(".json")]

for node_file in node_files:
    node_id = node_file.split(".")[0]
    node_json = os.path.join(root_path, node_file)
    with open(node_json, "r") as f:
        node = json.load(f)

    # NEWS
    for news in node["news"]["official"].keys():
        generate_voiceover(
            node_id,
            "news_official",
            node["news"]["official"][news],
            model=model
        )
    for news in node["news"]["underground"].keys():
        generate_voiceover(
            node_id,
            "news_underground",
            node["news"]["underground"][news],
            model=model
        )

    # CUSTOMERS
    for customer_id in node["chats"].keys():
        customer = node["chats"][customer_id]
        
        # OPENER
        generate_voiceover(
            node_id,
            "aradan",
            customer["opener"]["questions"]["neutral"],
            model=model
        )
        for question in customer["opener"]["questions"]['hobby']:
            generate_voiceover(
                node_id,
                "aradan",
                question['message'],
                model=model
            )
        for question in customer["opener"]["neutral_answer"]:
            for variant in question:
                generate_voiceover(
                    node_id,
                    customer_id,
                    variant,
                    model=model
                )
        for question in customer["opener"]["hobby_answer"]:
            for variant in question:
                generate_voiceover(
                    node_id,
                    customer_id,
                    variant,
                    model=model
                )
        
        # MAIN
        segments = ["main", "emotional", "factual"]
        for segment in segments:
            generate_voiceover(
                node_id,
                "aradan",
                customer["main"][segment]["opener"],
                model=model
            )
            for variant in customer["main"][segment]["variants"]:
                for text in variant:
                    generate_voiceover(
                        node_id,
                        customer_id,
                        text,
                        model=model
                    )
        