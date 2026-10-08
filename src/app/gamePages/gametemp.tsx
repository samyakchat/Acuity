import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SeenIt from "@/components/games/SeenItGame/seenIt";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import FatHeader from "@/components/fatUI/fatHeader";
import { useTheme } from "@/components/fatUI/theme";
export default function GameTemp() {
  const theme = useTheme();
  return (

    <ThemedView style={[styles.container, {backgroundColor: theme.primary}]}>
      <SafeAreaView style={styles.safeArea}>
        <FatHeader backgroundColor={theme.primary}/>

        <ThemedView style={[styles.heroSection, {backgroundColor: theme.primary}]}> 

          <SeenIt />
        </ThemedView>

       
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
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    alignSelf: "stretch",
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
