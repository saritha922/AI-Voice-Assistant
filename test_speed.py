
import os
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options=types.HttpOptions(
        timeout=30000,
        retry_options=types.HttpRetryOptions(
            attempts=1
        )
    )
)

print("Testing Gemini 3.1 Flash Lite...")

start = time.time()

try:
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents="Reply in one sentence: What is SQL?"
    )

    print("AI Answer:", response.text)

except Exception as e:
    print("API Error:", e)

finally:
    print("Total time:", round(time.time() - start, 2), "seconds")
