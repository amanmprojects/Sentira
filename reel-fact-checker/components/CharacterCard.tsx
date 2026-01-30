import { View, Text, StyleSheet } from "react-native";
import type { Character } from "../types/analysis";

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <View style={styles.container}>
      {character.notes && <Text style={styles.notes}>{character.notes}</Text>}
      <View style={styles.attributes}>
        {character.race && <Text style={styles.attribute}>Race: {character.race}</Text>}
        {character.tone && <Text style={styles.attribute}>Tone: {character.tone}</Text>}
        {character.facial_expression && (
          <Text style={styles.attribute}>Expression: {character.facial_expression}</Text>
        )}
        {character.mood && <Text style={styles.attribute}>Mood: {character.mood}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
  },
  attributes: {
    gap: 4,
  },
  attribute: {
    fontSize: 12,
    color: "#6b7280",
  },
});
