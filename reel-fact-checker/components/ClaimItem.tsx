import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import type { Claim, VerificationStatus } from "../types/analysis";
import { FactCheckBadge } from "./FactCheckBadge";

interface ClaimItemProps {
  claim: Claim;
}

const VERIFICATION_ORDER: VerificationStatus[] = [
  "verified_true",
  "verified_false",
  "mixed",
  "uncertain",
  "no_claims",
];

export function ClaimItem({ claim }: ClaimItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.header}>
        <View style={styles.headerContent}>
          <FactCheckBadge status={claim.verification_status} />
          <Text style={styles.claimType}>{claim.claim_type}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </TouchableOpacity>

      <Text style={styles.claimText}>{claim.claim_text}</Text>

      {expanded && (
        <View style={styles.expandedContent}>
          {claim.explanation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Explanation</Text>
              <Text style={styles.sectionText}>{claim.explanation}</Text>
            </View>
          )}

          {claim.sources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sources</Text>
              {claim.sources.map((source, index) => (
                <View key={index} style={styles.source}>
                  <Ionicons name="link-outline" size={14} color="#3b82f6" />
                  <Text style={styles.sourceTitle}>{source.title}</Text>
                </View>
              ))}
            </View>
          )}
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  claimType: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  claimText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 22,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  source: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  sourceTitle: {
    fontSize: 13,
    color: "#3b82f6",
    flex: 1,
  },
});
