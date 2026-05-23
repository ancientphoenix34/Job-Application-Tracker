from ..schemas.job_schema import ParsedJobData
from .openai_service import call_openai_vision
from ..utils.helpers import encode_base64
from ..utils.validators import ALLOWED_IMAGE_TYPES


async def parse_screenshot(image_bytes: bytes, content_type: str) -> ParsedJobData:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(f"Unsupported image type: {content_type}")
    b64 = encode_base64(image_bytes)
    raw = await call_openai_vision(b64, content_type)
    return ParsedJobData(**raw)
