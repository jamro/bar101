import os
from rich.console import Console
import json
from PIL import Image

console = Console()


def extract_node(story_root, target_root, variant_path=[]):
  node_dir = os.path.abspath(os.path.join(story_root, *variant_path))
  node_path = os.path.abspath(os.path.join(node_dir, "node.json"))
  varian_a_path = os.path.abspath(os.path.join(story_root, *variant_path, "a"))
  varian_b_path = os.path.abspath(os.path.join(story_root, *variant_path, "b"))

  if not os.path.exists(node_path):
    console.print(f"Node at {'/'.join(variant_path)} does not exist! Skipping branch", style="bold red")
    return
  
  console.print(f"Extracting node at /{'/'.join(variant_path)}", style="blue")
  target_file_path = os.path.abspath(os.path.join(target_root, f"node_x{''.join(variant_path)}.json"))
  console.print(f"Source node path: {node_path}", style="blue")
  console.print(f"Target node path: {target_file_path}", style="blue")

  # copy node.json to target path
  os.makedirs(os.path.dirname(target_file_path), exist_ok=True)
  with open(node_path, "r") as source_file:
    with open(target_file_path, "w") as target_file:
      raw_data = source_file.read()
      json_data = json.loads(raw_data)
      for i, n in enumerate(json_data['news']['official']):
        json_data['news']['official'][i]["image"] = f"news/{n['image_id']}.jpg"
      for i, n in enumerate(json_data['news']['underground']):
        json_data['news']['underground'][i]["image"] = f"news/{n['image_id']}.jpg"
      json.dump(json_data, target_file, indent=2)

  # check variants
  if os.path.exists(varian_a_path):
    console.print(f"Found variant A at /{'/'.join(variant_path)}", style="green bold")
    extract_node(story_root, target_root, variant_path + ["a"])

  if os.path.exists(varian_b_path):
    console.print(f"Found variant B at /{'/'.join(variant_path)}", style="green bold")
    extract_node(story_root, target_root, variant_path + ["b"])
  
  
if __name__ == "__main__":
  console.print("Extracting nodes from the story tree...", style="bold green")
  story_root = os.path.join(os.path.dirname(__file__), "../../story_tree")
  context_root = os.path.join(os.path.dirname(__file__), "../../context")
  target_root = os.path.join(os.path.dirname(__file__), "../../../bar101-storytree")

  extract_node(story_root, target_root)

  # copy context.json to target path
  console.print("Copying context.json...", style="bold green")
  world_path = os.path.abspath(os.path.join(context_root, "world.json"))
  target_world_path = os.path.abspath(os.path.join(target_root, "world_context.json"))
  console.print(f"Source world path: {world_path}", style="blue")
  console.print(f"Target world path: {target_world_path}", style="blue")
  os.makedirs(os.path.dirname(target_world_path), exist_ok=True)
  with open(world_path, "r") as source_file:
    with open(target_world_path, "w") as target_file:
      target_file.write(source_file.read())
  console.print("Done!", style="bold green")
  console.print("All nodes extracted!", style="bold green")


  """
  for file in os.listdir(node_dir):
    if not file.startswith("news_img_") or not file.endswith(".png"):
      continue
    source_file_path = os.path.join(node_dir, file)
    target_file_path = os.path.join(target_root, f"news_img_x{''.join(variant_path)}_{file.split('_')[-1]}")
    target_file_path = os.path.splitext(target_file_path)[0] + ".jpg"
    with Image.open(source_file_path) as img:
      if img.mode in ("RGBA", "P"): 
        img = img.convert("RGB")
      new_size = (int(img.width * 0.6), int(img.height * 0.6))
      resized_img = img.resize(new_size, Image.LANCZOS)
      resized_img.save(target_file_path, format="JPEG", quality=65, optimize=True)  
  
  """

  # extracting news images.
  console.print("Extracting news images...", style="bold green")
  source_news_root = os.path.join(os.path.dirname(__file__), "../../assets/news")
  target_news_root = os.path.join(target_root, "news")
  os.makedirs(target_news_root, exist_ok=True)

  for file in os.listdir(source_news_root):
    if not file.endswith(".png"):
      continue

    console.print(f"Processing {file}...", style="blue")
    source_file_path = os.path.join(source_news_root, file)
    target_file_path = os.path.join(target_news_root, file.replace(".png", ".jpg"))
    with Image.open(source_file_path) as img:
      if img.mode in ("RGBA", "P"): 
        img = img.convert("RGB")
      new_size = (int(img.width * 0.6), int(img.height * 0.6))
      resized_img = img.resize(new_size, Image.LANCZOS)
      resized_img.save(target_file_path, format="JPEG", quality=65, optimize=True)  

