# AI-Based Tender Evaluation Platform

**Theme 3 Solution Document -- PanIIT "AI for Bharat" Hackathon**

**Team:** AI for Bharat | **Date:** 15 April 2026 | **Sponsor:** CRPF

---

## 1. Executive Summary

India's government procurement machinery processes over 50,000 tenders annually at the central level alone, representing expenditure exceeding Rs 40 lakh crore. Yet the evaluation of bids against tender criteria remains a manual, committee-driven process -- slow, inconsistent, and difficult to audit. A single tender evaluation can consume days of officer time as committees cross-check hundreds of pages of bidder submissions against dozens of eligibility, technical, and financial criteria.

We present **TenderEval AI** -- an AI-powered platform purpose-built for government procurement officers that automates tender bid evaluation while maintaining full human oversight. The platform implements a three-stage pipeline: (1) **Extract** structured eligibility criteria from tender documents, (2) **Parse** bidder submissions regardless of format -- typed PDFs, scanned documents, photographs, or Word files -- and (3) **Evaluate** each bidder against each criterion with a transparent, three-tier verdict system: *Eligible*, *Not Eligible*, or *Needs Review*.

The platform is designed around a single non-negotiable principle: **it never silently disqualifies a bidder**. When evidence is ambiguous or incomplete, the system flags the criterion for human review rather than making an irreversible decision. Every verdict is accompanied by extracted evidence, step-by-step reasoning, confidence scores, and source document references -- producing audit-ready evaluation reports that satisfy CVC guidelines and GFR 2017 requirements.

Our working prototype demonstrates end-to-end evaluation on synthetic CRPF-style tenders, processing bidder documents through IBM Docling (for structured PDFs) and PaddleOCR (for scanned documents in English and Indic scripts), with Claude providing explainable per-criterion assessment. The platform is designed for deployment within government data centres, with processing costs under Rs 50 per complete tender evaluation.

---

## 2. Problem Deep Dive

### 2.1 The Scale of Government Procurement

India is the world's largest government procurement market by volume. Central and state governments together issue lakhs of tenders annually through platforms like the Central Public Procurement Portal (CPPP), Government e-Marketplace (GeM), and state-level e-procurement portals. The Central government alone accounts for over 50,000 tenders per year, each requiring formal evaluation by a Tender Evaluation Committee (TEC).

For an organisation like CRPF -- India's largest Central Armed Police Force with over 3 lakh personnel across 246 battalions -- procurement is a continuous, high-volume operation spanning uniforms, rations, vehicles, arms, ammunition, communication equipment, and construction works. Each procurement cycle involves the publication of a Notice Inviting Tender (NIT), receipt of bids (typically in the two-cover system separating Technical and Financial bids), committee-based evaluation, and award.

### 2.2 Manual Evaluation: The Bottleneck

The current evaluation process suffers from four systemic problems:

**Time consumption.** A typical tender evaluation requires committee members to manually cross-reference each bidder's submission against every eligibility and technical criterion. For a tender with 15 criteria and 20 bidders, this means 300 individual checks, each requiring the officer to locate the relevant page in a bidder's multi-hundred-page submission, extract the relevant information, and compare it against the threshold. This process routinely takes 3-5 working days for a single tender.

**Inconsistency.** Different committee members may interpret the same criterion differently, apply varying thresholds of "sufficient evidence," or miss documents buried deep in a bidder's submission. The same bidder submission may receive different verdicts depending on which officer evaluates it, and at what hour of the day.

**Audit vulnerability.** GFR 2017 (Rule 149) and CVC guidelines require that tender evaluation be transparent, well-documented, and defensible. Yet manual evaluation often produces terse notes like "meets criteria" or "does not meet criteria" without recording what specific evidence was examined or why a particular conclusion was reached. This creates vulnerability during RTI requests, CVC inquiries, or legal challenges by unsuccessful bidders.

