from fastapi import APIRouter, HTTPException
from ..schemas.request_schema import ParseUrlRequest
from ..schemas.response_schema import ParseResponse
from ..services.extraction_service import parse_url
from ..utils.validators import validate_url

router = APIRouter()


@router.post("/parse-job-url", response_model=ParseResponse)
async def parse_job_url(request: ParseUrlRequest):
    if not validate_url(request.url):
        raise HTTPException(status_code=422, detail="Invalid URL format")
    try:
        data = await parse_url(request.url)
        return ParseResponse(success=True, data=data)
    except ValueError as e:
        return ParseResponse(success=False, message=str(e))
    except Exception as e:
        return ParseResponse(success=False, message=f"Failed to fetch/parse URL: {str(e)}")
