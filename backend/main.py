"""Theme 3: AI-Based Tender Evaluation Platform — API Server"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.routers import tenders, bidders, evaluation


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="AI Tender Evaluation Platform",
    description="Automated tender criteria extraction and bidder evaluation for government procurement",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tenders.router, prefix="/api/tenders", tags=["tenders"])
app.include_router(bidders.router, prefix="/api/bidders", tags=["bidders"])
app.include_router(evaluation.router, prefix="/api/evaluation", tags=["evaluation"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "tender-eval-ai"}
