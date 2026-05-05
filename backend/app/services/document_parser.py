"""Document parsing service — extracts text from PDFs, scanned docs, images.

Pipeline:
1. Try Docling first (best for typed PDFs with tables)
2. Fall back to PaddleOCR for scanned documents
3. Fall back to Surya for complex layouts
"""

import os


def parse_tender_document(file_path: str) -> dict:
    """Parse a tender document and return structured text with page info."""
    ext = os.path.splitext(file_path)[1].lower()

    if ext in (".pdf", ".docx"):
        return _parse_with_docling(file_path)
    elif ext in (".jpg", ".jpeg", ".png", ".tiff"):
        return _parse_with_ocr(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def parse_bidder_document(file_path: str) -> dict:
    """Parse a bidder's submitted document."""
    ext = os.path.splitext(file_path)[1].lower()

    if ext in (".pdf", ".docx"):
        result = _parse_with_docling(file_path)
        # If Docling returns very little text, likely a scanned doc
        if len(result.get("text", "")) < 100:
            return _parse_with_ocr(file_path)
        return {
            "text": result["text"],
            "ocr_method": "docling",
            "confidence": result.get("confidence", 0.9),
        }
    elif ext in (".jpg", ".jpeg", ".png", ".tiff"):
        return _parse_with_ocr(file_path)
    else:
        return {
            "text": "",
            "ocr_method": "none",
            "confidence": 0.0,
        }


def _parse_with_docling(file_path: str) -> dict:
    """Parse using IBM Docling — best for typed PDFs with tables."""
    try:
        from docling.document_converter import DocumentConverter

        converter = DocumentConverter()
        result = converter.convert(file_path)
        text = result.document.export_to_markdown()

        pages = []
        for page_no, page in enumerate(result.document.pages, 1):
            pages.append({"page": page_no, "text": str(page)})

        return {
            "text": text,
            "pages": pages,
            "method": "docling",
            "confidence": 0.95,
        }
    except Exception:
        # Docling failed, try OCR
        return _parse_with_ocr(file_path)


def _parse_with_ocr(file_path: str) -> dict:
    """Parse using PaddleOCR — best for scanned documents."""
    try:
        from paddleocr import PaddleOCR

        ocr = PaddleOCR(use_angle_cls=True, lang="en")
        result = ocr.ocr(file_path, cls=True)

        lines = []
        total_conf = 0
        count = 0
        for page in result:
            if page is None:
                continue
            for line in page:
                text = line[1][0]
                conf = line[1][1]
                lines.append(text)
                total_conf += conf
                count += 1

        avg_conf = total_conf / count if count > 0 else 0

        return {
            "text": "\n".join(lines),
            "ocr_method": "paddleocr",
            "confidence": round(avg_conf, 3),
        }
    except Exception:
        return {
            "text": "",
            "ocr_method": "failed",
            "confidence": 0.0,
        }
