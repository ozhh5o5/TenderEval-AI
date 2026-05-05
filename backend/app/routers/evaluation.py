"""Evaluation endpoints — run AI evaluation and get results."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Tender, Bidder, EvaluationResult, EvalVerdict
from app.services.evaluator import evaluate_bidder

router = APIRouter()


@router.post("/{tender_id}/evaluate/{bidder_id}")
async def run_evaluation(tender_id: str, bidder_id: str, db: Session = Depends(get_db)):
    """Evaluate a single bidder against all tender criteria."""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    bidder = db.query(Bidder).filter(Bidder.id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    results = evaluate_bidder(tender, bidder, db)

    # Compute overall verdict
    verdicts = [r["verdict"] for r in results]
    if any(v == EvalVerdict.NOT_ELIGIBLE for v in verdicts):
        bidder.overall_verdict = EvalVerdict.NOT_ELIGIBLE
    elif any(v == EvalVerdict.NEEDS_REVIEW for v in verdicts):
        bidder.overall_verdict = EvalVerdict.NEEDS_REVIEW
    else:
        bidder.overall_verdict = EvalVerdict.ELIGIBLE

    db.commit()

    return {
        "bidder_id": bidder.id,
        "bidder_name": bidder.name,
        "overall_verdict": bidder.overall_verdict,
        "criteria_results": results,
    }


@router.get("/{tender_id}/results")
def get_evaluation_results(tender_id: str, db: Session = Depends(get_db)):
    """Get evaluation results for all bidders of a tender."""
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    return {
        "tender_id": tender.id,
        "tender_title": tender.title,
        "bidders": [
            {
                "id": b.id,
                "name": b.name,
                "overall_verdict": b.overall_verdict,
                "results": [
                    {
                        "criterion": r.criterion.name,
                        "verdict": r.verdict,
                        "extracted_value": r.extracted_value,
                        "reasoning": r.reasoning,
                        "confidence": r.confidence,
                    }
                    for r in b.results
                ],
            }
            for b in tender.bidders
        ],
    }
