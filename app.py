
import time
from flask import Flask, render_template, request, jsonify

from services.ai_response import get_ai_response

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():

    data = request.get_json(silent=True) or {}

    question = data.get("question", "").strip()

    if not question:
        return jsonify({
            "error": "Please ask a question."
        }), 400

    try:
        start_time = time.time()

        print("\nUser Question:", question)

        answer = get_ai_response(question)

        response_time = round(time.time() - start_time, 2)

        print("Gemini response time:", response_time, "seconds")

        return jsonify({
            "answer": answer,
            "response_time": response_time
        })

    except Exception as e:

        print("AI Error:", str(e))

        return jsonify({
            "error": "AI service is temporarily unavailable. Please try again."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
