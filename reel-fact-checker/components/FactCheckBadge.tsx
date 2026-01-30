import { View, Text, StyleSheet } from "react-native";
import type { VerificationStatus } from "../types/analysis";

interface FactCheckBadgeProps {
  status?: VerificationStatus;
  truthScore?: number;
}

const STATUS_CONFIG = {
  verified_true: {
    label: "Verified True",
    color: "#22c55e", // green
    bgColor: "#dcfce7",
  },
  verified_false: {
    label: "Verified False",
    color: "#ef4444", // red
    bgColor: "#fee2e2",
  },
  mixed: {
    label: "Mixed Evidence",
    color: "#f59e0b", // amber
    bgColor: "#fef3c7",
  },
  uncertain: {
    label: "Uncertain",
    color: "#6b7280", // gray
    bgColor: "#f3f4f6",
  },
  no_claims: {
    label: "No Claims Detected",
    color: "#3b82f6", // blue
    bgColor: "#dbeafe",
  },
};

export function FactCheckBadge({ status, truthScore }: FactCheckBadgeProps) {
  if (!status) return null;

  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <View style={[styles.indicator, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
      {truthScore !== undefined && (
        <Text style={styles.score}>Truth Score: {Math.round(truthScore * 100)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  score: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: "auto",
  },
});
