import os, requests, time
from flask import Blueprint, request, jsonify

# Groq API (Free tier - better limits than Gemini)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"  # Free tier model

# Google Gemini API (Fallback - if you have quota)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

chat_bp = Blueprint("chat", __name__, url_prefix="/chat")

SYSTEM = ("You are Python Tutor, a friendly coding assistant. "
          "Use markdown for code blocks and keep answers short.")

def add_cors_headers(response):
    """Helper to add CORS headers"""
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    return response

@chat_bp.post("")
def gemini_chat():
    user_msg = request.get_json(force=True, silent=True).get("message", "").strip()
    if not user_msg:
        response = jsonify(reply="I didn't catch that.")
        return add_cors_headers(response), 400

    # Try Groq first (better free tier), then fallback to Gemini
    if GROQ_API_KEY:
        try:
            return try_groq(user_msg)
        except Exception as e:
            # If Groq fails, try Gemini as fallback
            if GEMINI_API_KEY:
                try:
                    return try_gemini(user_msg)
                except:
                    pass
            # Return Groq error if no fallback
            response = jsonify(reply=f"⚠️ Groq API error: {str(e)}")
            return add_cors_headers(response), 500
    elif GEMINI_API_KEY:
        try:
            return try_gemini(user_msg)
        except Exception as e:
            response = jsonify(reply=f"⚠️ Gemini API error: {str(e)}")
            return add_cors_headers(response), 500
    else:
        response = jsonify(reply="⚠️ No API key configured. Please set GROQ_API_KEY or GEMINI_API_KEY environment variable.")
        return add_cors_headers(response), 500

def try_groq(user_msg):
    """Try Groq API (OpenAI-compatible format)"""
    body = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user_msg}
        ],
        "temperature": 0.7,
        "max_tokens": 600
    }
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    r = requests.post(GROQ_URL, json=body, headers=headers, timeout=60)
    r.raise_for_status()
    response_data = r.json()
    
    if "choices" in response_data and len(response_data["choices"]) > 0:
        reply = response_data["choices"][0]["message"]["content"].strip()
        response = jsonify(reply=reply)
        return add_cors_headers(response)
    else:
        raise Exception("No response from Groq API")

def try_gemini(user_msg):
    """Try Gemini API (fallback)"""
    full_prompt = f"{SYSTEM}\n\nUser: {user_msg}\nAssistant:"
    
    body = {
        "contents": [{
            "parts": [{
                "text": full_prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 600
        }
    }
    
    url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    r = requests.post(url, json=body, headers=headers, timeout=60)
    r.raise_for_status()
    response_data = r.json()
    
    if "candidates" in response_data and len(response_data["candidates"]) > 0:
        reply = response_data["candidates"][0]["content"]["parts"][0]["text"].strip()
        response = jsonify(reply=reply)
        return add_cors_headers(response)
    else:
        raise Exception("No response from Gemini API")
