"""Centralized Anthropic client with robust JSON parsing and retry logic.

Used by all 3 themes to avoid duplicating error handling around Claude API calls.
"""

import json
import logging
import os
from typing import Any

from anthropic import Anthropic

logger = logging.getLogger(__name__)

_client: Anthropic | None = None


def get_client() -> Anthropic:
    """Get or create a singleton Anthropic client."""
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY environment variable is not set")
        _client = Anthropic(api_key=api_key)
    return _client


def extract_json(text: str) -> Any:
    """Extract JSON from Claude's response text, handling markdown code blocks.

    Tries in order:
    1. ```json ... ``` blocks
    2. ``` ... ``` blocks
    3. Raw text as JSON
    """
    # Try extracting from fenced code blocks
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]

    return json.loads(text.strip())


def call_claude_json(
    prompt: str,
    *,
    model: str = "claude-sonnet-4-20250514",
    max_tokens: int = 4096,
    max_retries: int = 2,
    system: str | None = None,
) -> Any:
    """Call Claude and parse the response as JSON with automatic retry on parse failure.

    Args:
        prompt: The user message to send.
        model: Claude model to use.
        max_tokens: Maximum response tokens.
        max_retries: Number of retries on JSON parse failure.
        system: Optional system prompt.

    Returns:
        Parsed JSON (dict or list).

    Raises:
        ValueError: If JSON parsing fails after all retries.
    """
    client = get_client()

    messages = [{"role": "user", "content": prompt}]
    kwargs = {"model": model, "max_tokens": max_tokens, "messages": messages}
    if system:
        kwargs["system"] = system

    for attempt in range(max_retries + 1):
        response = client.messages.create(**kwargs)
        response_text = response.content[0].text

        try:
            return extract_json(response_text)
        except (json.JSONDecodeError, ValueError, IndexError) as e:
            logger.warning(f"JSON parse failed (attempt {attempt + 1}/{max_retries + 1}): {e}")
            if attempt < max_retries:
                # Replace message with a retry prompt
                kwargs["messages"] = [
                    {"role": "user", "content": prompt},
                    {"role": "assistant", "content": response_text},
                    {
                        "role": "user",
                        "content": "Your response was not valid JSON. Please return ONLY valid JSON with no markdown formatting or explanation.",
                    },
                ]
                continue

            raise ValueError(
                f"Failed to parse JSON from Claude after {max_retries + 1} attempts. "
                f"Last error: {e}. Last response (truncated): {response_text[:500]}"
            )
