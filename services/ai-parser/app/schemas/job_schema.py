from pydantic import BaseModel


class ParsedJobData(BaseModel):
    company: str = ""
    position: str = ""
    location: str = ""
    salary: str = ""
    experience: str = ""
    job_type: str = ""
    skills: list[str] = []
    tags: list[str] = []
    description: str = ""
