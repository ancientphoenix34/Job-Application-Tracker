import json
from openai import AsyncOpenAI
from ..config.settings import settings
from ..utils.helpers import load_prompt

client = AsyncOpenAI(api_key=settings.openai_api_key)
_SYSTEM_PROMPT = load_prompt("job_parser_prompt.txt")


async def call_openai_text(content: str) -> dict:
    response = await client.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": f"Parse this job posting:\n\n{content}"},
        ],
    )
    return json.loads(response.choices[0].message.content)


async def call_openai_vision(base64_image: str, mime_type: str) -> dict:
    response = await client.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Parse this job posting screenshot:"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{base64_image}"},
                    },
                ],
            },
        ],
    )
    return json.loads(response.choices[0].message.content)
