import { useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAnalysis } from "../../hooks/useAnalysis";
import { AnalysisProgress } from "../../components/AnalysisProgress";
import { ReelCard } from "../../components/ReelCard";
import { FactCheckBadge } from "../../components/FactCheckBadge";
import { ClaimItem } from "../../components/ClaimItem";
import type { EnhancedReelAnalysis } from "../../types/analysis";

export default function ResultScreen() {
  const { id, url: urlParam } = useLocalSearchParams<{ id: string; url?: string }>();
  const router = useRouter();
  const { analyze, isLoading, result, error, reset } = useAnalysis();

  // Start analysis when the screen loads
  useEffect(() => {
    if (urlParam && !result && !isLoading) {
      analyze(urlParam);
    }
  }, [urlParam, result, isLoading]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Analysis Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              reset();
              if (urlParam) analyze(urlParam);
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <AnalysisProgress message="Analyzing reel..." />;
  }

  if (!result) {
    return <AnalysisProgress message="Initializing..." />;
  }

  const harmfulnessColor = {
    low: "#22c55e",
    medium: "#f59e0b",
    high: "#ef4444",
  }[result.fact_check_report?.content_harmfulness || "low"];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.scoreIndicator}>
            <View
              style={[
                styles.scoreRing,
                { borderColor: harmfulnessColor },
              ]}
            >
              <Text style={[styles.scoreText, { color: harmfulnessColor }]}>
                {result.fact_check_report
                  ? Math.round(result.overall_truth_score! * 100)
                  : "N/A"}
                %
              </Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Analysis Complete</Text>
            {result.fact_check_report && (
              <View style={styles.truthScoreContainer}>
                <Text style={styles.harmfulnessLabel}>
                  Content Harmfulness:{" "}
                  <Text style={{ color: harmfulnessColor }}>
                    {result.fact_check_report.content_harmfulness.toUpperCase()}
                  </Text>
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <ReelCard analysis={result} url={urlParam} />

        {result.fact_check_report && result.fact_check_report.claims_detected.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fact-check" size={24} color="#3b82f6" />
              <Text style={styles.sectionTitle}>Fact-Checked Claims</Text>
            </View>

            <FactCheckBadge
              status={
                result.fact_check_report.claims_detected[0]?.verification_status
              }
              truthScore={result.overall_truth_score}
            />

            <View style={styles.claimsContainer}>
              {result.fact_check_report.claims_detected.map((claim, index) => (
                <ClaimItem key={index} claim={claim} />
              ))}
            </View>
          </View>
        )}

        {result.fact_check_report?.recommendations &&
          result.fact_check_report.recommendations.length > 0 && (
            <View style={[styles.section, styles.recommendationsSection]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={24} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Recommendations</Text>
              </View>
              {result.fact_check_report.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Ionicons name="arrow-forward" size={16} color="#6b7280" />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          )}

        <TouchableOpacity
          style={styles.backToHomeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="home" size={20} color="#ffffff" />
          <Text style={styles.backToHomeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  scoreIndicator: {
    alignItems: "center",
  },
  scoreRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#22c55e",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  truthScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  harmfulnessLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  claimsContainer: {
    gap: 12,
  },
  recommendationsSection: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  backToHomeButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  backToHomeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ef4444",
  },
  errorMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  backButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});
