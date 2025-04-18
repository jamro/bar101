import os
from rich.console import Console

console = Console()


def extract_node(story_root, target_root, variant_path=[]):
  node_path = os.path.abspath(os.path.join(story_root, *variant_path, "node.json"))
  varian_a_path = os.path.abspath(os.path.join(story_root, *variant_path, "a"))
  varian_b_path = os.path.abspath(os.path.join(story_root, *variant_path, "b"))

  if not os.path.exists(node_path):
    console.print(f"Node at {"/".join(variant_path)} does not exist! Skipping branch", style="bold red")
    return
  
  console.print(f"Extracting node at /{'/'.join(variant_path)}", style="blue")
  target_file_path = os.path.abspath(os.path.join(target_root, f"node_x{"".join(variant_path)}.json"))
  console.print(f"Source node path: {node_path}", style="blue")
  console.print(f"Target node path: {target_file_path}", style="blue")

  # copy node.json to target path
  os.makedirs(os.path.dirname(target_file_path), exist_ok=True)
  with open(node_path, "r") as source_file:
    with open(target_file_path, "w") as target_file:
      target_file.write(source_file.read())

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
  target_root = os.path.join(os.path.dirname(__file__), "../../../bar101-storytree")

  extract_node(story_root, target_root)


