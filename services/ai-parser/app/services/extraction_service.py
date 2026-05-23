from .url_parser_service import fetch_and_extract
from .text_parser_service import parse_text
from ..schemas.job_schema import ParsedJobData


async def parse_url(url: str) -> ParsedJobData:
    text = await fetch_and_extract(url)
    return await parse_text(text)