**Format heterogeneity.** Bidders submit documents in wildly varying formats -- typed PDFs, scanned photocopies, photographs of certificates, Word documents with embedded images. Some documents are in Hindi or regional languages. Officers must manually navigate this diversity for every single document, with no automated assistance.

### 2.3 CRPF-Specific Context

CRPF's procurement operations are governed by the CRPF Act, GFR 2017, and Defence Procurement Procedure (DPP) guidelines. Tenders are published through CPPP (eprocure.gov.in) and the CRPF website (crpf.gov.in). The two-cover system is standard: Cover 1 contains the Technical Bid (eligibility documents, technical compliance, experience certificates, financial statements) and Cover 2 contains the Financial Bid (price schedule, BOQ).

Common eligibility criteria across CRPF tenders include:
- Earnest Money Deposit (EMD) of prescribed amount
- Valid PAN card and GST registration
- Minimum annual turnover (typically Rs 5 crore or more for major procurements)
- Experience of similar work in the last 3-5 years
- ISO 9001:2015 or equivalent quality certification
- No blacklisting by any government organisation
- Submission of all prescribed forms and declarations

Each of these criteria must be individually verified for every bidder -- a laborious process that our platform automates while preserving complete auditability.

### 2.4 Root Cause Analysis

The core problem is not the absence of digitisation -- tenders are already published electronically, and bids are often submitted through e-procurement portals. The problem is the **absence of intelligent document understanding** at the evaluation stage. Existing e-procurement platforms are essentially filing systems: they digitise the workflow of submission and receipt but leave the intellectually demanding task of evaluation entirely to human officers.

Commercial tender intelligence platforms (such as BidAssist, TenderTiger, and GeM BidPredict) focus exclusively on the bidder/seller side -- helping companies discover and respond to tenders. No widely deployed solution addresses the government buyer/evaluator side, which is precisely the gap our platform fills.

---

## 3. Solution Architecture

### 3.1 Three-Stage Pipeline

TenderEval AI implements a clean three-stage pipeline:

```
STAGE 1: EXTRACT              STAGE 2: PARSE                STAGE 3: EVALUATE
Tender Document           Bidder Submissions           Per-Criterion Assessment
     |                         |                              |
     v                         v                              v
[Upload PDF/DOCX]    [Upload PDF/Scan/Image/DOCX]    [AI Evaluation Engine]
     |                         |                              |
     v                         v                              v
[Document Parsing]    [Docling -> PaddleOCR cascade]  [Criterion-by-Criterion]
     |                         |                              |
     v                         v                              v
[Claude: Extract      [Structured text with           [3-tier verdict with]
 Structured Criteria]  confidence scores]              [evidence + reasoning]
     |                         |                              |
     v                         v                              v
Criteria JSON          Parsed Documents DB             Evaluation Matrix
(category, threshold,  (text, OCR method,             (verdict, extracted_value,
 data_type, verbatim)   confidence)                    reasoning, confidence)
```

### 3.2 Document Parsing: Docling-PaddleOCR Cascade

Document parsing is the foundation of the entire pipeline. Government tender documents and bidder submissions come in highly variable formats -- from cleanly typeset PDFs to poorly scanned photocopies of handwritten certificates. Our parsing pipeline handles this diversity through an intelligent cascade:

**Primary parser: IBM Docling** (MIT licence, 30,000+ GitHub stars). Docling is the state-of-the-art open-source document parser, achieving 97.9% accuracy on table extraction benchmarks. It excels at typed PDFs with complex layouts -- precisely the format of most government tender documents, which contain structured tables (eligibility criteria, schedules, BOQs), multi-column text, and nested sections. Docling converts documents to structured Markdown, preserving table structure, section hierarchy, and page boundaries.

