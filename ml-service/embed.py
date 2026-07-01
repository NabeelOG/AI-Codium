"""
CodeBERT embedding helper.

Loads microsoft/codebert-base once and converts code/text into a
768-dimensional semantic vector by mean-pooling the final hidden layer.

CodeBERT is a transformer pre-trained on millions of code + comment pairs
from GitHub. We use it as a *frozen feature extractor*: the model weights
are never changed, we only read out the embeddings and train a small
classifier on top (see train_model.py). This keeps things fast, runs on
CPU, and needs no GPU or fine-tuning.

Both training and serving import embed() from here so the feature
representation is guaranteed to be identical in both places.
"""

import numpy as np
import torch
from transformers import AutoModel, AutoTokenizer

MODEL_NAME = "microsoft/codebert-base"
MAX_LENGTH = 512
BATCH_SIZE = 16

_tokenizer = None
_model = None


def _load():
    global _tokenizer, _model
    if _model is None:
        print(f"Loading {MODEL_NAME} (first run downloads ~500MB)...")
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModel.from_pretrained(MODEL_NAME)
        _model.eval()
        print("CodeBERT loaded.")
    return _tokenizer, _model


def embed(texts):
    """Embed a string or list of strings into 768-dim vectors.

    Returns a 1-D array (768,) for a single string, or a 2-D array
    (N x 768) for a list of strings.
    """
    tokenizer, model = _load()

    single = isinstance(texts, str)
    if single:
        texts = [texts]

    vectors = []
    with torch.no_grad():
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i : i + BATCH_SIZE]
            inputs = tokenizer(
                batch,
                return_tensors="pt",
                truncation=True,
                max_length=MAX_LENGTH,
                padding=True,
            )
            out = model(**inputs)
            # Mean-pool the last hidden state over real (non-padding) tokens.
            mask = inputs["attention_mask"].unsqueeze(-1).float()
            summed = (out.last_hidden_state * mask).sum(dim=1)
            counts = mask.sum(dim=1).clamp(min=1e-9)
            pooled = (summed / counts).cpu().numpy()
            vectors.append(pooled)

    result = np.vstack(vectors)
    return result[0] if single else result
