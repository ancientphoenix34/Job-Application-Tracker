# AI Job Parser Service

Stateless FastAPI service that parses job postings from text, URLs, and screenshots using OpenAI gpt-4o.

## Setup

```bash
cd services/ai-parser

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Copy .env and add your OpenAI key
# Edit OPENAI_API_KEY in .env
```

## Run (local dev)

```bash
uvicorn app.main:app --reload --port 8000
```

Service will be available at `http://localhost:8000`.
Interactive API docs at `http://localhost:8000/docs`.

## Endpoints

| Method | Path | Input |
|--------|------|-------|
| GET | `/health` | — |
| POST | `/parse-job-text` | `{ "text": "..." }` |
| POST | `/parse-job-url` | `{ "url": "https://..." }` |
| POST | `/parse-screenshot` | `multipart/form-data` with `file` field |

## Response format

```json
{
  "success": true,
  "data": {
    "company": "",
    "position": "",
    "location": "",
    "salary": "",
    "experience": "",
    "job_type": "",
    "skills": [],
    "tags": [],
    "description": ""
  },
  "message": ""
}
```

## URL Support

| Platform | Support |
|----------|---------|
| Greenhouse | Full |
| Lever | Full |
| Wellfound | Full |
| RemoteOK | Full |
| Generic career pages | Full |
| LinkedIn | Not supported (requires login — use text or screenshot) |

## Docker

```bash
docker build -t ai-parser .
docker run -p 8000:8000 --env-file .env ai-parser
```

## Future Extensions

The stateless architecture supports easy addition of:
- Resume parsing (`/parse-resume`)
- ATS scoring (`/score-match`)
- Cover letter generation (`/generate-cover-letter`)
- Embeddings for RAG pipelines
- Batch parsing via queue workers
