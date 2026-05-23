from urllib.parse import urlparse

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def validate_url(url: str) -> bool:
    try:
        result = urlparse(url)
        return result.scheme in ("http", "https") and bool(result.netloc)
    except Exception:
        return False


def validate_image_type(content_type: str) -> bool:
    return content_type in ALLOWED_IMAGE_TYPES
