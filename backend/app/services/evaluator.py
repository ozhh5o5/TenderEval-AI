"""Bidder evaluation service — matches bidder documents against tender criteria using Claude."""

import json
import logging
import os
from anthropic import Anthropic
from sqlalchemy.orm import Session

from app.models import Tender, Bidder, Criterion, EvaluationResult, EvalVerdict

logger = logging.getLogger(__name__)

MAX_RETRIES = 2

# Default result when evaluation fails after retries
FALLBACK_RESULT = {
    "verdict": "needs_review",
    "extracted_value": "",
    "reasoning": "Automated evaluation could not be completed — flagged for manual review.",
    "confidence": 0.0,
    "source_document": "",
}


def _extract_json_obj(text: str) -> dict:
    """Extract JSON object from Claude's response, handling markdown code blocks."""
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    return json.loads(text.strip())


def evaluate_bidder(tender: Tender, bidder: Bidder, db: Session) -> list[dict]:
    """Evaluate a bidder against all tender criteria. Returns per-criterion results."""
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    # Gather all bidder document text
    bidder_docs_text = ""
    for doc in bidder.documents:
        bidder_docs_text += f"\n--- Document: {doc.filename} (OCR: {doc.ocr_used}, Confidence: {doc.confidence}) ---\n"
        bidder_docs_text += doc.extracted_text or "[No text extracted]"
        bidder_docs_text += "\n"

    results = []

    for criterion in tender.criteria:
        result = _evaluate_single_criterion(client, criterion, bidder_docs_text, bidder.name)

        eval_result = EvaluationResult(
            bidder_id=bidder.id,
            criterion_id=criterion.id,
            verdict=EvalVerdict(result["verdict"]),
            extracted_value=result.get("extracted_value", ""),
            reasoning=result["reasoning"],
            confidence=result.get("confidence", 0.0),
            source_document=result.get("source_document", ""),
        )
        db.add(eval_result)
        results.append(result)

    db.commit()
    return results


def _evaluate_single_criterion(client: Anthropic, criterion: Criterion, bidder_docs: str, bidder_name: str) -> dict:
    """Evaluate a single criterion against bidder documents."""
    prompt = f"""You are evaluating a government tender bid. Determine if bidder "{bidder_name}" meets the following criterion.

CRITERION:
- Name: {criterion.name}
- Category: {criterion.category}
- Description: {criterion.description}
- Requirement: {criterion.threshold}
- Data type: {criterion.data_type}

BIDDER'S SUBMITTED DOCUMENTS:
{bidder_docs[:15000]}

Respond with ONLY a JSON object (no markdown, no explanation outside the JSON):
{{
    "verdict": "eligible" | "not_eligible" | "needs_review",
    "extracted_value": "what you found in the documents relevant to this criterion",
    "reasoning": "step-by-step explanation of your evaluation (2-3 sentences)",
    "confidence": 0.0-1.0,
    "source_document": "which document contained the relevant info"
}}

RULES:
- If the documents clearly satisfy the criterion → "eligible"
- If the documents clearly fail the criterion → "not_eligible"
- If information is ambiguous, partially present, or you're not confident → "needs_review"
- NEVER silently disqualify — when in doubt, use "needs_review"
- Be specific in reasoning — cite what you found or didn't find"""

    for attempt in range(MAX_RETRIES + 1):
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )

        response_text = response.content[0].text

        try:
            result = _extract_json_obj(response_text)
            # Validate required fields
            if "verdict" in result and "reasoning" in result:
                return result
            raise ValueError("Missing required fields: verdict, reasoning")
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(
                f"Evaluation JSON parse failed for criterion '{criterion.name}' "
                f"(attempt {attempt + 1}): {e}"
            )
            if attempt < MAX_RETRIES:
                prompt = f"Your previous response was not valid JSON. Return ONLY a JSON object with verdict, extracted_value, reasoning, confidence, source_document.\n\nOriginal response:\n{response_text[:1000]}"
                continue

            # After all retries, return a safe fallback instead of crashing
            logger.error(f"All retries exhausted for criterion '{criterion.name}' — using fallback")
            return {**FALLBACK_RESULT, "reasoning": f"Automated evaluation failed after {MAX_RETRIES + 1} attempts — flagged for manual review."}
