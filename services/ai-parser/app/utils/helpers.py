import base64
from pathlib import Path


def encode_base64(data: bytes) -> str:
    return base64.b64encode(data).decode("utf-8")


def load_prompt(filename: str) -> str:
    path = Path(__file__).parent.parent / "prompts" / filename
    return path.read_text(encoding="utf-8")