**Fallback: PaddleOCR** (Baidu, Apache 2.0 licence). When Docling returns fewer than 100 characters of extracted text -- a strong indicator that the document is scanned or image-based rather than text-based -- the pipeline automatically falls back to PaddleOCR. PaddleOCR achieves an F1 score of 0.938 on Indic script benchmarks, compared to 0.797 for Tesseract, making it the superior choice for Indian government documents that may contain Hindi, Kannada, Tamil, or other regional language text. It supports angle classification (for rotated scans) and handles mixed English-Indic content natively.

**Confidence tracking.** Every parsed document carries a confidence score and OCR method tag (docling, paddleocr, or none), allowing downstream evaluation to appropriately weight uncertain extractions and flag low-confidence parses for human review.

**Implementation detail.** The cascade logic is implemented in `document_parser.py`:
- PDF and DOCX files attempt Docling first; if the result contains fewer than 100 characters, PaddleOCR is invoked automatically
- Image files (JPG, PNG, TIFF) go directly to PaddleOCR
- If both methods fail, the document is stored with confidence 0.0 and flagged for manual processing

### 3.3 AI-Powered Criteria Extraction

Once the tender document is parsed, the platform uses Claude (Anthropic) to extract structured eligibility criteria. Indian government tenders follow a standardised structure defined by GFR 2017 and CPPP guidelines: Notice Inviting Tender (NIT), Instructions to Bidders (ITB), Evaluation Criteria, General Conditions of Contract (GCC), Special Conditions of Contract (SCC), Schedule of Requirements, and Bill of Quantities (BOQ). This structural consistency allows Claude to reliably identify and extract criteria.

For each criterion, the system extracts:

| Field | Description | Example |
|-------|-------------|---------|
| `category` | Eligibility (must-have), Technical (scored), or Financial (monetary) | `eligibility` |
| `name` | Short descriptive label | `Annual Turnover Requirement` |
| `description` | What the criterion requires | `Bidder must demonstrate minimum annual turnover` |
| `requirement_text` | Verbatim quote from tender document | `"The bidder should have an annual turnover of not less than Rs 5,00,00,000 (Rupees Five Crore only) in each of the last three financial years"` |
| `data_type` | Boolean, numeric, text, or document | `numeric` |
| `threshold` | Specific requirement | `>= 5 crore per annum for last 3 FYs` |
| `page_reference` | Location in original document | `Page 12, Clause 4.2` |

**Long document handling.** Government tenders can exceed 100 pages. The system uses an intelligent truncation strategy that preserves the beginning of the document (where NIT and eligibility clauses are typically located) and the end (where schedules and BOQ appear), truncating only the middle sections (typically GCC/SCC boilerplate). This ensures that no criteria are missed due to context window limitations.

**Robust JSON extraction.** Claude's response is parsed with retry logic: if the initial response is not valid JSON (e.g., wrapped in Markdown code blocks), the system automatically requests a corrected output up to 2 additional times before raising an error.

### 3.4 Per-Criterion Evaluation with Explainability

The core innovation of TenderEval AI is per-criterion evaluation with full explainability. For each (bidder, criterion) pair, the system produces:

**Three-tier verdict:**
- **Eligible** -- Bidder documents clearly satisfy the criterion with high confidence
- **Not Eligible** -- Bidder documents clearly fail the criterion (with specific evidence of the deficiency)
- **Needs Review** -- Information is ambiguous, partially present, OCR confidence is low, or the AI is not confident in its assessment

**Supporting evidence for every verdict:**
- `extracted_value` -- What was actually found in the bidder's documents (e.g., "Annual turnover: Rs 7.2 crore (FY 2024-25)")
- `reasoning` -- Step-by-step explanation of how the verdict was reached (e.g., "The bidder's audited financial statement on page 3 shows turnover of Rs 7.2 crore for FY 2024-25, Rs 6.8 crore for FY 2023-24, and Rs 5.4 crore for FY 2022-23. All three years exceed the threshold of Rs 5 crore. Verdict: Eligible.")
- `confidence` -- Numerical confidence score (0.0 to 1.0)
- `source_document` -- Which specific bidder document was used
- `source_page` -- Page reference within the source document

