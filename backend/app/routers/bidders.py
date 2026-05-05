"""Bidder document upload and management endpoints."""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os

from app.database import get_db
from app.models import Bidder, BidderDocument
from app.services.document_parser import parse_bidder_document

router = APIRouter()

UPLOAD_DIR = "uploads/bidders"


@router.post("/{tender_id}/add")
async def add_bidder(
    tender_id: str,
    name: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    """Add a bidder with their submitted documents."""
    bidder = Bidder(tender_id=tender_id, name=name)
    db.add(bidder)
    db.commit()
    db.refresh(bidder)

    bidder_dir = os.path.join(UPLOAD_DIR, bidder.id)
    os.makedirs(bidder_dir, exist_ok=True)

    docs = []
    for file in files:
        file_path = os.path.join(bidder_dir, file.filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        parsed = parse_bidder_document(file_path)

        doc = BidderDocument(
            bidder_id=bidder.id,
            filename=file.filename,
            extracted_text=parsed["text"],
            ocr_used=parsed["ocr_method"],
            confidence=parsed["confidence"],
        )
        db.add(doc)
        docs.append(doc)

    db.commit()

    return {
        "bidder_id": bidder.id,
        "name": bidder.name,
        "documents_uploaded": len(docs),
    }


@router.get("/{tender_id}")
def list_bidders(tender_id: str, db: Session = Depends(get_db)):
    """List all bidders for a tender."""
    bidders = db.query(Bidder).filter(Bidder.tender_id == tender_id).all()
    return [
        {
            "id": b.id,
            "name": b.name,
            "overall_verdict": b.overall_verdict,
            "documents_count": len(b.documents),
        }
        for b in bidders
    ]
