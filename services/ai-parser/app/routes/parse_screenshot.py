from fastapi import APIRouter, File, HTTPException, UploadFile
from ..schemas.response_schema import ParseResponse
from ..services.screenshot_parser_service import parse_screenshot
from ..utils.validators import validate_image_type

router = APIRouter()


@router.post("/parse-screenshot", response_model=ParseResponse)
async def parse_screenshot_route(file: UploadFile = File(...)):
    if not validate_image_type(file.content_type):
        raise HTTPException(
            status_code=422,
            detail="Unsupported file type. Use JPEG, PNG, WebP, or GIF.",
        )
    try:
        data = await parse_screenshot(await file.read(), file.content_type)
        return ParseResponse(success=True, data=data)
    except ValueError as e:
        return ParseResponse(success=False, message=str(e))
    except Exception as e:
        return ParseResponse(success=False, message=f"Failed to parse screenshot: {str(e)}")