**The "never silently disqualify" principle.** This is enforced at multiple levels:
1. The evaluation prompt explicitly instructs the AI: *"NEVER silently disqualify -- when in doubt, use needs_review"*
2. If JSON parsing fails after all retries, the system returns a safe fallback verdict of `needs_review` with the reasoning: *"Automated evaluation could not be completed -- flagged for manual review"*
3. The overall bidder verdict follows a conservative aggregation: if ANY criterion is `needs_review`, the bidder's overall status is `needs_review`, ensuring human attention

### 3.5 Technology Stack Justification

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Backend Framework | FastAPI (Python) | Async support, automatic OpenAPI docs, type validation via Pydantic |
| Document Parsing | IBM Docling | MIT licence, 97.9% table accuracy, active maintenance (30K+ stars) |
| OCR | PaddleOCR | Best-in-class Indic script support (F1=0.938), Apache 2.0 licence |
| AI Engine | Claude (Anthropic) | Superior instruction-following for structured extraction, strong reasoning for per-criterion evaluation, explicit uncertainty handling |
| Database | SQLite (dev) / PostgreSQL (prod) | Zero-config development, production-grade scalability |
| Frontend | React + TypeScript (Vite) | Type safety, component reuse, fast development cycle |
| Deployment | Docker | Reproducible builds, on-premise deployment capability |

---

## 4. Government Feasibility and Deployment

### 4.1 Regulatory Compliance

**GFR 2017 (Rule 149).** The General Financial Rules mandate that tender evaluation must be transparent, documented, and conducted by a duly constituted committee. TenderEval AI does not replace the committee -- it augments it. The AI produces a draft evaluation with complete evidence trails; the committee reviews, overrides where necessary, and signs off. The system's `needs_review` mechanism ensures that borderline cases are always escalated to human judgement.

**CVC Guidelines.** The Central Vigilance Commission's guidelines on public procurement emphasise consistency, non-arbitrariness, and audit trails. TenderEval AI addresses each:
- *Consistency:* The same criteria are applied identically to every bidder, eliminating subjective variation
- *Non-arbitrariness:* Every verdict is backed by specific evidence and reasoning, not officer discretion
- *Audit trail:* Complete evaluation history is stored in the database -- criterion definitions (with verbatim quotes from the tender), extracted values, reasoning chains, confidence scores, and source document references

**IT Act 2000 and Data Protection.** The platform is designed for on-premise deployment within government data centres (NIC/NICSI infrastructure), ensuring that sensitive procurement data never leaves government-controlled environments. The Claude API calls can be routed through government-approved proxy infrastructure, or replaced with on-premise LLM deployments (e.g., Llama-based models) for classified procurements.

### 4.2 Integration with Existing Infrastructure

TenderEval AI is designed to integrate with, not replace, existing e-procurement infrastructure:

- **CPPP (eprocure.gov.in):** Tender documents and bidder submissions can be imported directly from CPPP. The platform's REST API enables integration via middleware.
- **GeM (gem.gov.in):** For GeM-listed procurements, the structured data already available on GeM can supplement document-based extraction, improving accuracy.
- **NIC e-Procurement:** State-level e-procurement portals operated by NIC follow similar standards and can be integrated through the same API layer.

### 4.3 90-Day Pilot Plan for CRPF

| Phase | Duration | Activities | Deliverables |
|-------|----------|------------|--------------|
| **Phase 1: Setup** | Days 1-15 | Deploy on CRPF/NIC infrastructure; configure for CRPF tender templates; load 10 historical tenders as test cases | Working deployment, baseline accuracy metrics |
| **Phase 2: Shadow Mode** | Days 16-45 | Run AI evaluation in parallel with manual evaluation on 5-10 live tenders; compare results; tune prompts and thresholds | Accuracy report, concordance analysis (AI vs. manual) |
| **Phase 3: Assisted Mode** | Days 46-75 | AI produces draft evaluations; committee reviews and approves/overrides; track override rate and time savings | Override rate <15%, time savings report |
| **Phase 4: Review** | Days 76-90 | Collect officer feedback; document lessons; prepare expansion plan | Pilot report, recommendations for scale-up |

