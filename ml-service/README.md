# ML Service — Code Error Classifier

Classifies student code submissions into error categories using
**CodeBERT** embeddings + a logistic-regression classifier.

CodeBERT (`microsoft/codebert-base`) is a transformer pre-trained on
millions of code + comment pairs from GitHub. We use it as a *frozen
feature extractor*: each snippet is turned into a 768-dimensional
semantic vector, and a small logistic-regression head is trained on
those vectors. CodeBERT itself is not fine-tuned, so training is fast
and runs on CPU.

## Quick Start

```bash
# 1. Install torch CPU-only (much smaller than CUDA build, ~180MB vs ~2.5GB)
pip install torch --index-url https://download.pytorch.org/whl/cpu

# 2. Install remaining dependencies (first run also downloads CodeBERT, ~500MB)
pip install -r requirements.txt

# 3. Generate training data (synthetic, ~205 balanced examples)
python seed_data.py

# 4. Train the classifier head
python train_model.py

# 5. Start the service
python app.py
```

First run downloads ~500MB (torch + transformers + CodeBERT model).

## How it works

```
code + stderr + language ──> CodeBERT ──> 768-dim vector ──> LogisticRegression ──> category + confidence
```

`embed.py` holds the CodeBERT embedding logic and is imported by both
`train_model.py` and `app.py`, so the feature representation is
identical in training and serving.

If the top prediction's confidence is below `0.5`, the service returns
`"Uncertain"` instead of a misleading label. This is intentional: the
semantic classes (Logical / Inefficient / Correct) genuinely overlap, so
honest abstention beats a confident wrong answer.

## Retraining

```bash
# Re-generate seed data and retrain
python seed_data.py
python train_model.py
```

Or replace `training_data.csv` with your own labeled dataset
(columns: code, stderr, language, label) and run `python train_model.py`.

## API

**POST /classify**

```json
{
  "code": "def foo()\n    print('hello'\n",
  "stderr": "SyntaxError: unexpected EOF",
  "language": "python"
}
```

Response:
```json
{
  "category": "Syntax Error",
  "confidence": 0.85
}
```

**GET /health**

```json
{ "status": "ok", "model_loaded": true }
```

## Categories

- Syntax Error
- Runtime Error
- Logical Error
- Inefficient Solution
- Correct
- Uncertain *(returned when confidence < 0.5)*
