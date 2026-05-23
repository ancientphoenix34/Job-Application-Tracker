from fastapi import APIRouter, Form, HTTPException, UploadFile, File
from ..schemas.ats_schema import ATSResponse
from ..services.resume_parser_service import parse_resume
from ..services.ats_service import score_resume_against_job
from ..services.url_parser_service import fetch_and_extract
from ..utils.cleaners import clean_text

router = APIRouter()

ALLOWED_TYPES = {"application/pdf", "text/plain"}


@router.post("/score-resume", response_model=ATSResponse)
async def score_resume(
    resume: UploadFile = File(...),
    job_source: str = Form(...),
    job_content: str = Form(...),
):
    try:
        if resume.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Resume must be a PDF or plain-text file.",
            )

        resume_bytes = await resume.read()
        resume_text = parse_resume(resume_bytes, resume.content_type)

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from resume.")

        if job_source == "url":
            job_text = await fetch_and_extract(job_content.strip())
        else:
            job_text = clean_text(job_content)

        if not job_text.strip():
            raise HTTPException(status_code=400, detail="Job description is empty.")

        result = await score_resume_against_job(resume_text, job_text)
        return ATSResponse(success=True, data=result)

    except HTTPException:
        raise
    except Exception as exc:
        return ATSResponse(success=False, message=str(exc))
