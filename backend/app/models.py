"""Database models for tender evaluation."""

from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
import uuid

from app.database import Base


def gen_id():
    return str(uuid.uuid4())


class EvalVerdict(str, enum.Enum):
    ELIGIBLE = "eligible"
    NOT_ELIGIBLE = "not_eligible"
    NEEDS_REVIEW = "needs_review"
    PENDING = "pending"


class Tender(Base):
    __tablename__ = "tenders"

    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False)
    organization = Column(String)
    tender_number = Column(String)
    original_filename = Column(String)
    status = Column(String, default="uploaded")  # uploaded, parsing, parsed, error
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    criteria = relationship("Criterion", back_populates="tender", cascade="all, delete-orphan")
    bidders = relationship("Bidder", back_populates="tender", cascade="all, delete-orphan")


class Criterion(Base):
    __tablename__ = "criteria"

    id = Column(String, primary_key=True, default=gen_id)
    tender_id = Column(String, ForeignKey("tenders.id"), nullable=False)
    category = Column(String)  # eligibility, technical, financial
    name = Column(String, nullable=False)
    description = Column(Text)
    requirement_text = Column(Text)  # exact text from tender document
    data_type = Column(String)  # boolean, numeric, text, document
    threshold = Column(String)  # e.g., "> 5 crore", "must have", "ISO 9001"
    page_reference = Column(String)  # page number in original doc
    weight = Column(Float, default=1.0)

    tender = relationship("Tender", back_populates="criteria")
    results = relationship("EvaluationResult", back_populates="criterion", cascade="all, delete-orphan")


class Bidder(Base):
    __tablename__ = "bidders"

    id = Column(String, primary_key=True, default=gen_id)
    tender_id = Column(String, ForeignKey("tenders.id"), nullable=False)
    name = Column(String, nullable=False)
    overall_verdict = Column(Enum(EvalVerdict), default=EvalVerdict.PENDING)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tender = relationship("Tender", back_populates="bidders")
    documents = relationship("BidderDocument", back_populates="bidder", cascade="all, delete-orphan")
    results = relationship("EvaluationResult", back_populates="bidder", cascade="all, delete-orphan")


class BidderDocument(Base):
    __tablename__ = "bidder_documents"

    id = Column(String, primary_key=True, default=gen_id)
    bidder_id = Column(String, ForeignKey("bidders.id"), nullable=False)
    filename = Column(String, nullable=False)
    doc_type = Column(String)  # pan_card, gst_cert, balance_sheet, experience_cert, etc.
    extracted_text = Column(Text)
    ocr_used = Column(String)  # docling, paddleocr, surya, none
    confidence = Column(Float)

    bidder = relationship("Bidder", back_populates="documents")


class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(String, primary_key=True, default=gen_id)
    bidder_id = Column(String, ForeignKey("bidders.id"), nullable=False)
    criterion_id = Column(String, ForeignKey("criteria.id"), nullable=False)
    verdict = Column(Enum(EvalVerdict), default=EvalVerdict.PENDING)
    extracted_value = Column(Text)  # what was found in bidder docs
    reasoning = Column(Text)  # LLM explanation of why eligible/not
    confidence = Column(Float)
    source_document = Column(String)  # which bidder doc was used
    source_page = Column(String)
    evaluated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    bidder = relationship("Bidder", back_populates="results")
    criterion = relationship("Criterion", back_populates="results")
