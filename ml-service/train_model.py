"""
Train an error-category classifier on the synthetic training dataset.

Features come from CodeBERT embeddings (see embed.py): each snippet is
turned into a 768-dim semantic vector, then a logistic-regression head is
trained on top. The CodeBERT model itself is not modified (frozen feature
extractor), so training is fast and runs on CPU.

Saves only the small classifier (model.joblib). CodeBERT is reloaded from
the local HuggingFace cache at serving time.
"""

import os

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

from embed import embed

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "training_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")


def build_text(code, stderr, language):
    """Combine the fields into one string. MUST match app.py exactly."""
    return (
        str(code or "")
        + "\n"
        + str(stderr or "")
        + "\nlang:"
        + str(language or "")
    )


def main():
    if not os.path.exists(DATA_PATH):
        print(f"Training data not found at {DATA_PATH}")
        print("Run: python seed_data.py")
        return

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} examples")
    print(f"Label distribution:\n{df['label'].value_counts()}\n")

    df["text"] = df.apply(
        lambda r: build_text(r["code"], r["stderr"], r["language"]), axis=1
    )

    print("Embedding training data with CodeBERT (this can take a minute)...")
    X = embed(df["text"].tolist())
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    # Logistic regression on top of the frozen CodeBERT embeddings.
    # Gives well-calibrated predict_proba (used as confidence) and is
    # trivial to explain.
    clf = LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        C=1.0,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print("=" * 60)
    print("Classification Report (Test Set)")
    print("=" * 60)
    print(classification_report(y_test, y_pred))

    joblib.dump(clf, MODEL_PATH)
    print(f"Model saved -> {MODEL_PATH}")


if __name__ == "__main__":
    main()
