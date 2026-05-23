from fastapi import APIRouter, HTTPException
from ..schemas.request_schema import ParseTextRequest
from ..schemas.response_schema import ParseResponse
from ..services.text_parser_service import parse_text

router = APIRouter()


@router.post("/parse-job-text", response_model=ParseResponse)
async def parse_job_text(request: ParseTextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=422, detail="Text cannot be empty")
    try:
        data = await parse_text(request.text)
        return ParseResponse(success=True, data=data)
    except Exception as e:
        return ParseResponse(success=False, message=str(e))
