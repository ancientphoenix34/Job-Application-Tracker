import re
from io import BytesIO
import pdfplumber

SECTION_HEADERS = re.compile(
    r"^(summary|objective|profile|skills|technical skills|experience|work experience|"
    r"employment|projects|education|certifications|awards|publications|languages|"
    r"interests|volunteer|references)\b",
    re.IGNORECASE | re.MULTILINE,
)


def parse_resume(file_bytes: bytes, content_type: str) -> str:
    if content_type == "application/pdf":
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        return "\n".join(pages).strip()
    return file_bytes.decode("utf-8", errors="replace").strip()


def chunk_resume(text: str) -> list[dict]:
    lines = text.splitlines()
    chunks: list[dict] = []
    current_section = "General"
    current_lines: list[str] = []

    for line in lines:
        if SECTION_HEADERS.match(line.strip()):
            if current_lines:
                chunks.append({
                    "section": current_section,
                    "text": f"{current_section}:\n" + "\n".join(current_lines).strip(),
                })
            current_section = line.strip().title()
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines:
        chunks.append({
            "section": current_section,
            "text": f"{current_section}:\n" + "\n".join(current_lines).strip(),
        })

    if len(chunks) < 3:
        chunks = []
        for i in range(0, len(text), 500):
            window = text[i:i + 500].strip()
            if window:
                chunks.append({"section": f"Part {len(chunks) + 1}", "text": window})

    return chunks