**Success criteria:** (a) >85% concordance between AI and manual evaluation on eligible/not_eligible verdicts, (b) >60% reduction in evaluation time, (c) procurement officer satisfaction score >4/5.

### 4.4 Cost-Benefit Analysis

**Processing costs (per tender cycle):**
- Tender document parsing: Rs 0 (Docling/PaddleOCR are open-source, run locally)
- Criteria extraction (Claude Sonnet): Rs 1-4 per tender (approximately 2,000-8,000 input tokens + 2,000 output tokens)
- Per-bidder evaluation (Claude Sonnet): Rs 8-40 per bidder (depends on number of criteria and document length)
- Total for a tender with 20 bidders: Rs 160-800

**Time savings:**
- Manual evaluation: 3-5 working days per tender (assuming 2-3 officers)
- AI-assisted evaluation: 2-4 hours (AI processing) + 2-4 hours (human review of flagged items)
- Estimated reduction: **80% in evaluation time**

**Annual impact for CRPF alone:** If CRPF processes 500 tenders per year, and each saves 3 officer-days, that is 1,500 officer-days redirected from clerical cross-checking to substantive procurement decision-making.

### 4.5 Training Plan for Procurement Officers

The platform requires minimal training due to its intuitive interface:

1. **Half-day orientation workshop** (3 hours): Overview of AI-assisted evaluation, demonstration of the platform, hands-on exercise with a sample tender
2. **Quick-reference card** (laminated A4): Step-by-step workflow -- upload tender, review extracted criteria, upload bidder docs, run evaluation, review results matrix
3. **Ongoing support:** Helpdesk number, FAQ document, monthly feedback sessions during the pilot

The platform deliberately uses vocabulary familiar to procurement officers -- "eligibility criteria," "technical compliance," "evaluation matrix" -- rather than technical AI jargon.

---

## 5. Prototype Description

### 5.1 Working Demo Flow

The prototype demonstrates the complete end-to-end workflow:

**Step 1: Upload Tender Document.** The procurement officer uploads a tender PDF. The system parses it using Docling and extracts structured criteria using Claude. Within 30-60 seconds, the officer sees a list of extracted criteria organised by category (eligibility, technical, financial), each with its verbatim requirement text and threshold.

**Step 2: Review and Edit Criteria.** The officer can review the AI-extracted criteria, correct any errors, add missing criteria, or adjust thresholds. This human-in-the-loop step ensures accuracy before evaluation begins.

**Step 3: Add Bidders and Upload Documents.** For each bidder, the officer uploads their submission documents (PDF, scanned copies, images). The system automatically parses each document, using Docling for typed PDFs and falling back to PaddleOCR for scanned content.

**Step 4: Run Evaluation.** With a single click, the system evaluates the bidder against every criterion. Results appear in an evaluation matrix with traffic-light colour coding:
- Green: Eligible (confidence > 0.8)
- Red: Not Eligible (with specific deficiency noted)
- Amber: Needs Review (human attention required)

**Step 5: Review and Export.** The officer reviews amber-flagged items, makes final determinations, and exports the complete evaluation report as a PDF suitable for inclusion in the tender file.

### 5.2 API Architecture

