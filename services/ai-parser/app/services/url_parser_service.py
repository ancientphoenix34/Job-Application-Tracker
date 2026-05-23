import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from ..utils.cleaners import clean_html_text, truncate_text
from ..config.settings import settings

LINKEDIN_DOMAINS = {"linkedin.com", "www.linkedin.com"}

PLATFORM_SELECTORS: dict[str, list[str]] = {
    "greenhouse.io": ["#content", ".job-post-description"],
    "lever.co": [".content", ".section-wrapper"],
    "wellfound.com": ["[class*='jobDescription']", "main"],
    "remoteok.com": [".markdown", ".job"],
}

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


async def fetch_and_extract(url: str) -> str:
    domain = urlparse(url).netloc.replace("www.", "")

    if domain in LINKEDIN_DOMAINS:
        raise ValueError(
            "LinkedIn requires login. Paste the job description as text "
            "or upload a screenshot instead."
        )

    async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
        response = await client.get(url, headers=_HEADERS)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
        tag.decompose()

    for selector in PLATFORM_SELECTORS.get(domain, []):
        el = soup.select_one(selector)
        if el:
            return truncate_text(clean_html_text(el.get_text()), settings.max_text_chars)

    main = soup.find("main") or soup.find("article") or soup.body
    text = main.get_text() if main else soup.get_text()
    return truncate_text(clean_html_text(text), settings.max_text_chars)
