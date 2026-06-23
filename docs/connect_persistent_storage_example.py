"""
Posit Connect Python App — Persistent Storage Example
======================================================
Problem: Connect pods are ephemeral — /tmp clears on restart.
Solution: Write model params and user uploads to /mnt/usrfiles/ (Z drive).

Path equivalence:
  Z:\\bgcrh\\...          (Windows)
  /mnt/usrfiles/bgcrh/  (Posit Workbench / Connect)
  /usrfiles/bgcrh/      (Linux CLI)

On Connect, use /mnt/usrfiles/ prefix.
"""

import os
from pathlib import Path

# ── Base directory on shared drive ────────────────────────────────────────────
# Change this to your team's folder under /mnt/usrfiles/
APP_DATA_DIR = Path("/mnt/usrfiles/bgcrh/support/sp_app/your_app_name")  # replace your_app_name

# Sub-directories
MODEL_DIR  = APP_DATA_DIR / "models"
UPLOAD_DIR = APP_DATA_DIR / "uploads"

def init_storage():
    """Create directories if they don't exist. Call once at app startup."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ── Example 1: Save / load model parameters ───────────────────────────────────
import json

def save_model_params(params: dict, name: str = "model_params.json"):
    path = MODEL_DIR / name
    with open(path, "w") as f:
        json.dump(params, f, indent=2)
    print(f"Saved model params → {path}")

def load_model_params(name: str = "model_params.json") -> dict:
    path = MODEL_DIR / name
    if not path.exists():
        return {}
    with open(path) as f:
        return json.load(f)

# Pickle variant (for sklearn / pytorch state dicts etc.)
import pickle

def save_model_pickle(model, name: str = "model.pkl"):
    path = MODEL_DIR / name
    with open(path, "wb") as f:
        pickle.dump(model, f)

def load_model_pickle(name: str = "model.pkl"):
    path = MODEL_DIR / name
    with open(path, "rb") as f:
        return pickle.load(f)


# ── Example 2: Save user-uploaded PDF ─────────────────────────────────────────
import shutil

def save_upload(tmp_path: str, filename: str) -> Path:
    """
    Move/copy a user upload from the temp location to persistent storage.
    tmp_path: path returned by Shiny/Dash/Streamlit file upload widget
    filename: original filename from the upload
    Returns the persistent path.
    """
    dest = UPLOAD_DIR / filename
    shutil.copy2(tmp_path, dest)
    print(f"Saved upload → {dest}")
    return dest

def list_uploads() -> list[Path]:
    return sorted(UPLOAD_DIR.glob("*.pdf"))


# ── Startup ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_storage()

    # Demo: save and reload params
    params = {"learning_rate": 0.01, "n_estimators": 100, "version": "1.0"}
    save_model_params(params)
    loaded = load_model_params()
    print("Loaded params:", loaded)

    print("Model dir :", MODEL_DIR)
    print("Upload dir:", UPLOAD_DIR)
