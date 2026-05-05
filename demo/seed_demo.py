"""Seed demo data for Theme 3: TenderEval AI.

Creates a realistic tender with criteria and 3 bidders:
- Bidder A: Clearly eligible (all docs present and valid)
- Bidder B: Clearly not eligible (missing turnover, expired cert)
- Bidder C: Ambiguous (scanned doc with low confidence, borderline turnover)

Usage:
    cd backend
    python -m demo.seed_demo
    OR
    python ../demo/seed_demo.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import init_db, SessionLocal
from app.models import Tender, Criterion, Bidder, BidderDocument, EvaluationResult, EvalVerdict
from datetime import datetime, timezone


def seed():
    init_db()
    db = SessionLocal()

    # Clear existing data
    db.query(EvaluationResult).delete()
    db.query(BidderDocument).delete()
    db.query(Bidder).delete()
    db.query(Criterion).delete()
    db.query(Tender).delete()
    db.commit()

    # ── Create Tender ─────────────────────────────────────────────────────
    tender = Tender(
        title="Construction of Border Outpost — CRPF Tender 2026-BOP-047",
        organization="Central Reserve Police Force (CRPF)",
        tender_number="CRPF/CE/2026/BOP-047",
        original_filename="CRPF_BOP_047_Tender_Document.pdf",
        status="parsed",
    )
    db.add(tender)
    db.flush()

    # ── Create Criteria ───────────────────────────────────────────────────
    criteria_data = [
        {
            "category": "eligibility",
            "name": "EMD Submission",
            "description": "Earnest Money Deposit of Rs. 10,00,000 (Ten Lakhs) must be submitted via bank guarantee or demand draft",
            "requirement_text": "EMD of Rs. 10,00,000/- in the form of BG/DD from any Scheduled Bank",
            "data_type": "document",
            "threshold": "Rs. 10,00,000 BG/DD",
            "page_reference": "3",
        },
        {
            "category": "financial",
            "name": "Annual Turnover",
            "description": "Minimum average annual turnover of Rs. 5 Crore in the last 3 financial years",
            "requirement_text": "Average annual turnover of the bidder during the last 3 years ending 31.03.2025 should not be less than Rs. 5,00,00,000/-",
            "data_type": "numeric",
            "threshold": ">= 5 Crore (avg of last 3 FY)",
            "page_reference": "12",
        },
        {
            "category": "eligibility",
            "name": "GST Registration",
            "description": "Valid GST registration certificate",
            "requirement_text": "The bidder must hold a valid GSTIN",
            "data_type": "document",
            "threshold": "Valid GSTIN",
            "page_reference": "8",
        },
        {
            "category": "eligibility",
            "name": "PAN Card",
            "description": "Valid PAN card of the bidding entity",
            "requirement_text": "Copy of PAN card of the firm/company",
            "data_type": "document",
            "threshold": "Valid PAN",
            "page_reference": "8",
        },
        {
            "category": "technical",
            "name": "Similar Work Experience",
            "description": "At least 3 similar construction projects completed in the last 5 years, each valued at Rs. 2 Crore or above",
            "requirement_text": "The bidder should have successfully completed at least 3 similar works each costing not less than Rs. 2,00,00,000/- during the last 5 years",
            "data_type": "numeric",
            "threshold": ">= 3 projects, each >= 2 Crore",
            "page_reference": "13",
        },
        {
            "category": "eligibility",
            "name": "ISO 9001 Certification",
            "description": "Valid ISO 9001:2015 Quality Management System certification",
            "requirement_text": "The bidder must possess valid ISO 9001:2015 certification",
            "data_type": "document",
            "threshold": "ISO 9001:2015 (valid/unexpired)",
            "page_reference": "9",
        },
        {
            "category": "eligibility",
            "name": "No Blacklisting Declaration",
            "description": "Self-declaration that the firm has not been blacklisted by any Central/State Government agency",
            "requirement_text": "An affidavit on stamp paper stating that the firm has not been blacklisted/debarred by any Govt. department",
            "data_type": "boolean",
            "threshold": "Not blacklisted",
            "page_reference": "10",
        },
        {
            "category": "financial",
            "name": "Solvency Certificate",
            "description": "Solvency certificate from a scheduled bank for at least Rs. 2 Crore",
            "requirement_text": "Solvency Certificate for Rs. 2,00,00,000/- or above from a Scheduled Bank",
            "data_type": "document",
            "threshold": ">= 2 Crore",
            "page_reference": "12",
        },
    ]

    criteria = []
    for cd in criteria_data:
        c = Criterion(tender_id=tender.id, **cd)
        db.add(c)
        criteria.append(c)
    db.flush()

    # ── Bidder A: Clearly Eligible ────────────────────────────────────────
    bidder_a = Bidder(tender_id=tender.id, name="Infra Build Solutions Pvt Ltd", overall_verdict=EvalVerdict.ELIGIBLE)
    db.add(bidder_a)
    db.flush()

    docs_a = [
        BidderDocument(bidder_id=bidder_a.id, filename="EMD_Bank_Guarantee.pdf", doc_type="emd", extracted_text="Bank Guarantee No. BG/2026/4567 for Rs. 10,00,000/- issued by State Bank of India, valid till 31.12.2026. In favour of CRPF.", ocr_used="docling", confidence=0.97),
        BidderDocument(bidder_id=bidder_a.id, filename="Audited_Financials_3Y.pdf", doc_type="balance_sheet", extracted_text="Audited Financial Statements: FY 2022-23: Rs. 8.2 Crore; FY 2023-24: Rs. 9.5 Crore; FY 2024-25: Rs. 11.3 Crore. Average: Rs. 9.67 Crore.", ocr_used="docling", confidence=0.95),
        BidderDocument(bidder_id=bidder_a.id, filename="GST_Certificate.pdf", doc_type="gst_cert", extracted_text="GSTIN: 29AABCI5678K1Z5, Status: Active, Legal Name: Infra Build Solutions Private Limited", ocr_used="docling", confidence=0.98),
        BidderDocument(bidder_id=bidder_a.id, filename="PAN_Card.pdf", doc_type="pan_card", extracted_text="PAN: AABCI5678K, Name: INFRA BUILD SOLUTIONS PRIVATE LIMITED", ocr_used="docling", confidence=0.99),
        BidderDocument(bidder_id=bidder_a.id, filename="Work_Experience_Certs.pdf", doc_type="experience_cert", extracted_text="1. Construction of Admin Block for BSF, Jodhpur - Rs. 3.2 Crore (2021). 2. Border Fencing Project, Amritsar - Rs. 4.1 Crore (2022). 3. Barracks Construction for ITBP, Leh - Rs. 2.8 Crore (2023). 4. Perimeter Wall for CISF, Chennai - Rs. 2.5 Crore (2024).", ocr_used="docling", confidence=0.93),
        BidderDocument(bidder_id=bidder_a.id, filename="ISO_9001_Certificate.pdf", doc_type="iso_cert", extracted_text="ISO 9001:2015 Certificate No. QMS-2024-7890. Issued to: Infra Build Solutions Pvt Ltd. Valid from: 01.04.2024 to 31.03.2027. Scope: Construction and Civil Engineering.", ocr_used="docling", confidence=0.96),
    ]
    for d in docs_a:
        db.add(d)

    # Results for Bidder A (all eligible)
    results_a = [
        ("eligible", "BG for Rs. 10,00,000 from SBI, valid till 31.12.2026", "EMD bank guarantee matches the required amount of Rs. 10 Lakhs. Issued by SBI (scheduled bank). Validity covers the tender period.", 0.98, "EMD_Bank_Guarantee.pdf"),
        ("eligible", "Avg turnover Rs. 9.67 Crore (FY23: 8.2Cr, FY24: 9.5Cr, FY25: 11.3Cr)", "Average annual turnover of Rs. 9.67 Crore exceeds the required Rs. 5 Crore threshold. Audited financials provided for all 3 years.", 0.97, "Audited_Financials_3Y.pdf"),
        ("eligible", "GSTIN 29AABCI5678K1Z5, Status: Active", "Valid active GSTIN found. Legal name matches the bidding entity.", 0.99, "GST_Certificate.pdf"),
        ("eligible", "PAN: AABCI5678K", "Valid PAN card found. Name matches the bidding entity.", 0.99, "PAN_Card.pdf"),
        ("eligible", "4 projects found: Rs. 3.2Cr, 4.1Cr, 2.8Cr, 2.5Cr (all >= 2Cr, within last 5 years)", "Bidder has 4 completed projects each exceeding Rs. 2 Crore in the last 5 years, surpassing the minimum requirement of 3.", 0.95, "Work_Experience_Certs.pdf"),
        ("eligible", "ISO 9001:2015, valid till 31.03.2027", "Valid ISO 9001:2015 certificate found. Issued for construction scope. Not expired.", 0.97, "ISO_9001_Certificate.pdf"),
        ("eligible", "Self-declaration attached", "No-blacklisting affidavit present in the submission documents.", 0.90, "Work_Experience_Certs.pdf"),
        ("eligible", "Solvency of Rs. 3.5 Crore from SBI", "Solvency certificate exceeds the required Rs. 2 Crore threshold.", 0.94, "Audited_Financials_3Y.pdf"),
    ]
    for i, (verdict, val, reason, conf, doc) in enumerate(results_a):
        db.add(EvaluationResult(bidder_id=bidder_a.id, criterion_id=criteria[i].id, verdict=EvalVerdict(verdict), extracted_value=val, reasoning=reason, confidence=conf, source_document=doc))

    # ── Bidder B: Clearly Not Eligible ────────────────────────────────────
    bidder_b = Bidder(tender_id=tender.id, name="QuickBuild Contractors", overall_verdict=EvalVerdict.NOT_ELIGIBLE)
    db.add(bidder_b)
    db.flush()

    docs_b = [
        BidderDocument(bidder_id=bidder_b.id, filename="EMD_DD.pdf", doc_type="emd", extracted_text="Demand Draft No. 445566 for Rs. 10,00,000/- drawn on Punjab National Bank", ocr_used="docling", confidence=0.94),
        BidderDocument(bidder_id=bidder_b.id, filename="Financial_Statements.pdf", doc_type="balance_sheet", extracted_text="FY 2022-23: Rs. 2.1 Crore; FY 2023-24: Rs. 3.0 Crore; FY 2024-25: Rs. 3.8 Crore.", ocr_used="docling", confidence=0.92),
        BidderDocument(bidder_id=bidder_b.id, filename="GST_Reg.pdf", doc_type="gst_cert", extracted_text="GSTIN: 29BBBQB1234M1Z8, Status: Active", ocr_used="docling", confidence=0.96),
        BidderDocument(bidder_id=bidder_b.id, filename="PAN.jpg", doc_type="pan_card", extracted_text="PAN: BBBQB1234M, QUICKBUILD CONTRACTORS", ocr_used="paddleocr", confidence=0.88),
        BidderDocument(bidder_id=bidder_b.id, filename="Experience_Letters.pdf", doc_type="experience_cert", extracted_text="1. Compound Wall for BSNL Office, Bengaluru - Rs. 45 Lakhs (2022). 2. Interior Renovation for State Bank, Mysuru - Rs. 1.2 Crore (2023).", ocr_used="docling", confidence=0.91),
        BidderDocument(bidder_id=bidder_b.id, filename="ISO_Certificate_Expired.pdf", doc_type="iso_cert", extracted_text="ISO 9001:2015 Certificate. Issued to: QuickBuild Contractors. Valid from: 01.01.2020 to 31.12.2022. EXPIRED.", ocr_used="docling", confidence=0.95),
    ]
    for d in docs_b:
        db.add(d)

    results_b = [
        ("eligible", "DD for Rs. 10,00,000 from PNB", "EMD demand draft matches required amount.", 0.95, "EMD_DD.pdf"),
        ("not_eligible", "Avg turnover Rs. 2.97 Crore (FY23: 2.1Cr, FY24: 3.0Cr, FY25: 3.8Cr)", "Average annual turnover of Rs. 2.97 Crore is below the required Rs. 5 Crore threshold. Shortfall of Rs. 2.03 Crore.", 0.96, "Financial_Statements.pdf"),
        ("eligible", "GSTIN 29BBBQB1234M1Z8, Active", "Valid active GSTIN found.", 0.97, "GST_Reg.pdf"),
        ("eligible", "PAN: BBBQB1234M", "PAN card found. OCR confidence slightly lower (scanned image) but readable.", 0.88, "PAN.jpg"),
        ("not_eligible", "Only 2 projects found, neither >= 2 Crore (Rs. 45L and Rs. 1.2Cr)", "Bidder has only 2 projects, and neither meets the Rs. 2 Crore minimum. Fails both the count (need 3) and value thresholds.", 0.94, "Experience_Letters.pdf"),
        ("not_eligible", "ISO 9001:2015, EXPIRED 31.12.2022", "ISO certificate found but expired over 3 years ago. Not valid.", 0.97, "ISO_Certificate_Expired.pdf"),
        ("needs_review", "No affidavit found", "No blacklisting declaration found in submitted documents. Cannot confirm or deny.", 0.30, ""),
        ("needs_review", "No solvency certificate found", "Solvency certificate not found in submission. Cannot evaluate.", 0.20, ""),
    ]
    for i, (verdict, val, reason, conf, doc) in enumerate(results_b):
        db.add(EvaluationResult(bidder_id=bidder_b.id, criterion_id=criteria[i].id, verdict=EvalVerdict(verdict), extracted_value=val, reasoning=reason, confidence=conf, source_document=doc))

    # ── Bidder C: Ambiguous / Needs Review ────────────────────────────────
    bidder_c = Bidder(tender_id=tender.id, name="Bharat Nirman Enterprises", overall_verdict=EvalVerdict.NEEDS_REVIEW)
    db.add(bidder_c)
    db.flush()

    docs_c = [
        BidderDocument(bidder_id=bidder_c.id, filename="EMD_BG_Scan.jpg", doc_type="emd", extracted_text="Ban... Guar...tee Rs. 10,0..000 State Ba.. of Ind.. valid till 2026", ocr_used="paddleocr", confidence=0.62),
        BidderDocument(bidder_id=bidder_c.id, filename="CA_Certificate_Turnover.pdf", doc_type="balance_sheet", extracted_text="Certified that M/s Bharat Nirman Enterprises has average annual turnover of Rs. 5.1 Crore for FY 2022-23, 2023-24, 2024-25.", ocr_used="docling", confidence=0.94),
        BidderDocument(bidder_id=bidder_c.id, filename="GST_Certificate.pdf", doc_type="gst_cert", extracted_text="GSTIN: 29AAFBH9012N1ZQ, Status: Active, Bharat Nirman Enterprises", ocr_used="docling", confidence=0.97),
        BidderDocument(bidder_id=bidder_c.id, filename="PAN_Photo.jpg", doc_type="pan_card", extracted_text="PAN: AAFBH9012N BHARAT NIRMAN ENTERPRISES", ocr_used="paddleocr", confidence=0.85),
        BidderDocument(bidder_id=bidder_c.id, filename="Work_Orders_Scanned.pdf", doc_type="experience_cert", extracted_text="1. Boundary wall construction for Army Cantt, Pune - Rs. 2.3 Crore (2021). 2. Quarters for CRPF, Hyderabad - Rs. 3.1 Crore (2022). 3. Guard room construction, BSF - value partially illegible, appears to be Rs. 1.8 or 2.8 Crore (2023).", ocr_used="paddleocr", confidence=0.72),
        BidderDocument(bidder_id=bidder_c.id, filename="ISO_Cert.pdf", doc_type="iso_cert", extracted_text="ISO 9001:2015 Certificate. Bharat Nirman Enterprises. Valid: 15.06.2023 to 14.06.2026.", ocr_used="docling", confidence=0.96),
    ]
    for d in docs_c:
        db.add(d)

    results_c = [
        ("needs_review", "Scanned BG, partially illegible, appears to be Rs. 10L from SBI", "EMD document is a scanned photograph with low OCR confidence (0.62). Amount appears to match but text is partially illegible. Needs manual verification of the original.", 0.55, "EMD_BG_Scan.jpg"),
        ("eligible", "CA-certified avg turnover Rs. 5.1 Crore", "CA certificate states average turnover of Rs. 5.1 Crore, which meets the Rs. 5 Crore threshold. However, margin is thin — borderline pass.", 0.88, "CA_Certificate_Turnover.pdf"),
        ("eligible", "GSTIN 29AAFBH9012N1ZQ, Active", "Valid active GSTIN.", 0.97, "GST_Certificate.pdf"),
        ("eligible", "PAN: AAFBH9012N", "PAN found via OCR on photograph. Readable.", 0.85, "PAN_Photo.jpg"),
        ("needs_review", "2 clear projects (Rs. 2.3Cr, 3.1Cr), 3rd project value illegible (1.8 or 2.8 Crore)", "Two projects clearly meet the Rs. 2 Crore threshold. Third project value is partially illegible — could be Rs. 1.8 Crore (fail) or Rs. 2.8 Crore (pass). If 2.8 Crore, bidder qualifies with exactly 3 projects. Manual review of original document needed.", 0.60, "Work_Orders_Scanned.pdf"),
        ("eligible", "ISO 9001:2015, valid till 14.06.2026", "Valid ISO certificate, not expired.", 0.96, "ISO_Cert.pdf"),
        ("eligible", "Affidavit on stamp paper attached", "Non-blacklisting declaration present.", 0.91, "Work_Orders_Scanned.pdf"),
        ("needs_review", "Solvency cert partially readable, appears Rs. 2.2 Crore", "Solvency certificate is present but scanned with moderate quality. Amount appears to be Rs. 2.2 Crore which would meet threshold, but needs verification.", 0.65, "CA_Certificate_Turnover.pdf"),
    ]
    for i, (verdict, val, reason, conf, doc) in enumerate(results_c):
        db.add(EvaluationResult(bidder_id=bidder_c.id, criterion_id=criteria[i].id, verdict=EvalVerdict(verdict), extracted_value=val, reasoning=reason, confidence=conf, source_document=doc))

    db.commit()
    db.close()

    print("Demo data seeded successfully!")
    print(f"  Tender: {tender.title}")
    print(f"  Criteria: {len(criteria)}")
    print(f"  Bidder A (Eligible): Infra Build Solutions Pvt Ltd")
    print(f"  Bidder B (Not Eligible): QuickBuild Contractors")
    print(f"  Bidder C (Needs Review): Bharat Nirman Enterprises")
    print(f"\nStart the backend and visit http://localhost:8000/docs")


if __name__ == "__main__":
    seed()
