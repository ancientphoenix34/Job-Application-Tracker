from typing import Optional
from pydantic import BaseModel
from .job_schema import ParsedJobData


class ParseResponse(BaseModel):
    success: bool
    data: Optional[ParsedJobData] = None
    message: str = ""
