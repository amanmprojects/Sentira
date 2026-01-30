export type VerificationStatus =
  | "verified_true"
  | "verified_false"
  | "mixed"
  | "uncertain"
  | "no_claims";

export interface GoogleSearchSource {
  url: string;
  title: string;
  snippet?: string;
}

export interface Claim {
  claim_text: string;
  claim_type: string;
  confidence: number;
  verification_status?: VerificationStatus;
  explanation?: string;
  sources: GoogleSearchSource[];
}

export interface FactCheckReport {
  claims_detected: Claim[];
  overall_truth_score: number;
  content_harmfulness: "low" | "medium" | "high";
  recommendations: string[];
  analysis_timestamp: string;
}

export interface Character {
  race?: string;
  tone?: string;
  facial_expression?: string;
  mood?: string;
  notes?: string;
}

export interface ReelAnalysis {
  main_summary: string;
  characters: Character[];
  commentary_summary: string;
  possible_issues: string[];
  transcript?: string;
  suggestions: string[];
}

export interface EnhancedReelAnalysis extends ReelAnalysis {
  fact_check_report?: FactCheckReport;
  overall_truth_score?: number;
}

export interface CachedAnalysis {
  data: EnhancedReelAnalysis;
  timestamp: number;
  url: string;
}
