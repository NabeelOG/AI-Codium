"""
Train an error-category classifier on the synthetic training dataset.
Uses a feature union of word + char n-grams with calibrated linear SVM.
Saves the trained model and vectorizer for serving.
"""

import os

import joblib
import pandas as pd
from scipy.sparse import hstack
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "training_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")
VEC_PATH = os.path.join(BASE_DIR, "vectorizer.joblib")


class FeatureUnionVectorizer:
    """Wraps word + char TfidfVectorizers into one transformer."""

    def __init__(self):
        self.word_vec = TfidfVectorizer(
            max_features=2000,
            ngram_range=(1, 3),
            analyzer="word",
            lowercase=True,
            sublinear_tf=True,
        )
        self.char_vec = TfidfVectorizer(
            max_features=5000,
            ngram_range=(2, 5),
            analyzer="char_wb",
            lowercase=True,
            sublinear_tf=True,
        )

    def fit(self, texts, y=None):
        self.word_vec.fit(texts)
        self.char_vec.fit(texts)
        return self

    def transform(self, texts):
        w = self.word_vec.transform(texts)
        c = self.char_vec.transform(texts)
        return hstack([w, c])

    def fit_transform(self, texts, y=None):
        return self.fit(texts, y).transform(texts)


def main():
    if not os.path.exists(DATA_PATH):
        print(f"Training data not found at {DATA_PATH}")
        print("Run: python seed_data.py")
        return

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} examples")
    print(f"Label distribution:\n{df['label'].value_counts()}\n")

    # Combine code + stderr + language
    df["text"] = (
        df["code"].fillna("")
        + "\n"
        + df["stderr"].fillna("")
        + "\nlang:"
        + df["language"].fillna("")
    )

    X = df["text"]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    vectorizer = FeatureUnionVectorizer()
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Calibrated linear SVM: fast, small, generalizes well
    clf = SGDClassifier(
        loss="log_loss",
        penalty="elasticnet",
        alpha=0.001,
        l1_ratio=0.3,
        max_iter=3000,
        tol=1e-4,
        random_state=42,
        class_weight="balanced",
    )
    clf.fit(X_train_vec, y_train)

    y_pred = clf.predict(X_test_vec)
    print("=" * 60)
    print("Classification Report (Test Set)")
    print("=" * 60)
    print(classification_report(y_test, y_pred))

    joblib.dump(clf, MODEL_PATH)
    joblib.dump(vectorizer, VEC_PATH)
    print(f"Model saved -> {MODEL_PATH}")
    print(f"Vectorizer saved -> {VEC_PATH}")


if __name__ == "__main__":
    main()
