export interface Criterion {
  id: string; category: string; name: string; description: string;
  threshold: string; data_type: string; page_reference: string; requirement_text: string;
}
export interface BidderDocument {
  id: string; filename: string; doc_type: string; extracted_text: string;
  ocr_used: string; confidence: number;
}
export interface CriterionResult {
  criterion_id: string; criterion: string; verdict: string;
  extracted_value: string; reasoning: string; confidence: number;
  source_document: string; source_page?: string;
}
export interface Bidder {
  id: string; name: string; overall_verdict: string;
  documents: BidderDocument[]; results: CriterionResult[];
  forensic_risk_score: number; risk_flags: string[];
}
export interface StatutoryCheck {
  bidder_id: string; source: string; status: string;
  claimed_value: string; actual_value: string; discrepancy: boolean; verified_at: string;
}
export interface AuditEntry {
  id: string; officer: string; action: string; bidder_name: string;
  criterion: string; old_verdict: string; new_verdict: string;
  reason: string; timestamp: string;
}
export interface Tender {
  id: string; title: string; organization: string; tender_number: string;
  status: string; created_at: string; criteria: Criterion[]; bidders: Bidder[];
}

export const CRITERIA: Criterion[] = [
  { id:"c1", category:"eligibility", name:"EMD Submission", description:"Earnest Money Deposit of Rs. 10,00,000 must be submitted via bank guarantee or demand draft", requirement_text:"EMD of Rs. 10,00,000/- in the form of BG/DD from any Scheduled Bank", data_type:"document", threshold:"Rs. 10,00,000 BG/DD", page_reference:"3" },
  { id:"c2", category:"financial", name:"Annual Turnover", description:"Minimum average annual turnover of Rs. 5 Crore in the last 3 financial years", requirement_text:"Average annual turnover during the last 3 years ending 31.03.2025 should not be less than Rs. 5,00,00,000/-", data_type:"numeric", threshold:">= 5 Crore (avg of last 3 FY)", page_reference:"12" },
  { id:"c3", category:"eligibility", name:"GST Registration", description:"Valid GST registration certificate", requirement_text:"The bidder must hold a valid GSTIN", data_type:"document", threshold:"Valid GSTIN", page_reference:"8" },
  { id:"c4", category:"eligibility", name:"PAN Card", description:"Valid PAN card of the bidding entity", requirement_text:"Copy of PAN card of the firm/company", data_type:"document", threshold:"Valid PAN", page_reference:"8" },
  { id:"c5", category:"technical", name:"Similar Work Experience", description:"At least 3 similar construction projects completed in the last 5 years, each valued at Rs. 2 Crore or above", requirement_text:"The bidder should have successfully completed at least 3 similar works each costing not less than Rs. 2,00,00,000/- during the last 5 years", data_type:"numeric", threshold:">= 3 projects, each >= 2 Crore", page_reference:"13" },
  { id:"c6", category:"eligibility", name:"ISO 9001 Certification", description:"Valid ISO 9001:2015 Quality Management System certification", requirement_text:"The bidder must possess valid ISO 9001:2015 certification", data_type:"document", threshold:"ISO 9001:2015 (valid/unexpired)", page_reference:"9" },
  { id:"c7", category:"eligibility", name:"No Blacklisting Declaration", description:"Self-declaration that the firm has not been blacklisted by any Central/State Government agency", requirement_text:"An affidavit on stamp paper stating that the firm has not been blacklisted/debarred by any Govt. department", data_type:"boolean", threshold:"Not blacklisted", page_reference:"10" },
  { id:"c8", category:"financial", name:"Solvency Certificate", description:"Solvency certificate from a scheduled bank for at least Rs. 2 Crore", requirement_text:"Solvency Certificate for Rs. 2,00,00,000/- or above from a Scheduled Bank", data_type:"document", threshold:">= 2 Crore", page_reference:"12" },
];

