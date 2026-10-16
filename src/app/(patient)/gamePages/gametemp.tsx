import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SeenIt from "@/components/games/SeenItGame/seenIt";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import FatHeader from "@/components/fatUI/fatHeader";
import { useTheme } from "@/components/fatUI/theme";
import { View } from "react-native";
import WordGarden from "@/components/games/WordGardenGame/wordGarden";
import { useLocalSearchParams } from "expo-router";

export const registry = {
  "seenIt-10987": SeenIt,
  "wordGarden-11987": WordGarden,
}

export default function GameLoader() {
  const theme = useTheme();
  const { gameID, primaryColor} = useLocalSearchParams();
  const RunningGame = registry[gameID as keyof typeof registry];
  return (
    <View style={[styles.container, {backgroundColor: primaryColor as string}]}>
      <SafeAreaView style={styles.safeArea}>
        <FatHeader backgroundColor={primaryColor as string}/>
        <View style={[styles.heroSection, {backgroundColor: primaryColor as string}]}> 
          <RunningGame />
        </View>
      </SafeAreaView>
    </View>
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