The backend exposes a RESTful API built on FastAPI with automatic OpenAPI documentation:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tenders/upload` | POST | Upload tender document; triggers parsing and criteria extraction |
| `/api/tenders/{id}` | GET | Retrieve tender with all extracted criteria |
| `/api/tenders/` | GET | List all tenders with summary information |
| `/api/bidders/{tender_id}/add` | POST | Add bidder with uploaded documents |
| `/api/evaluation/{tender_id}/evaluate/{bidder_id}` | POST | Run per-criterion AI evaluation |
| `/api/evaluation/{tender_id}/results` | GET | Full evaluation results matrix for all bidders |
| `/health` | GET | Service health check |

### 5.3 Data Model

The relational data model captures the complete evaluation lifecycle:

- **Tender** -- metadata, status tracking (uploaded -> parsing -> parsed), linked to criteria and bidders
- **Criterion** -- category, name, description, verbatim requirement text, data type, threshold, page reference, weight
- **Bidder** -- name, overall verdict (aggregated from per-criterion results)
- **BidderDocument** -- filename, document type (PAN card, GST certificate, balance sheet, etc.), extracted text, OCR method used, confidence score
- **EvaluationResult** -- per (bidder, criterion) verdict with extracted value, reasoning, confidence, and source document reference

The `EvalVerdict` enum (`eligible`, `not_eligible`, `needs_review`, `pending`) provides type-safe verdict tracking throughout the system.

---

## 6. Scalability and Long-Term Impact

### 6.1 Scaling Roadmap

```
Phase 1 (Months 1-3)     Phase 2 (Months 4-9)         Phase 3 (Months 10-18)
CRPF Pilot               All CAPFs                     All Central Ministries
                          
