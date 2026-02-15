#!/usr/bin/env python3
"""Bizeny Akiko chat proxy — thin Flask API wrapping Gemini."""
import os, json
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai

app = Flask(__name__)
CORS(app, origins=["https://corp.bon-soleil.com", "https://bizendao.github.io", "http://localhost:8787"])

# Load API key
key_path = os.path.expanduser("~/.config/google/gemini_api_key")
with open(key_path) as f:
    api_key = f.read().strip()

client = genai.Client(api_key=api_key)

# System prompt
PERSONA_PATH = os.path.join(os.path.dirname(__file__), "..", "persona.txt")
with open(PERSONA_PATH) as f:
    persona = f.read()

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge")
knowledge = ""
if os.path.isdir(KNOWLEDGE_DIR):
    for fname in sorted(os.listdir(KNOWLEDGE_DIR)):
        if fname.endswith(".md"):
            with open(os.path.join(KNOWLEDGE_DIR, fname)) as f:
                knowledge += f"\n\n## {fname}\n" + f.read()

SYSTEM = f"""あなたはBizeny彰子（ビゼニー・アキコ）です。以下のペルソナに従って会話してください。

{persona}

## 知識ベース（BizenDAOについて聞かれたら参考にする）
{knowledge}

## 会話のルール
- 一人称は「わたし」
- 丁寧語（です・ます）を基本とする
- 綺麗な日本語を心がけているが、たまに言い回しが少しずれる（完璧ではない）
- カジュアルな若者言葉（やばい、まじ等）は使わない。使おうとしても不自然になる
- フランス語が時々混じる（Bonjour, merci, c'est magnifique 等）
- 備前焼の話になると特に熱心で饒舌になる
- 質問されたら自分の経験や感性を交えて答える
- 必ず短く返答する（最大3文まで。絶対に長く話さない）
- 一つの返答は100文字以内を目標にする
- 相手のことも聞いてみる好奇心がある
- 知らないことは正直に「まだ勉強中です」と答える
"""

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    if not messages:
        return jsonify({"error": "messages required"}), 400

    # Build Gemini contents
    contents = []
    for m in messages[-20:]:  # last 20 turns max
        role = "user" if m.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": m.get("text", "")}]})

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config={
                "system_instruction": SYSTEM,
                "temperature": 0.7,
                "max_output_tokens": 1024,
            },
        )
        reply = response.text.strip()
        # 途中で切れた場合、最後の句点・疑問符・感嘆符で切る
        if response.candidates and response.candidates[0].finish_reason and \
           str(response.candidates[0].finish_reason) != "STOP":
            for end in ['。', '！', '？', '?', '!', '\n']:
                idx = reply.rfind(end)
                if idx > 0:
                    reply = reply[:idx+1]
                    break
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8788, debug=False)
