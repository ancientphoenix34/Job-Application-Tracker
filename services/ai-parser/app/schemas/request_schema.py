from pydantic import BaseModel


class ParseTextRequest(BaseModel):
    text: str


class ParseUrlRequest(BaseModel):
    url: str
