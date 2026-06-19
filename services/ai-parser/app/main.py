import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .routes import health, parse_job_text, parse_job_url, parse_screenshot, score_resume

app = FastAPI(
    title="AI Job Parser and ATS Service",
    description="Parses job postings from text, URLs, and screenshots using OpenAI along with ATS guidance",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prefix = os.getenv("ROUTE_PREFIX", "")
app.include_router(health.router, prefix=prefix)
app.include_router(parse_job_text.router, prefix=prefix)
app.include_router(parse_job_url.router, prefix=prefix)
app.include_router(parse_screenshot.router, prefix=prefix)
app.include_router(score_resume.router, prefix=prefix)
