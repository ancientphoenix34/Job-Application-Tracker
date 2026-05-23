from ..schemas.job_schema import ParsedJobData
from .openai_service import call_openai_text
from ..utils.cleaners import clean_text, truncate_text
from ..config.settings import settings


async def parse_text(text: str) -> ParsedJobData:
    cleaned = truncate_text(clean_text(text), settings.max_text_chars)
    raw = await call_openai_text(cleaned)
    return ParsedJobData(**raw)
