"""
Flask microservice for code error classification.
POST /classify — returns category + confidence.

Features are CodeBERT embeddings (see embed.py); a logistic-regression head
(model.joblib) maps them to an error category. When the model is not
confident enough, the category is reported as "Uncertain" instead of a
misleading label.
"""

import os

import joblib
from flask import Flask, jsonify, request

from embed import embed

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")

# Below this confidence we don't trust the prediction — report "Uncertain"
# rather than a misleading label. The semantic classes (Logical / Inefficient
# / Correct) genuinely overlap, so honest abstention is better than guessing.
CONFIDENCE_THRESHOLD = 0.5

app = Flask(__name__)

# Load classifier at startup. CodeBERT itself loads lazily on first embed().
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
else:
    model = None
    print("WARNING: Model not found. Run: python train_model.py")


def build_text(code, stderr, language):
    """Combine the fields into one string. MUST match train_model.py exactly."""
    return code + "\n" + stderr + "\nlang:" + language


@app.route("/health")
def health():
    if model is not None:
        return jsonify({"status": "ok", "model_loaded": True})
    return jsonify({"status": "degraded", "model_loaded": False}), 503


@app.route("/classify", methods=["POST"])
def classify():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 503

    data = request.get_json(silent=True) or {}
    code = data.get("code", "") or ""
    stderr = data.get("stderr", "") or ""
    language = data.get("language", "") or ""

    if not code and not stderr:
        return jsonify({"error": "No code or stderr provided"}), 400

    text = build_text(code, stderr, language)

    vec = embed(text).reshape(1, -1)
    proba = model.predict_proba(vec)[0]
    idx = int(proba.argmax())
    confidence = float(proba[idx])
    category = str(model.classes_[idx])

    if confidence < CONFIDENCE_THRESHOLD:
        category = "Uncertain"

    return jsonify(
        {
            "category": category,
            "confidence": round(confidence, 4),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081, debug=False)
