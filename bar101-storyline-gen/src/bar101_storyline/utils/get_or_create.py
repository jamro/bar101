import os
import json

def get_or_create(path, create_fn, *args, **kwargs):
    """
    If file at `path` exists, load and return its JSON content.
    Otherwise, call `create_fn(*args, **kwargs)`, save the result to `path`, and return it.
    """
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    else:
        data = create_fn(*args, **kwargs)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        return data