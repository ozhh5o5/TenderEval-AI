"""Criteria extraction service — uses Claude to extract structured eligibility criteria from tender text."""

import json
import logging
import os
from anthropic import Anthropic

logger = logging.getLogger(__name__)

MAX_RETRIES = 2


def _extract_json(text: str) -> list[dict]:
    """Extract JSON array from Claude's response, handling markdown code blocks."""
    # Try extracting from code blocks first
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    return json.loads(text.strip())


def extract_criteria(parsed_document: dict, tender_id: str) -> list[dict]:
    """Extract eligibility criteria from parsed tender document using Claude."""
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    tender_text = parsed_document["text"]

    # Truncate to fit context window while keeping beginning (NIT/eligibility) and end (schedules)
    if len(tender_text) > 50000:
        tender_text = tender_text[:30000] + "\n\n[...middle section truncated...]\n\n" + tender_text[-20000:]

    prompt = f"""You are analyzing an Indian government tender document. Extract ALL eligibility and qualification criteria that bidders must meet.

For each criterion, provide:
- category: "eligibility" (must-have), "technical" (scored), or "financial" (monetary)
- name: short label (e.g., "EMD Submission", "Annual Turnover", "ISO Certification")
- description: what the criterion requires
- requirement_text: exact text from the document (verbatim quote)
- data_type: "boolean" (yes/no), "numeric" (amounts/quantities), "text" (certificates/names), or "document" (specific doc required)
- threshold: the specific threshold or requirement (e.g., "> 5 crore", "must have", "ISO 9001:2015")
- page_reference: approximate location if discernible

Return ONLY a JSON array with no other text. Be thorough — missing a criterion means a bidder could be wrongly qualified.

TENDER DOCUMENT:
{tender_text}"""

    for attempt in range(MAX_RETRIES + 1):
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )

        response_text = response.content[0].text

        try:
            criteria = _extract_json(response_text)
            if isinstance(criteria, list):
                return criteria
            raise ValueError("Response is not a JSON array")
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Criteria extraction JSON parse failed (attempt {attempt + 1}): {e}")
            if attempt < MAX_RETRIES:
                # Ask Claude to fix its own output
                prompt = f"Your previous response was not valid JSON. Please return ONLY a JSON array, no markdown, no explanation.\n\nOriginal response:\n{response_text[:2000]}"
                continue
            raise ValueError(f"Failed to parse criteria after {MAX_RETRIES + 1} attempts: {e}")
