import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { Pressable, StyleSheet, View } from "react-native";

export default function SeenIt() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Seen It
      </ThemedText>
      <ThemedView style={styles.progressTrack}>
        <ThemedView style={styles.progressFill}></ThemedView>
      </ThemedView>

      <ThemedView style={styles.gameArea}>
        <ThemedText type="subtitle" style={styles.word}>
          Placeholder
        </ThemedText>

        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <View pointerEvents="none" style={styles.buttonShadow} />
            <Pressable
              accessibilityRole="button"
              onPress={() => undefined}
              style={({ pressed }) => [
                styles.gameButton,
                pressed && styles.gameButtonPressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>Seen It</ThemedText>
            </Pressable>
          </View>

          <View style={styles.buttonContainer}>
            <View pointerEvents="none" style={styles.buttonShadow} />
            <Pressable
              accessibilityRole="button"
              onPress={() => undefined}
              style={({ pressed }) => [
                styles.gameButton,
                pressed && styles.gameButtonPressed,
              ]}
            >
              <ThemedText style={styles.buttonText}>New</ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    gap: Spacing.three,
    marginVertical: Spacing.three,
  },
  progressTrack: {
    height: 18,
    marginHorizontal: Spacing.four,
    overflow: "hidden",
    borderRadius: 9,
    backgroundColor: "#E5E5E5",
  },
  progressFill: {
    width: "45%",
    height: "100%",
    justifyContent: "flex-start",
    overflow: "hidden",
    borderRadius: 9,
    backgroundColor: "rgb(0, 166, 255)",
  },
  gameArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: Spacing.four,
    gap: Spacing.four,
    backgroundColor: "rgb(0, 166, 255)",
  },
  word: {
    color: "#FFFFFF",
    textAlign: "center",
    paddingTop: Spacing.five,
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.six,
  },
  buttonContainer: {
    flex: 1,
    height: 63,
    position: "relative",
  },
  buttonShadow: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: "75%",
    borderRadius: 16,
    backgroundColor: "rgb(0, 126, 194)",
  },
  gameButton: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.two,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  gameButtonPressed: {
    transform: [{ translateY: 5 }],
  },
  buttonText: {
    color: "rgb(0, 126, 194)",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  title: {
    textAlign: "center",
  },
});
