# ML Service — Code Error Classifier

Classifies student code submissions into error categories using a
scikit-learn RandomForest with TF-IDF character n-gram features.

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Generate training data (synthetic, ~250 examples)
python seed_data.py

# 3. Train the model
python train_model.py

# 4. Start the service
python app.py
```

Service runs on `http://localhost:8081`.

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
