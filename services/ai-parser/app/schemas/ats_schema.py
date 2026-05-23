from pydantic import BaseModel, Field
from typing import Optional


class SkillMatch(BaseModel):
    matched: list[str] = Field(default_factory=list)
    missing: list[str] = Field(default_factory=list)
    bonus: list[str] = Field(default_factory=list)


class SectionFeedback(BaseModel):
    section: str
    score: int = 0
    feedback: str = ""
    suggestions: list[str] = Field(default_factory=list)


class ATSResult(BaseModel):
    ats_score: int = 0
    score_rationale: str = ""
    gaps: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    skill_match: SkillMatch = Field(default_factory=SkillMatch)
    section_analysis: list[SectionFeedback] = Field(default_factory=list)
    recruiter_summary: str = ""


class ATSResponse(BaseModel):
    success: bool
    data: Optional[ATSResult] = None
    message: str = ""
