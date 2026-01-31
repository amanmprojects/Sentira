"""
Service for fact-checking video content using Google Gemini with Google Search grounding.
"""
from google.genai import types
from routes.fact_check import (
    Claim,
    FactCheckReport,
    GoogleSearchSource,
    VerificationStatus,
)
from config import model
import json
import re
from typing import Any, List, Optional


class FactChecker:
    """Service for fact-checking content using Gemini with Google Search."""

    # Create grounding tool for Google Search
    grounding_tool = types.Tool(google_search=types.GoogleSearch())

    def __init__(self, gemini_client):
        """Initialize with a Gemini client instance."""
        self.client = gemini_client
        self.current_model = model

    def fact_check_claims(
        self,
        transcript: str,
        analysis_summary: str
    ) -> FactCheckReport:
        """Fact-check claims in the content using Google Search.

        Args:
            transcript: The transcribed text from the video
            analysis_summary: The analysis summary of the video

        Returns:
            FactCheckReport with verified claims and overall truth score
        """
        if not transcript and not analysis_summary:
            return FactCheckReport(
                claims_detected=[],
                overall_truth_score=1.0,
                content_harmfulness="low",
                recommendations=["No content available for fact-checking"],
            )

        prompt = self._build_fact_check_prompt(transcript, analysis_summary)

        config = types.GenerateContentConfig(
            tools=[self.grounding_tool],
            response_mime_type="application/json",
        )

        try:
            import time
            start = time.time()
            response = self.client.models.generate_content(
                model=self.current_model,
                contents=prompt,
                config=config,
            )
            print(f"DEBUG: [TIME] fact_check_claims Gemini call took {time.time() - start:.2f}s")
            return self._parse_fact_check_response(response)
        except Exception as e:
            return self._create_fallback_report(transcript, analysis_summary, str(e))

    def _build_fact_check_prompt(self, transcript: str, analysis_summary: str) -> str:
        """Build the prompt for fact-checking."""
        prompt_parts = [
            "Analyze this video content and identify factual claims that should be verified.",
            "",
            "Video Summary:",
            analysis_summary or "Not available",
            "",
        ]

        if transcript:
            prompt_parts.extend([
                "Transcript:",
                transcript,
                "",
            ])

        prompt_parts.extend([
            "IMPORTANT: Use Google Search to verify each claim you identify. You MUST search for information",
            "about each claim and include sources from your search results.",
            "",
            "Classify claims into these types:",
            "- statistical: Numbers, percentages, data points",
            "- historical: Events, dates, historical facts",
            "- health: Medical claims, health advice, disease information",
            "- political: Political statements, government policies",
            "- scientific: Scientific facts, discoveries, theories",
            "- consumer: Product claims, business statements",
            "- other: Any other factual claims",
            "",
            "Determine verification status:",
            "- verified_true: The claim is supported by reliable sources",
            "- verified_false: The claim is contradicted by reliable sources",
            "- mixed: Sources have conflicting information",
            "- uncertain: Insufficient or unclear information to verify",
            "",
            "For EACH source you cite, include:",
            "- url: The full URL of the source",
            "- title: The title/headline of the source",
            "- snippet: A brief excerpt or snippet from the source",
            "",
            "Return your findings as a JSON object with this structure:",
            """
{
  "claims": [
    {
      "claim_text": "The exact claim statement",
      "claim_type": "one of: statistical, historical, health, political, scientific, consumer, other",
      "confidence": 0.0-1.0,
      "verification_status": "verified_true, verified_false, mixed, or uncertain",
      "explanation": "Brief explanation with evidence from sources - cite which sources support your conclusion",
      "sources": [
        {
          "url": "https://example.com/source",
          "title": "Source title",
          "snippet": "Relevant excerpt from the source"
        }
      ]
    }
  ],
  "overall_assessment": {
    "truth_score": 0.0-1.0,
    "harmfulness": "low, medium, or high",
    "recommendations": [
      "List of 3-5 recommendations for viewers"
    ]
  }
}
            """,
            "IMPORTANT: If you search, you MUST include the sources in your response with actual URLs.",
            "If no factual claims are detected, return: {\"claims\": [], \"overall_assessment\": {...}}",
        ])

        return "\n".join(prompt_parts)

    def _parse_fact_check_response(self, response: Any) -> FactCheckReport:
        """Parse Gemini response into structured fact-check report."""
        try:
            # Parse JSON from response text
            response_text = response.text.strip()
            # Remove markdown code blocks if present
            if response_text.startswith("```") and response_text.endswith("```"):
                response_text = response_text.strip("```").strip()
                # Remove language identifier if present
                if response_text.startswith("json"):
                    response_text = response_text[4:].strip()

            # First try to extract sources from grounding metadata
            grounding_sources = self._extract_grounding_sources(response)

            data = json.loads(response_text)

            # Extract claims
            claims_data = data.get("claims", [])
            claims = []

            for claim_data in claims_data:
                sources_data = claim_data.get("sources", [])

                # Use sources from JSON if available, otherwise use grounding sources
                if sources_data:
                    sources = [
                        GoogleSearchSource(
                            url=s.get("url", ""),
                            title=s.get("title", ""),
                            snippet=s.get("snippet"),
                        )
                        for s in sources_data
                    ]
                elif grounding_sources:
                    # Apply grounding sources to this claim
                    sources = grounding_sources[:3]  # Limit to 3 sources per claim
                    grounding_sources = grounding_sources[3:]  # Remove used sources
                else:
                    sources = []

                claim = Claim(
                    claim_text=claim_data.get("claim_text", ""),
                    claim_type=claim_data.get("claim_type", "other"),
                    confidence=claim_data.get("confidence", 0.5),
                    verification_status=claim_data.get("verification_status"),
                    explanation=claim_data.get("explanation"),
                    sources=sources,
                )
                claims.append(claim)

            # Extract overall assessment
            overall = data.get("overall_assessment", {})
            truth_score = overall.get("truth_score", 1.0)
            harmfulness = overall.get("harmfulness", "low")
            recommendations = overall.get("recommendations", [])

            return FactCheckReport(
                claims_detected=claims,
                overall_truth_score=truth_score,
                content_harmfulness=harmfulness,
                recommendations=recommendations,
            )

        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract claims using regex
            return self._parse_from_text(response.text)
        except Exception as e:
            return self._create_fallback_report("", "", f"Parsing error: {str(e)}")

    def _extract_grounding_sources(self, response: Any) -> List[GoogleSearchSource]:
        """Extract sources from Google Search grounding metadata."""
        sources = []

        try:
            # Access candidates and grounding metadata
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]

                # Check for grounding metadata
                if hasattr(candidate, 'grounding_metadata'):
                    grounding = candidate.grounding_metadata

                    # Extract sources from grounding_chunks (correct location per Google API docs)
                    if hasattr(grounding, 'grounding_chunks') and grounding.grounding_chunks:
                        for chunk in grounding.grounding_chunks:
                            # Grounding chunks can have 'web', 'retrieved_context', etc.
                            if hasattr(chunk, 'web') and chunk.web:
                                web = chunk.web
                                sources.append(
                                    GoogleSearchSource(
                                        url=getattr(web, 'uri', ''),
                                        title=getattr(web, 'title', 'Source'),
                                        snippet=getattr(web, 'snippet', '')
                                    )
                                )
        except Exception as e:
            print(f"Failed to extract grounding sources: {e}")

        return sources

    def _parse_from_text(self, text: str) -> FactCheckReport:
        """Fallback parsing from non-JSON response."""
        claims = []

        # Try to extract claim-verification pairs using regex
        claim_pattern = r'(?:claim|statement)[\s:]+["\']?(.+?)["\']?[.\n]+(?:verification|status|verdict)[\s:]+["\']?(.+?)["\']?[.\n]+(?:explanation|evidence)[\s:]+["\']?(.+?)["\']?[.\n]+(?:source|citation)[\s:]+["\']?(.+?)["\']?[.\n]'
        matches = re.findall(claim_pattern, text, re.IGNORECASE)

        for claim_text, verification, explanation, source_url in matches:
            try:
                verification_status = self._map_verification_status(verification)
                claims.append(
                    Claim(
                        claim_text=claim_text.strip(),
                        claim_type="other",
                        confidence=0.5,
                        verification_status=verification_status,
                        explanation=explanation.strip(),
                        sources=[GoogleSearchSource(url=source_url.strip(), title="Source", snippet="")],
                    )
                )
            except Exception:
                continue

        # Calculate truth score
        truth_score = self._calculate_truth_score(claims)

        return FactCheckReport(
            claims_detected=claims,
            overall_truth_score=truth_score,
            content_harmfulness="medium" if truth_score < 0.7 else "low",
            recommendations=["Could not fully parse search results - manual review recommended"],
        )

    def _map_verification_status(self, text: str) -> Optional[VerificationStatus]:
        """Map verification text to enum."""
        text_lower = text.lower()
        if "true" in text_lower or "correct" in text_lower or "accurate" in text_lower:
            return VerificationStatus.VERIFIED_TRUE
        elif "false" in text_lower or "incorrect" in text_lower or "inaccurate" in text_lower:
            return VerificationStatus.VERIFIED_FALSE
        elif "mixed" in text_lower or "conflicting" in text_lower:
            return VerificationStatus.MIXED
        elif "uncertain" in text_lower or "unclear" in text_lower:
            return VerificationStatus.UNCERTAIN
        return None

    def _calculate_truth_score(self, claims: List[Claim]) -> float:
        """Calculate overall truth score from claims."""
        if not claims:
            return 1.0

        total_weight = 0
        weighted_sum = 0

        for claim in claims:
            # Weight by claim confidence
            weight = claim.confidence
            total_weight += weight

            # Score claim based on verification status
            if claim.verification_status == VerificationStatus.VERIFIED_TRUE:
                score = 1.0
            elif claim.verification_status == VerificationStatus.VERIFIED_FALSE:
                score = 0.0
            elif claim.verification_status == VerificationStatus.MIXED:
                score = 0.5
            else:  # UNCERTAIN or None
                score = 0.7  # Neutral score for uncertain

            weighted_sum += weight * score

        if total_weight == 0:
            return 1.0

        return round(weighted_sum / total_weight, 2)

    def _create_fallback_report(
        self,
        transcript: str,
        analysis_summary: str,
        error: str
    ) -> FactCheckReport:
        """Create a fallback report when fact-checking fails."""
        if not transcript and not analysis_summary:
            return FactCheckReport(
                claims_detected=[],
                overall_truth_score=1.0,
                content_harmfulness="low",
                recommendations=["No content available for fact-checking"],
            )

        # Use simple heuristics based on content
        harmful_keywords = ["dangerous", "harmful", "toxic", "warning", "alert"]
        is_potentially_harmful = any(
            kw in (transcript + analysis_summary).lower()
            for kw in harmful_keywords
        )

        return FactCheckReport(
            claims_detected=[],
            overall_truth_score=0.8,  # Conservative score
            content_harmfulness="high" if is_potentially_harmful else "low",
            recommendations=[
                f"Full fact-checking unavailable ({error})",
                "Review content manually for accuracy",
                "Verify claims with reputable sources",
            ],
        )
