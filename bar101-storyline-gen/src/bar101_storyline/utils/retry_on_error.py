import traceback
from functools import wraps

def retry_on_error(max_attempts: int = 3):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for i in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    print(f"Attempt {i + 1} failed: {e}")
                    if i < max_attempts - 1:
                        print("Retrying...")
            traceback.print_exc()
            raise Exception(f"Failed after {max_attempts} attempts: {last_error}")
        return wrapper
    return decorator