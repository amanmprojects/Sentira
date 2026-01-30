import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AnalysisProgressProps {
  message?: string;
}

export function AnalysisProgress({ message = "Analyzing video..." }: AnalysisProgressProps) {
  const steps = [
    "Downloading video",
    "Transcribing content",
    "Analyzing claims",
    "Verifying with Google Search",
    "Checking facts",
  ];

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.message}>{message}</Text>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.step}>
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="#9ca3af"
            />
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.note}>
        This may take up to 2 minutes for longer videos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
    gap: 24,
  },
  message: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  stepsContainer: {
    width: "100%",
    gap: 12,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepText: {
    fontSize: 14,
    color: "#6b7280",
  },
  note: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
});
