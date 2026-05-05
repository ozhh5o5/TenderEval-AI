# TenderEval AI — Anti-Cartel Forensic Tender Evaluation for Government Procurement

Automated tender evaluation platform that extracts eligibility criteria from government tender documents, parses bidder submissions across all formats (typed PDFs, scanned copies, Word files, photographs), and produces explainable per-criterion verdicts (Eligible / Not Eligible / Needs Review). Built for CRPF and Indian government procurement workflows — never silently disqualifies a bidder.

> **PanIIT AI for Bharat Hackathon** — Theme 3: AI-Based Tender Evaluation and Eligibility Analysis for Government Procurement (CRPF)

## Core Features

### 1. Zero-Labeling Criterion Extraction
The AI reads the tender PDF and automatically extracts every eligibility requirement (minimum turnover, years of experience, license validity, EMD amount, technical certifications) without any manual annotation. It parses nested conditional requirements into structured criterion objects with thresholds, conditions, and evidence types.

### 2. Multi-Format Document Intelligence Pipeline
Bidder submissions arrive as machine-typed PDFs, handwritten affidavits, scanned certificates with stamps, rotated photographs, and Word/Excel files. The pipeline chains Docling (97.9% table accuracy), PaddleOCR (F1=0.938), and Vision-Language Models to extract structured data from every format. No document is rejected for format incompatibility.

### 3. Per-Criterion Verdict with Source-Page Anchoring
For every criterion and every bidder, the AI produces a verdict with a confidence score. Each verdict hyperlinks to the exact page number in the original bidder PDF that contains the supporting or contradicting evidence. Officers click through, verify in seconds, and override if needed.

### 4. Bid-Rigging Detection via Temporal Graph Neural Networks
TenderEval builds a knowledge graph of all bidding entities across historical tenders: registered directors, shared addresses, IP submission metadata, bid amount patterns, and win/loss sequences. A Temporal GNN detects shell company clusters, round-robin bidding rings, and coordinated price inflation. Every bidder receives a forensic risk score.

### 5. Live Statutory Cross-Verification
The AI cross-references bidder claims against live government databases: GST registration (gst.gov.in), MSME Udyam registration, GeM blacklisting records, and EPFO labor law compliance. Discrepancies are flagged with the exact conflicting data source cited.

### 6. Comparative Bid Matrix with Override Audit
Officers see a side-by-side comparison of all bidders across all criteria with drill-down into every supporting document. When an officer overrides a verdict, the system records the override reason, officer identity, and timestamp. The full override history is available for audit.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Python, FastAPI, SQLAlchemy, SQLite/PostgreSQL
- **Document Parsing:** Docling (IBM), PaddleOCR
- **AI Evaluation:** Claude API (Sonnet) with structured output and retry logic
- **Deployment:** Vercel (frontend), any Python host (backend)

## How to Run Locally

### Frontend (Runs standalone with demo data — no backend needed)

1. Open a terminal or command prompt on your computer

2. Navigate to the frontend folder inside the project directory

3. Run the command to install all required packages: npm install

4. Start the development server: npm run dev

5. Open your web browser and go to http://localhost:5173

6. You will see the TenderEval AI dashboard with pre-loaded demo data including one CRPF tender, three bidders, and complete evaluation results

### Backend (Optional — needed only for real document processing)

1. Open a second terminal or command prompt

2. Navigate to the backend folder inside the project directory

3. Create a Python virtual environment: python -m venv .venv

4. Activate the virtual environment:
   - On Windows: .venv\Scripts\activate
   - On macOS/Linux: source .venv/bin/activate

5. Install the Python dependencies: pip install -r requirements.txt

6. Copy the environment example file to create your own: copy .env.example .env (Windows) or cp .env.example .env (macOS/Linux)

7. Open the .env file and replace sk-ant-xxx with your actual Anthropic API key

8. Start the backend server: uvicorn main:app --reload --port 8000

9. The API will be available at http://localhost:8000 and API documentation at http://localhost:8000/docs

### Seeding Demo Data (Optional — frontend already has embedded demo data)

1. With the backend running and virtual environment activated

2. Navigate to the project root directory

3. Run the seed script: python demo/seed_demo.py

4. This creates a realistic CRPF tender with 8 criteria and 3 bidders (one eligible, one not eligible, one needs review)

## Project Structure

```
tendereval-ai/
├── frontend/                  # Vite + React SPA
│   ├── src/
│   │   ├── data/mock-data.ts  # Embedded demo data
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TenderDetail.tsx
│   │   │   ├── BidderManagement.tsx
│   │   │   ├── EvaluationResults.tsx
│   │   │   ├── DocumentPipeline.tsx
│   │   │   ├── ForensicAnalysis.tsx
│   │   │   ├── StatutoryVerification.tsx
│   │   │   └── AuditTrail.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
├── backend/                   # FastAPI server
│   ├── app/
│   │   ├── models.py
│   │   ├── database.py
│   │   ├── routers/
│   │   └── services/
│   ├── main.py
│   └── requirements.txt
├── demo/
│   └── seed_demo.py
├── docs/
│   └── solution-document.md
└── README.md
```

## Who Benefits

- **CRPF and Defense procurement** — tamper-proof, explainable evaluations with source-linked verdicts
- **Central and state procurement bodies** — 10x faster evaluation with zero silent disqualifications
- **Anti-corruption agencies (CBI, CVC)** — automated cartel detection across historical tenders
- **Genuine MSME bidders** — fair evaluation regardless of document formatting quality
- **RTI applicants and journalists** — complete audit trail for every procurement decision

## Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for the full technical documentation.

See [docs/solution-document.md](docs/solution-document.md) for the complete solution write-up.