const BIDDER_A: Bidder = {
  id:"b1", name:"Infra Build Solutions Pvt Ltd", overall_verdict:"eligible", forensic_risk_score:12, risk_flags:[],
  documents: [
    { id:"d1", filename:"EMD_Bank_Guarantee.pdf", doc_type:"emd", extracted_text:"Bank Guarantee No. BG/2026/4567 for Rs. 10,00,000/- issued by State Bank of India, valid till 31.12.2026.", ocr_used:"docling", confidence:0.97 },
    { id:"d2", filename:"Audited_Financials_3Y.pdf", doc_type:"balance_sheet", extracted_text:"FY 2022-23: Rs. 8.2 Crore; FY 2023-24: Rs. 9.5 Crore; FY 2024-25: Rs. 11.3 Crore. Average: Rs. 9.67 Crore.", ocr_used:"docling", confidence:0.95 },
    { id:"d3", filename:"GST_Certificate.pdf", doc_type:"gst_cert", extracted_text:"GSTIN: 29AABCI5678K1Z5, Status: Active", ocr_used:"docling", confidence:0.98 },
    { id:"d4", filename:"PAN_Card.pdf", doc_type:"pan_card", extracted_text:"PAN: AABCI5678K", ocr_used:"docling", confidence:0.99 },
    { id:"d5", filename:"Work_Experience_Certs.pdf", doc_type:"experience_cert", extracted_text:"4 projects: BSF Jodhpur Rs. 3.2Cr (2021), Border Fencing Rs. 4.1Cr (2022), ITBP Leh Rs. 2.8Cr (2023), CISF Chennai Rs. 2.5Cr (2024)", ocr_used:"docling", confidence:0.93 },
    { id:"d6", filename:"ISO_9001_Certificate.pdf", doc_type:"iso_cert", extracted_text:"ISO 9001:2015 Certificate valid from 01.04.2024 to 31.03.2027", ocr_used:"docling", confidence:0.96 },
  ],
  results: [
    { criterion_id:"c1", criterion:"EMD Submission", verdict:"eligible", extracted_value:"BG for Rs. 10,00,000 from SBI, valid till 31.12.2026", reasoning:"EMD bank guarantee matches the required amount. Issued by SBI (scheduled bank). Validity covers the tender period.", confidence:0.98, source_document:"EMD_Bank_Guarantee.pdf", source_page:"1" },
    { criterion_id:"c2", criterion:"Annual Turnover", verdict:"eligible", extracted_value:"Avg turnover Rs. 9.67 Crore", reasoning:"Average annual turnover of Rs. 9.67 Crore exceeds the required Rs. 5 Crore threshold.", confidence:0.97, source_document:"Audited_Financials_3Y.pdf", source_page:"2-4" },
    { criterion_id:"c3", criterion:"GST Registration", verdict:"eligible", extracted_value:"GSTIN 29AABCI5678K1Z5, Active", reasoning:"Valid active GSTIN found. Legal name matches.", confidence:0.99, source_document:"GST_Certificate.pdf", source_page:"1" },
    { criterion_id:"c4", criterion:"PAN Card", verdict:"eligible", extracted_value:"PAN: AABCI5678K", reasoning:"Valid PAN card found. Name matches.", confidence:0.99, source_document:"PAN_Card.pdf", source_page:"1" },
    { criterion_id:"c5", criterion:"Similar Work Experience", verdict:"eligible", extracted_value:"4 projects, all >= 2Cr, within last 5 years", reasoning:"Bidder has 4 completed projects each exceeding Rs. 2 Crore, surpassing the minimum of 3.", confidence:0.95, source_document:"Work_Experience_Certs.pdf", source_page:"1-3" },
    { criterion_id:"c6", criterion:"ISO 9001 Certification", verdict:"eligible", extracted_value:"ISO 9001:2015, valid till 31.03.2027", reasoning:"Valid ISO 9001:2015 certificate found. Not expired.", confidence:0.97, source_document:"ISO_9001_Certificate.pdf", source_page:"1" },
    { criterion_id:"c7", criterion:"No Blacklisting Declaration", verdict:"eligible", extracted_value:"Self-declaration attached", reasoning:"No-blacklisting affidavit present.", confidence:0.90, source_document:"Work_Experience_Certs.pdf", source_page:"5" },
    { criterion_id:"c8", criterion:"Solvency Certificate", verdict:"eligible", extracted_value:"Solvency of Rs. 3.5 Crore from SBI", reasoning:"Solvency certificate exceeds the required Rs. 2 Crore threshold.", confidence:0.94, source_document:"Audited_Financials_3Y.pdf", source_page:"6" },
  ]
};

