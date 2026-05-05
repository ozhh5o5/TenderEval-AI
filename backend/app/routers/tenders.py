"""Tender upload and criteria extraction endpoints."""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
import os

from app.database import get_db
from app.models import Tender, Criterion
from app.services.document_parser import parse_tender_document
from app.services.criteria_extractor import extract_criteria

router = APIRouter()

UPLOAD_DIR = "uploads/tenders"


@router.post("/upload")
async def upload_tender(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a tender document (PDF/DOCX) and extract eligibility criteria."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    tender = Tender(
        title=file.filename.rsplit(".", 1)[0],
        original_filename=file.filename,
        status="parsing",
    )
    db.add(tender)
    db.commit()
    db.refresh(tender)

    try:
        parsed = parse_tender_document(file_path)
        criteria = extract_criteria(parsed, tender.id)

        for c in criteria:
            db.add(Criterion(tender_id=tender.id, **c))

        tender.status = "parsed"
        db.commit()
    except Exception as e:
        tender.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")

    db.refresh(tender)
    return {
        "tender_id": tender.id,
        "title": tender.title,
        "status": tender.status,
        "criteria_count": len(criteria) if tender.status == "parsed" else 0,
    }


@router.get("/{tender_id}")
def get_tender(tender_id: str, db: Session = Depends(get_db)):
    """Get tender details with extracted criteria."""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    return {
        "id": tender.id,
        "title": tender.title,
        "organization": tender.organization,
        "status": tender.status,
        "criteria": [
            {
                "id": c.id,
                "category": c.category,
                "name": c.name,
                "description": c.description,
                "threshold": c.threshold,
                "data_type": c.data_type,
                "page_reference": c.page_reference,
            }
            for c in tender.criteria
        ],
    }


@router.get("/")
def list_tenders(db: Session = Depends(get_db)):
    """List all uploaded tenders."""
    tenders = db.query(Tender).order_by(Tender.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "criteria_count": len(t.criteria),
            "created_at": t.created_at.isoformat(),
        }
        for t in tenders
    ]
