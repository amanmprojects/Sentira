import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDeepLink } from "../hooks/useDeepLink";
import { extractInstagramUrl, isValidInstagramUrl } from "../utils/shareHandler";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function HomeScreen() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle share intents
  useDeepLink((receivedUrl) => {
    const instagramUrl = extractInstagramUrl(receivedUrl);
    if (instagramUrl) {
      setUrl(instagramUrl);
      startAnalysis(instagramUrl);
    }
  });

  const startAnalysis = (urlToAnalyze: string = url) => {
    if (!isValidInstagramUrl(urlToAnalyze)) {
      Alert.alert(
        "Invalid URL",
        "Please enter a valid Instagram reel URL"
      );
      return;
    }

    const id = generateId();
    router.push({
      pathname: "/result/[id]",
      params: { id, url: urlToAnalyze },
    });
  };

  const handlePaste = async () => {
    try {
      // For now, just show an alert - full clipboard access requires proper permissions
      Alert.alert(
        "Paste URL",
        "Past the Instagram reel URL in the input field above",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Could not access clipboard");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="search-circle" size={64} color="#3b82f6" />
        <Text style={styles.title}>Reel Fact Checker</Text>
        <Text style={styles.subtitle}>
          Check facts in Instagram reels with AI-powered analysis
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Paste Instagram reel URL here..."
          placeholderTextColor="#9ca3af"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
          <Ionicons name="clipboard-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.analyzeButton, !url && styles.disabledButton]}
        onPress={() => startAnalysis()}
        disabled={!url || isAnalyzing}
      >
        <Ionicons name="flash-outline" size={20} color="white" />
        <Text style={styles.analyzeButtonText}>Analyze Reel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => router.push("/history")}
      >
        <Ionicons name="time-outline" size={20} color="#6b7280" />
        <Text style={styles.historyButtonText}>View History</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
        <Text style={styles.infoCardText}>
          Share a reel from Instagram to this app, or paste the URL above to start fact-checking.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 24,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 12,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  pasteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  analyzeButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  historyButton: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4b5563",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  infoCardText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
});
