import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getHistory, clearCache } from "../services/api";
import type { CachedAnalysis } from "../types/analysis";
import { getRelativeTimeString } from "../utils/timeFormatter";

function generateId(url: string): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<CachedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      setHistory([]);
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  };

  const handleSelectAnalysis = (item: CachedAnalysis) => {
    const id = generateId(item.url);
    router.push({
      pathname: "/result/[id]",
      params: { id, url: item.url },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Analysis History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearCache} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No History</Text>
          <Text style={styles.emptyMessage}>
            Analyze some reels to see them here
          </Text>
          <TouchableOpacity
            style={styles.goHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.goHomeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.url}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => handleSelectAnalysis(item)}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.data.main_summary || "No summary available"}
                  </Text>
                  <Text style={styles.itemTime}>
                    {getRelativeTimeString(item.timestamp)}
                  </Text>
                </View>
                <View style={styles.truthScore}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#3b82f6" />
                  <Text style={styles.truthScoreText}>
                    {item.data.overall_truth_score !== undefined
                      ? Math.round(item.data.overall_truth_score * 100) + "%"
                      : "N/A"}
                  </Text>
                </View>
              </View>
              {item.data.fact_check_report?.claims_detected.length > 0 && (
                <View style={styles.itemMeta}>
                  <Ionicons name="list-outline" size={14} color="#6b7280" />
                  <Text style={styles.itemMetaText}>
                    {item.data.fact_check_report.claims_detected.length} claims checked
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  clearButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
  },
  emptyMessage: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  goHomeButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  goHomeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  historyItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  truthScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  truthScoreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e40af",
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemMetaText: {
    fontSize: 12,
    color: "#6b7280",
  },
});
