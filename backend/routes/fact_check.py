"""
Fact-checking data models for verifying claims in video content.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime


class VerificationStatus(str, Enum):
    """Verification status of a claim."""
    VERIFIED_TRUE = "verified_true"
    VERIFIED_FALSE = "verified_false"
    MIXED = "mixed"
    UNCERTAIN = "uncertain"
    NO_CLAIMS = "no_claims"


class GoogleSearchSource(BaseModel):
    """A source returned by Google Search grounding."""
    url: str = Field(description="Source URL")
    title: str = Field(description="Source title")
    snippet: Optional[str] = Field(default=None, description="Relevant excerpt from source")


class Claim(BaseModel):
    """A factual claim extracted from content."""
    claim_text: str = Field(description="The claim statement as stated in the content")
    claim_type: str = Field(description="Type of claim: statistical, historical, health, political, scientific, etc.")
    confidence: float = Field(ge=0, le=1, description="AI confidence score (0-1) that this is a factual claim")
    verification_status: Optional[VerificationStatus] = Field(
        default=None,
        description="Verification result: verified_true, verified_false, mixed, uncertain"
    )
    explanation: Optional[str] = Field(default=None, description="Verification explanation with evidence from sources")
    sources: List[GoogleSearchSource] = Field(
        default_factory=list,
        description="List of sources supporting the verification conclusion"
    )


class FactCheckReport(BaseModel):
    """Complete fact-check report for video content."""
    claims_detected: List[Claim] = Field(
        default_factory=list,
        description="List of detected and verified claims"
    )
    overall_truth_score: float = Field(
        ge=0, le=1,
        default=1.0,
        description="Overall truthfulness score (0-1), where 1.0 means fully true"
    )
    content_harmfulness: str = Field(
        default="low",
        description="Potential harm level: low, medium, high"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommendations for viewers based on fact-check results"
    )
    analysis_timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Timestamp of the fact-check analysis"
    )
