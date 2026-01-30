import AsyncStorage from "@react-native-async-storage/async-storage";
import { CONFIG } from "../constants/config";
import type { EnhancedReelAnalysis, CachedAnalysis } from "../types/analysis";

const API_BASE = CONFIG.API_BASE_URL;

async function getCachedAnalysis(url: string): Promise<EnhancedReelAnalysis | null> {
  try {
    const cacheKey = `analysis_${url}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (!cached) return null;

    const data = JSON.parse(cached) as CachedAnalysis;
    const now = Date.now();
    const expiry = CONFIG.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (now - data.timestamp > expiry) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}

async function cacheAnalysis(url: string, data: EnhancedReelAnalysis): Promise<void> {
  try {
    const cacheKey = `analysis_${url}`;
    const cached: CachedAnalysis = {
      data,
      timestamp: Date.now(),
      url,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cached));
  } catch (error) {
    console.error("Error writing cache:", error);
  }
}

async function getCachedHistory(): Promise<CachedAnalysis[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const analysisKeys = allKeys.filter((key) => key.startsWith("analysis_"));

    const analyses: CachedAnalysis[] = [];
    for (const key of analysisKeys) {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        analyses.push(JSON.parse(cached));
      }
    }

    // Sort by timestamp, newest first
    return analyses.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error reading history:", error);
    return [];
  }
}

export async function analyzeReel(url: string): Promise<EnhancedReelAnalysis> {
  // Check cache first
  const cached = await getCachedAnalysis(url);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${API_BASE}/analyze-video/reel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ post_url: url }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Cache the result
  await cacheAnalysis(url, data);

  return data;
}

export async function getHistory(): Promise<CachedAnalysis[]> {
  return getCachedHistory();
}

export async function clearCache(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const analysisKeys = allKeys.filter((key) => key.startsWith("analysis_"));

    for (const key of analysisKeys) {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}
