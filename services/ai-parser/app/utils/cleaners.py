import re


def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def clean_html_text(text: str) -> str:
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'  +', ' ', text)
    return text.strip()


def truncate_text(text: str, max_chars: int) -> str:
    return text[:max_chars] if len(text) > max_chars else text
