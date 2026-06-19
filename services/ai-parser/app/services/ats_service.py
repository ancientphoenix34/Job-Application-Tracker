import json
import numpy as np
from openai import AsyncOpenAI
from ..config.settings import settings
from ..schemas.ats_schema import ATSResult
from ..utils.helpers import load_prompt
from .resume_parser_service import chunk_resume


async def score_resume_against_job(resume_text: str, job_text: str) -> ATSResult:
    chunks = chunk_resume(resume_text)

    oai = AsyncOpenAI(api_key=settings.openai_api_key)

    embed_resp = await oai.embeddings.create(
        model="text-embedding-3-small",
        input=[c["text"] for c in chunks],
    )
    embeddings = [e.embedding for e in embed_resp.data]

    jd_embed = await oai.embeddings.create(
        model="text-embedding-3-small",
        input=[job_text[:6000]],
    )

    emb_array = np.array(embeddings)
    jd_vec = np.array(jd_embed.data[0].embedding)
    sims = emb_array @ jd_vec / (np.linalg.norm(emb_array, axis=1) * np.linalg.norm(jd_vec))
    top_idx = np.argsort(sims)[::-1][:min(5, len(chunks))]
    context = "\n\n---\n\n".join(chunks[i]["text"] for i in top_idx)

    system_prompt = load_prompt("ats_scorer_prompt.txt")
    user_msg = (
        f"RESUME (relevant sections):\n{context}"
        f"\n\nJOB DESCRIPTION:\n{job_text[:6000]}"
    )

    response = await oai.chat.completions.create(
        model=settings.openai_model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_msg},
        ],
    )
    raw = json.loads(response.choices[0].message.content)
    return ATSResult(**raw)
