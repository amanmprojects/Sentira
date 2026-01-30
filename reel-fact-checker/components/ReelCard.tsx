import { View, Text, StyleSheet } from "react-native";
import type { EnhancedReelAnalysis } from "../types/analysis";

interface ReelCardProps {
  analysis: EnhancedReelAnalysis;
  url?: string;
}

export function ReelCard({ analysis, url }: ReelCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Summary</Text>
      <Text style={styles.summary}>{analysis.main_summary}</Text>

      {analysis.characters.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Characters</Text>
          {analysis.characters.map((char, index) => (
            <View key={index} style={styles.characterItem}>
              {char.notes && <Text style={styles.charText}>{char.notes}</Text>}
              {char.mood && <Text style={styles.charLabel}>Mood: {char.mood}</Text>}
              {char.tone && <Text style={styles.charLabel}>Tone: {char.tone}</Text>}
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Full Analysis</Text>
        <Text style={styles.commentary}>{analysis.commentary_summary}</Text>
      </View>

      {analysis.possible_issues.length > 0 && (
        <View style={[styles.section, styles.warningSection]}>
          <Text style={styles.warningHeader}>Potential Issues Detected</Text>
          {analysis.possible_issues.map((issue, index) => (
            <Text key={index} style={styles.warningText}>
              {"\u2022 " + issue}
            </Text>
          ))}
        </View>
      )}

      {analysis.transcript && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Transcript</Text>
          <Text style={styles.transcript}>{analysis.transcript}</Text>
        </View>
      )}

      {analysis.suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Suggestions</Text>
          {analysis.suggestions.map((suggestion, index) => (
            <Text key={index} style={styles.suggestionText}>
              {"\u2022 " + suggestion}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  summary: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 16,
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  characterItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  charText: {
    fontSize: 14,
    color: "#1f2937",
    marginBottom: 4,
  },
  charLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  commentary: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  warningSection: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
  },
  warningHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: "#991b1b",
    marginBottom: 4,
  },
  transcript: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
    fontStyle: "italic",
    fontFamily: "serif",
  },
  suggestionText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
});
