"""
Flask microservice for code error classification.
POST /classify — returns category + confidence.
"""

import os

import joblib
from flask import Flask, jsonify, request

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")
VEC_PATH = os.path.join(BASE_DIR, "vectorizer.joblib")

app = Flask(__name__)

# Load model at startup
if os.path.exists(MODEL_PATH) and os.path.exists(VEC_PATH):
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)
    print(f"Model loaded from {MODEL_PATH}")
else:
    model = None
    vectorizer = None
    print("WARNING: Model not found. Run: python train_model.py")


@app.route("/health")
def health():
    if model is not None:
        return jsonify({"status": "ok", "model_loaded": True})
    return jsonify({"status": "degraded", "model_loaded": False}), 503


@app.route("/classify", methods=["POST"])
def classify():
    if model is None or vectorizer is None:
        return jsonify({"error": "Model not loaded"}), 503

    data = request.get_json(silent=True) or {}
    code = data.get("code", "")
    stderr = data.get("stderr", "")
    language = data.get("language", "")

    if not code and not stderr:
        return jsonify({"error": "No code or stderr provided"}), 400

    # Combine text the same way training did
    text = (code + "\n" + stderr).strip()

    # Vectorize and predict
    vec = vectorizer.transform([text])
    pred = model.predict(vec)[0]
    proba = model.predict_proba(vec)[0]
    confidence = float(max(proba))

    return jsonify(
        {
            "category": pred,
            "confidence": round(confidence, 4),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081, debug=False)
