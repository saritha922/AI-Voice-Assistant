
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(
        timeout=30000,
        retry_options=types.HttpRetryOptions(
            attempts=1
        )
    )
)


def get_ai_response(question):

    prompt = f"""
You are a friendly AI voice assistant.

Instructions:
- Understand the user's question.
- Give accurate and helpful answers.
- Use simple English.
- Keep answers short and conversational.
- Answer in 1 to 3 sentences whenever possible.

User Question: {question}

Answer:
"""

    try:
        print("Sending request to Gemini 3.1 Flash Lite...")

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )

        print("Gemini response received!")

        if response.text:
            return response.text.strip()

        return "Sorry, I could not generate an answer. Please try again."

    except Exception as e:
        print("Gemini API Error:", str(e))
        raise