const BIDDER_B: Bidder = {
  id:"b2", name:"QuickBuild Contractors", overall_verdict:"not_eligible", forensic_risk_score:67, risk_flags:["Shared director with blacklisted entity","Coordinated bid pricing pattern","IP address overlap with Bidder C submissions"],
  documents: [
    { id:"d7", filename:"EMD_DD.pdf", doc_type:"emd", extracted_text:"Demand Draft No. 445566 for Rs. 10,00,000/- from PNB", ocr_used:"docling", confidence:0.94 },
    { id:"d8", filename:"Financial_Statements.pdf", doc_type:"balance_sheet", extracted_text:"FY 2022-23: Rs. 2.1 Crore; FY 2023-24: Rs. 3.0 Crore; FY 2024-25: Rs. 3.8 Crore.", ocr_used:"docling", confidence:0.92 },
    { id:"d9", filename:"GST_Reg.pdf", doc_type:"gst_cert", extracted_text:"GSTIN: 29BBBQB1234M1Z8, Status: Active", ocr_used:"docling", confidence:0.96 },
    { id:"d10", filename:"PAN.jpg", doc_type:"pan_card", extracted_text:"PAN: BBBQB1234M", ocr_used:"paddleocr", confidence:0.88 },
    { id:"d11", filename:"Experience_Letters.pdf", doc_type:"experience_cert", extracted_text:"1. Compound Wall BSNL Rs. 45 Lakhs (2022). 2. Interior Renovation Rs. 1.2 Crore (2023).", ocr_used:"docling", confidence:0.91 },
    { id:"d12", filename:"ISO_Certificate_Expired.pdf", doc_type:"iso_cert", extracted_text:"ISO 9001:2015 Valid: 01.01.2020 to 31.12.2022. EXPIRED.", ocr_used:"docling", confidence:0.95 },
  ],
  results: [
    { criterion_id:"c1", criterion:"EMD Submission", verdict:"eligible", extracted_value:"DD for Rs. 10,00,000 from PNB", reasoning:"EMD demand draft matches required amount.", confidence:0.95, source_document:"EMD_DD.pdf", source_page:"1" },
    { criterion_id:"c2", criterion:"Annual Turnover", verdict:"not_eligible", extracted_value:"Avg turnover Rs. 2.97 Crore", reasoning:"Average turnover of Rs. 2.97 Crore is below the required Rs. 5 Crore. Shortfall of Rs. 2.03 Crore.", confidence:0.96, source_document:"Financial_Statements.pdf", source_page:"1-3" },
    { criterion_id:"c3", criterion:"GST Registration", verdict:"eligible", extracted_value:"GSTIN 29BBBQB1234M1Z8, Active", reasoning:"Valid active GSTIN found.", confidence:0.97, source_document:"GST_Reg.pdf", source_page:"1" },
    { criterion_id:"c4", criterion:"PAN Card", verdict:"eligible", extracted_value:"PAN: BBBQB1234M", reasoning:"PAN card found via OCR.", confidence:0.88, source_document:"PAN.jpg", source_page:"1" },
    { criterion_id:"c5", criterion:"Similar Work Experience", verdict:"not_eligible", extracted_value:"Only 2 projects, neither >= 2 Crore", reasoning:"Only 2 projects found, neither meets the Rs. 2 Crore minimum.", confidence:0.94, source_document:"Experience_Letters.pdf", source_page:"1" },
    { criterion_id:"c6", criterion:"ISO 9001 Certification", verdict:"not_eligible", extracted_value:"ISO 9001:2015, EXPIRED 31.12.2022", reasoning:"ISO certificate expired over 3 years ago.", confidence:0.97, source_document:"ISO_Certificate_Expired.pdf", source_page:"1" },
    { criterion_id:"c7", criterion:"No Blacklisting Declaration", verdict:"needs_review", extracted_value:"No affidavit found", reasoning:"No blacklisting declaration found in submitted documents.", confidence:0.30, source_document:"", source_page:"" },
    { criterion_id:"c8", criterion:"Solvency Certificate", verdict:"needs_review", extracted_value:"No solvency certificate found", reasoning:"Solvency certificate not found in submission.", confidence:0.20, source_document:"", source_page:"" },
  ]
};

