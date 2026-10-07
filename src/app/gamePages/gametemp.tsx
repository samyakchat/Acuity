import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SeenIt from "@/components/games/SeenItGame/seenIt";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";

export default function GameTemp() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="title" style={styles.title}>
            game section
          </ThemedText>

          <SeenIt />
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          game should take majority of screen and not look like a web preview or
          smth, but fit naturally:)
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    alignSelf: "stretch",
    gap: Spacing.four,
  },
  title: {
    textAlign: "center",
    paddingHorizontal: Spacing.four,
  },
  code: {
    textTransform: "uppercase",
    marginHorizontal: Spacing.four,
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
