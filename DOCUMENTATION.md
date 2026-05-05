# TenderEval AI — Technical Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [AI Pipeline](#ai-pipeline)
4. [Forensic Analysis Module](#forensic-analysis-module)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend API Reference](#backend-api-reference)
7. [Data Models](#data-models)
8. [Deployment Guide](#deployment-guide)

---

## System Overview

TenderEval AI is an AI-powered tender evaluation platform designed for Indian government procurement, specifically built for CRPF (Central Reserve Police Force) tender workflows. The system automates the end-to-end process of tender evaluation — from extracting eligibility criteria from tender documents to evaluating bidder submissions and detecting bid-rigging patterns.

### Key Design Principles

- **Zero Silent Disqualification**: No bidder is disqualified without explicit, explainable reasoning linked to source documents
- **Format Agnostic**: The document pipeline handles typed PDFs, scanned documents, photographs, handwritten annotations, and Word/Excel files
- **Audit-First**: Every AI decision and human override is logged with full accountability
- **Anti-Cartel**: Built-in forensic analysis detects coordinated bidding patterns, shell companies, and cartel behavior

---

## Architecture

### Three-Tier Architecture

1. **Frontend (Vite SPA)**: React 18 + TypeScript single-page application with embedded demo data. Runs entirely in the browser — no server dependency for demonstration.

2. **Backend (FastAPI)**: Python REST API handling document upload, OCR processing, AI-powered criterion extraction, and bidder evaluation. Uses SQLAlchemy ORM with SQLite (dev) or PostgreSQL (prod).

3. **AI Layer (Claude API)**: Anthropic Claude Sonnet for structured criterion extraction and per-criterion bidder evaluation with chain-of-thought reasoning.

### Data Flow

1. Officer uploads tender document (PDF/DOCX)
2. Document is parsed via Docling (typed) or PaddleOCR (scanned)
3. Claude API extracts structured eligibility criteria
4. Officer uploads bidder submission documents
5. Each document is parsed through the multi-format pipeline
6. Claude API evaluates each bidder against each criterion
7. Results are displayed in the evaluation matrix with source-page links
8. TGNN module runs forensic analysis across historical data
9. Statutory cross-verification checks live government databases
10. Officers can override verdicts — all actions are audit-logged

---

## AI Pipeline

### Stage 1: Criterion Extraction

The criterion extraction service uses Claude Sonnet to parse tender documents and extract structured eligibility requirements. The prompt instructs the model to identify:

- **Category**: eligibility (must-have), technical (scored), financial (monetary)
- **Name**: short label (e.g., "EMD Submission", "Annual Turnover")
- **Description**: what the criterion requires
- **Requirement Text**: exact verbatim quote from the tender document
- **Data Type**: boolean, numeric, text, or document
- **Threshold**: specific value (e.g., ">= 5 Crore", "ISO 9001:2015")
- **Page Reference**: location in the original document

Key features:
- Handles documents up to 50,000 characters with intelligent truncation
- Parses nested conditional requirements (e.g., "if MSME, reduced threshold")
- JSON response validation with automatic retry (up to 3 attempts)

### Stage 2: Document Parsing

The multi-format pipeline uses a cascading approach:

1. **Docling (IBM)**: First-choice parser for typed PDFs. Achieves 97.9% table detection accuracy. Extracts markdown-formatted text with page boundaries.

2. **PaddleOCR**: Fallback for scanned documents. Uses angle classification for rotated text. F1 score of 0.938 on standard benchmarks.

3. **Vision-Language Models**: For complex layouts with stamps, signatures, and handwritten annotations. Provides contextual understanding beyond raw OCR.

Automatic fallback: If Docling returns less than 100 characters (likely a scanned document), the system automatically falls back to PaddleOCR.

### Stage 3: Per-Criterion Evaluation

For each criterion-bidder pair, the evaluator:

1. Aggregates all bidder document text with metadata (filename, OCR method, confidence)
2. Constructs a structured prompt with criterion details and bidder evidence
3. Requests a JSON verdict: eligible / not_eligible / needs_review
4. Extracts: verdict, extracted_value, reasoning, confidence, source_document
5. Validates response and retries on parse failure
6. Falls back to "needs_review" with manual review flag after all retries

Evaluation rules:
- Documents clearly satisfying criterion → eligible
- Documents clearly failing criterion → not_eligible
- Ambiguous, partial, or low-confidence → needs_review
- Never silently disqualify — when in doubt, flag for review

---

## Forensic Analysis Module

### Temporal Graph Neural Network (TGNN)

The forensic analysis module builds a continuously growing knowledge graph of all bidding entities. The graph contains:

**Node types:**
- Bidding entities (companies)
- Directors and key personnel
- IP address clusters
- Registered addresses
- Historical tenders

**Edge types:**
- Director-Company relationships
- Shared address connections
- IP submission overlaps
- Historical bid participation
- Win/loss patterns

### Risk Scoring Dimensions

Each bidder receives a forensic risk score (0-100) based on six dimensions:

1. **Director Linkages**: Shared directors with blacklisted or competing entities
2. **Address Overlap**: Common registered addresses suggesting shell company structures
3. **IP Clustering**: Bid submissions from overlapping IP address ranges
4. **Price Coordination**: Coordinated bid pricing patterns suggesting collusion
5. **Win Pattern Analysis**: Round-robin win patterns across historical tenders
6. **Shell Company Indicators**: Newly formed entities with minimal history bidding on large contracts

### Detection Capabilities

- Shell company cluster identification
- Round-robin bidding ring detection
- Coordinated price inflation patterns
- Director network analysis across entity boundaries
- Temporal pattern analysis (company formation dates vs. tender timelines)

---

## Frontend Architecture

### Pages

| Page | Route | Feature |
|------|-------|---------|
| Dashboard | `/` | KPI overview, verdict distribution, bidder summary, feature showcase |
| Tender Criteria | `/tender/:id` | Extracted criteria with categories, thresholds, and requirement text |
| Bidder Management | `/bidders/:id` | Bidder cards with documents, OCR confidence, risk flags |
| Evaluation Matrix | `/results/:id` | Interactive verdict matrix with expandable reasoning and source links |
| Document Pipeline | `/pipeline` | Processing pipeline visualization, format support, OCR stats |
| Forensic Analysis | `/forensic` | Risk gauges, radar chart, entity network graph, TGNN methodology |
| Statutory Checks | `/statutory` | Per-bidder verification against GST, MSME, GeM, EPFO databases |
| Audit Trail | `/audit` | Officer override timeline with full accountability logging |

### Design System

- **Theme**: Dark mode with glassmorphism cards
- **Typography**: Inter font family
- **Colors**: Indigo/violet primary, emerald/rose/amber for status indicators
- **Animations**: Fade-in, slide-in, pulse-glow, staggered entry animations
- **Charts**: Recharts library (PieChart, BarChart, RadarChart)

---

## Backend API Reference

### Tenders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tenders/upload` | Upload tender document (PDF/DOCX), triggers criterion extraction |
| GET | `/api/tenders/` | List all uploaded tenders |
| GET | `/api/tenders/{tender_id}` | Get tender details with extracted criteria |

### Bidders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bidders/{tender_id}/add` | Add bidder with submitted documents |
| GET | `/api/bidders/{tender_id}` | List all bidders for a tender |

### Evaluation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/evaluation/{tender_id}/evaluate/{bidder_id}` | Run AI evaluation for a bidder |
| GET | `/api/evaluation/{tender_id}/results` | Get all evaluation results for a tender |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |

---

## Data Models

### Tender
- id, title, organization, tender_number, original_filename, status, created_at
- Status values: uploaded, parsing, parsed, error

### Criterion
- id, tender_id, category, name, description, requirement_text, data_type, threshold, page_reference, weight

### Bidder
- id, tender_id, name, overall_verdict, created_at
- Verdict values: eligible, not_eligible, needs_review, pending

### BidderDocument
- id, bidder_id, filename, doc_type, extracted_text, ocr_used, confidence

### EvaluationResult
- id, bidder_id, criterion_id, verdict, extracted_value, reasoning, confidence, source_document, source_page, evaluated_at

---

## Deployment Guide

### Vercel (Frontend Only)

1. Push the repository to GitHub
2. Import the repository in Vercel
3. Set the root directory to "frontend"
4. Vercel auto-detects Vite and configures build settings
5. The frontend runs standalone with embedded demo data

### Full Stack Deployment

1. Deploy the backend to any Python-capable host (Railway, Render, AWS, etc.)
2. Set environment variables: ANTHROPIC_API_KEY, DATABASE_URL
3. Update the frontend's vite.config.ts proxy target to point to the deployed backend URL
4. Deploy the frontend to Vercel

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| ANTHROPIC_API_KEY | Yes (backend) | Anthropic API key for Claude Sonnet |
| DATABASE_URL | No | Database connection string (defaults to SQLite) |