const BIDDER_C: Bidder = {
  id:"b3", name:"Bharat Nirman Enterprises", overall_verdict:"needs_review", forensic_risk_score:38, risk_flags:["IP address overlap with Bidder B submissions"],
  documents: [
    { id:"d13", filename:"EMD_BG_Scan.jpg", doc_type:"emd", extracted_text:"Ban... Guar...tee Rs. 10,0..000 State Ba.. of Ind..", ocr_used:"paddleocr", confidence:0.62 },
    { id:"d14", filename:"CA_Certificate_Turnover.pdf", doc_type:"balance_sheet", extracted_text:"Average annual turnover of Rs. 5.1 Crore for FY 2022-25.", ocr_used:"docling", confidence:0.94 },
    { id:"d15", filename:"GST_Certificate.pdf", doc_type:"gst_cert", extracted_text:"GSTIN: 29AAFBH9012N1ZQ, Status: Active", ocr_used:"docling", confidence:0.97 },
    { id:"d16", filename:"PAN_Photo.jpg", doc_type:"pan_card", extracted_text:"PAN: AAFBH9012N", ocr_used:"paddleocr", confidence:0.85 },
    { id:"d17", filename:"Work_Orders_Scanned.pdf", doc_type:"experience_cert", extracted_text:"1. Army Cantt Pune Rs. 2.3Cr (2021). 2. CRPF Hyderabad Rs. 3.1Cr (2022). 3. BSF guard room - value illegible, Rs. 1.8 or 2.8Cr (2023).", ocr_used:"paddleocr", confidence:0.72 },
    { id:"d18", filename:"ISO_Cert.pdf", doc_type:"iso_cert", extracted_text:"ISO 9001:2015 Valid: 15.06.2023 to 14.06.2026.", ocr_used:"docling", confidence:0.96 },
  ],
  results: [
    { criterion_id:"c1", criterion:"EMD Submission", verdict:"needs_review", extracted_value:"Scanned BG, partially illegible, appears Rs. 10L from SBI", reasoning:"EMD document is a scanned photograph with low OCR confidence (0.62). Needs manual verification.", confidence:0.55, source_document:"EMD_BG_Scan.jpg", source_page:"1" },
    { criterion_id:"c2", criterion:"Annual Turnover", verdict:"eligible", extracted_value:"CA-certified avg turnover Rs. 5.1 Crore", reasoning:"Meets the Rs. 5 Crore threshold but margin is thin — borderline pass.", confidence:0.88, source_document:"CA_Certificate_Turnover.pdf", source_page:"1" },
    { criterion_id:"c3", criterion:"GST Registration", verdict:"eligible", extracted_value:"GSTIN 29AAFBH9012N1ZQ, Active", reasoning:"Valid active GSTIN.", confidence:0.97, source_document:"GST_Certificate.pdf", source_page:"1" },
    { criterion_id:"c4", criterion:"PAN Card", verdict:"eligible", extracted_value:"PAN: AAFBH9012N", reasoning:"PAN found via OCR. Readable.", confidence:0.85, source_document:"PAN_Photo.jpg", source_page:"1" },
    { criterion_id:"c5", criterion:"Similar Work Experience", verdict:"needs_review", extracted_value:"2 clear projects, 3rd value illegible", reasoning:"Two projects clearly meet Rs. 2 Crore. Third project value partially illegible. Manual review needed.", confidence:0.60, source_document:"Work_Orders_Scanned.pdf", source_page:"2-3" },
    { criterion_id:"c6", criterion:"ISO 9001 Certification", verdict:"eligible", extracted_value:"ISO 9001:2015, valid till 14.06.2026", reasoning:"Valid ISO certificate, not expired.", confidence:0.96, source_document:"ISO_Cert.pdf", source_page:"1" },
    { criterion_id:"c7", criterion:"No Blacklisting Declaration", verdict:"eligible", extracted_value:"Affidavit on stamp paper attached", reasoning:"Non-blacklisting declaration present.", confidence:0.91, source_document:"Work_Orders_Scanned.pdf", source_page:"5" },
    { criterion_id:"c8", criterion:"Solvency Certificate", verdict:"needs_review", extracted_value:"Partially readable, appears Rs. 2.2 Crore", reasoning:"Solvency certificate scanned with moderate quality. Needs verification.", confidence:0.65, source_document:"CA_Certificate_Turnover.pdf", source_page:"2" },
  ]
};

