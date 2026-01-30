import { useState } from "react";
import type { EnhancedReelAnalysis } from "../types/analysis";
import { analyzeReel } from "../services/api";

export function useAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EnhancedReelAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const analyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentUrl(url);

    try {
      const data = await analyzeReel(url);
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setResult(null);
    setError(null);
    setCurrentUrl(null);
  };

  return {
    analyze,
    isLoading,
    result,
    error,
    currentUrl,
    reset,
  };
}