- 500 tenders/year        - BSF, CISF, ITBP, SSB       - 50,000+ tenders/year
- 1 organisation          - 5 organisations              - 80+ ministries
- English tenders         - Hindi + English              - All 22 scheduled languages
- Manual upload           - CPPP API integration         - Full e-procurement integration
```

### 6.2 Technical Scalability

**Horizontal scaling.** The stateless API design allows horizontal scaling behind a load balancer. Document parsing and AI evaluation can be distributed across worker nodes using Celery or similar task queues.

**Language expansion.** PaddleOCR already supports Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati, and other Indic scripts. As state government tenders are increasingly issued in regional languages, the platform's OCR backbone is already equipped.

**Model flexibility.** The evaluation engine abstracts the LLM provider. Claude is our current choice for its superior structured output and reasoning capabilities, but the architecture supports drop-in replacement with:
- On-premise models (Llama, Mistral) for classified procurements
- Specialised fine-tuned models trained on historical evaluation data
- Multi-model consensus for high-value procurements (evaluate with multiple models, flag disagreements)

### 6.3 Long-Term Impact

**Quantitative impact (projected at national scale):**
- 50,000+ central government tenders evaluated per year
- 80% reduction in evaluation time per tender
- Rs 500+ crore annual savings in officer time (valued conservatively)
- Near-elimination of evaluation inconsistency across committees

**Qualitative impact:**
- **Transparency:** Every evaluation decision is backed by evidence and reasoning, strengthening public trust in procurement
- **Deterrence of bid rigging:** Consistent AI evaluation makes it harder to manipulate outcomes through selective scrutiny
- **Faster procurement cycles:** Reduced evaluation time means faster contract award, benefiting both government operations and MSME bidders waiting for contracts
- **Officer empowerment:** Procurement officers are freed from clerical cross-checking to focus on substantive judgement -- exactly the cases flagged as `needs_review`

---

## 7. Innovation Highlights

1. **Evaluator-side AI:** Unlike all existing tender intelligence platforms that serve bidders, TenderEval AI is the first to serve the government evaluator. This is a fundamentally different and underserved market.

2. **Three-tier verdict system with "never silently disqualify."** The `needs_review` tier with safe fallback is not merely a feature -- it is a design philosophy that makes AI-assisted evaluation acceptable to risk-averse government procurement processes.

3. **Docling-PaddleOCR cascade.** Automatic format detection and fallback ensures that no bidder submission is rejected simply because it was scanned rather than typed -- a fairness guarantee that manual processes struggle to provide consistently.

4. **Verbatim criterion extraction.** By extracting the exact text from the tender document (not a paraphrase), the system creates an audit trail linking every evaluation decision back to the original tender language -- precisely what CVC and RTI inquiries demand.

5. **Cost efficiency.** At Rs 160-800 per complete tender evaluation (all bidders included), the platform costs less than a single hour of officer time. The entire CRPF annual tender evaluation workload could be AI-processed for under Rs 4 lakh.

---

## 8. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **AI misclassifies a criterion as eligible when bidder is not** | Medium | High | Three-tier system ensures uncertain cases go to `needs_review`; committee retains final authority; shadow-mode pilot validates accuracy before live deployment |
| **Scanned document quality too poor for OCR** | Medium | Medium | Confidence score tracking; documents with confidence < 0.5 automatically flagged for manual review; procurement officers can request fresh copies from bidders |
| **Resistance from procurement officers** | Medium | Medium | Positioned as "assistant, not replacement"; officer retains all decision authority; training programme emphasises augmentation; pilot builds trust through demonstrated accuracy |
| **Data security concerns** | Low | High | On-premise deployment; no bidder data leaves government network; LLM API calls can be routed through government proxy or replaced with on-premise models |
| **Legal challenge by unsuccessful bidder citing AI evaluation** | Low | High | AI produces "draft evaluation" only; committee formally signs off on all decisions; complete audit trail available; `needs_review` ensures no automated disqualification |
| **Tender format variation across organisations** | Medium | Low | Claude's instruction-following capability handles format variation; system improves with exposure to diverse tender types; organisation-specific prompt templates can be configured |

---

## 9. Team and References

### Team

We are a two-person full-stack engineering team with experience in government technology, AI/ML systems, and document processing. Our combined expertise spans backend system design (Python, FastAPI), frontend development (React, TypeScript), and applied AI (LLM integration, OCR pipelines, document understanding).

### Key References

1. **General Financial Rules (GFR) 2017** -- Department of Expenditure, Ministry of Finance. Rule 149 on tender evaluation procedures.
2. **CVC Guidelines on Public Procurement** -- Central Vigilance Commission circulars on transparency and consistency in tender evaluation.
3. **Docling** -- Auer, C. et al. (2024). "Docling Technical Report." IBM Research. arXiv:2408.09869. GitHub: 30,000+ stars, MIT licence.
4. **PaddleOCR** -- Du, Y. et al. (2020). "PP-OCR: A Practical Ultra Lightweight OCR System." PaddlePaddle. F1=0.938 on Indic script benchmarks.
5. **Central Public Procurement Portal (CPPP)** -- eprocure.gov.in. National platform for central government tender publication and bid submission.
6. **Government e-Marketplace (GeM)** -- gem.gov.in. Unified procurement platform for goods and services.
7. **CRPF Procurement Portal** -- crpf.gov.in. Tender notices and procurement information for the Central Reserve Police Force.
8. **IT Act 2000** -- Information Technology Act for legal framework on electronic records and digital signatures.
9. **Defence Procurement Procedure (DPP)** -- Guidelines governing procurement for defence and paramilitary organisations.

### Open-Source Components

| Component | Licence | Version | Purpose |
|-----------|---------|---------|---------|
| FastAPI | MIT | 0.110+ | Backend API framework |
| Docling | MIT | 2.x | Document parsing and table extraction |
| PaddleOCR | Apache 2.0 | 2.7+ | OCR for scanned documents and Indic scripts |
| SQLAlchemy | MIT | 2.0+ | ORM and database abstraction |
| React | MIT | 18.x | Frontend framework |
| Vite | MIT | 5.x | Frontend build tooling |

---

*This document accompanies a working prototype demonstrating end-to-end tender evaluation. The prototype source code, synthetic test data, and a 5-minute video walkthrough are included in the submission package.*