export const TENDER: Tender = {
  id: "t1",
  title: "Construction of Border Outpost — CRPF Tender 2026-BOP-047",
  organization: "Central Reserve Police Force (CRPF)",
  tender_number: "CRPF/CE/2026/BOP-047",
  status: "parsed",
  created_at: "2026-04-15T10:30:00Z",
  criteria: CRITERIA,
  bidders: [BIDDER_A, BIDDER_B, BIDDER_C],
};

export const STATUTORY_CHECKS: StatutoryCheck[] = [
  { bidder_id:"b1", source:"GST Portal (gst.gov.in)", status:"verified", claimed_value:"GSTIN 29AABCI5678K1Z5 - Active", actual_value:"Active since 01.07.2017", discrepancy:false, verified_at:"2026-04-20T14:30:00Z" },
  { bidder_id:"b1", source:"MSME Udyam Portal", status:"verified", claimed_value:"Udyam-KA-01-0012345", actual_value:"Registered, Medium Enterprise", discrepancy:false, verified_at:"2026-04-20T14:31:00Z" },
  { bidder_id:"b1", source:"GeM Blacklist Check", status:"clear", claimed_value:"Not blacklisted", actual_value:"No records found", discrepancy:false, verified_at:"2026-04-20T14:32:00Z" },
  { bidder_id:"b1", source:"EPFO Compliance", status:"verified", claimed_value:"Compliant", actual_value:"Active, last filing: March 2026", discrepancy:false, verified_at:"2026-04-20T14:33:00Z" },
  { bidder_id:"b2", source:"GST Portal (gst.gov.in)", status:"verified", claimed_value:"GSTIN 29BBBQB1234M1Z8 - Active", actual_value:"Active since 15.01.2019", discrepancy:false, verified_at:"2026-04-20T14:35:00Z" },
  { bidder_id:"b2", source:"MSME Udyam Portal", status:"not_found", claimed_value:"Not claimed", actual_value:"No registration found", discrepancy:false, verified_at:"2026-04-20T14:36:00Z" },
  { bidder_id:"b2", source:"GeM Blacklist Check", status:"flagged", claimed_value:"Not blacklisted", actual_value:"Director Rajesh K. associated with blacklisted firm M/s FastTrack Infra (2023)", discrepancy:true, verified_at:"2026-04-20T14:37:00Z" },
  { bidder_id:"b2", source:"EPFO Compliance", status:"flagged", claimed_value:"Compliant", actual_value:"Last EPFO filing: Sept 2025 (6 months overdue)", discrepancy:true, verified_at:"2026-04-20T14:38:00Z" },
  { bidder_id:"b3", source:"GST Portal (gst.gov.in)", status:"verified", claimed_value:"GSTIN 29AAFBH9012N1ZQ - Active", actual_value:"Active since 01.07.2017", discrepancy:false, verified_at:"2026-04-20T14:40:00Z" },
  { bidder_id:"b3", source:"MSME Udyam Portal", status:"verified", claimed_value:"Udyam-KA-02-0098765", actual_value:"Registered, Small Enterprise", discrepancy:false, verified_at:"2026-04-20T14:41:00Z" },
  { bidder_id:"b3", source:"GeM Blacklist Check", status:"clear", claimed_value:"Not blacklisted", actual_value:"No records found", discrepancy:false, verified_at:"2026-04-20T14:42:00Z" },
  { bidder_id:"b3", source:"EPFO Compliance", status:"verified", claimed_value:"Compliant", actual_value:"Active, last filing: March 2026", discrepancy:false, verified_at:"2026-04-20T14:43:00Z" },
];

export const AUDIT_TRAIL: AuditEntry[] = [
  { id:"a1", officer:"Col. Vikram Singh (Eval Officer)", action:"Override Verdict", bidder_name:"Bharat Nirman Enterprises", criterion:"EMD Submission", old_verdict:"needs_review", new_verdict:"eligible", reason:"Verified original BG document in person. Amount confirmed as Rs. 10,00,000 from SBI.", timestamp:"2026-04-22T11:15:00Z" },
  { id:"a2", officer:"Col. Vikram Singh (Eval Officer)", action:"Override Verdict", bidder_name:"QuickBuild Contractors", criterion:"No Blacklisting Declaration", old_verdict:"needs_review", new_verdict:"not_eligible", reason:"Bidder failed to provide blacklisting declaration even after follow-up. Director linked to blacklisted firm confirmed via GeM records.", timestamp:"2026-04-22T11:30:00Z" },
  { id:"a3", officer:"Maj. Priya Sharma (Finance)", action:"Confirm Verdict", bidder_name:"Infra Build Solutions Pvt Ltd", criterion:"Annual Turnover", old_verdict:"eligible", new_verdict:"eligible", reason:"Cross-verified audited financials with CA certificate. Turnover figures confirmed.", timestamp:"2026-04-22T14:00:00Z" },
  { id:"a4", officer:"Maj. Priya Sharma (Finance)", action:"Flag for Review", bidder_name:"Bharat Nirman Enterprises", criterion:"Solvency Certificate", old_verdict:"needs_review", new_verdict:"needs_review", reason:"Requested clearer scan from bidder. Awaiting re-submission within 48 hours.", timestamp:"2026-04-22T14:20:00Z" },
  { id:"a5", officer:"Col. Vikram Singh (Eval Officer)", action:"Forensic Flag", bidder_name:"QuickBuild Contractors", criterion:"N/A", old_verdict:"N/A", new_verdict:"N/A", reason:"Flagged for forensic review — shared director with blacklisted entity and IP address overlap with Bharat Nirman Enterprises detected by TGNN module.", timestamp:"2026-04-23T09:00:00Z" },
];

export const NETWORK_GRAPH = {
  nodes: [
    { id:"n1", label:"Infra Build Solutions", type:"bidder", risk:"low" },
    { id:"n2", label:"QuickBuild Contractors", type:"bidder", risk:"high" },
    { id:"n3", label:"Bharat Nirman Enterprises", type:"bidder", risk:"medium" },
    { id:"n4", label:"Rajesh Kumar", type:"director", risk:"high" },
    { id:"n5", label:"FastTrack Infra (Blacklisted)", type:"company", risk:"high" },
    { id:"n6", label:"Suresh Patel", type:"director", risk:"low" },
    { id:"n7", label:"Meena Sharma", type:"director", risk:"low" },
    { id:"n8", label:"192.168.1.x subnet", type:"ip_cluster", risk:"medium" },
    { id:"n9", label:"Amit Verma", type:"director", risk:"medium" },
  ],
  edges: [
    { from:"n2", to:"n4", label:"Director" },
    { from:"n5", to:"n4", label:"Former Director" },
    { from:"n2", to:"n8", label:"Submission IP" },
    { from:"n3", to:"n8", label:"Submission IP" },
    { from:"n1", to:"n6", label:"Director" },
    { from:"n1", to:"n7", label:"Director" },
    { from:"n3", to:"n9", label:"Director" },
  ],
};
