import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SeenIt from "@/components/games/SeenItGame/seenIt";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import FatHeader from "@/components/fatUI/fatHeader";
import { useTheme } from "@/components/fatUI/theme";
import { View } from "react-native";
import WordGarden from "@/components/games/WordGardenGame/wordGarden";
import DigMeOut from "@/components/games/DigMeOut/digmeout";
import PatternFactory from "@/components/games/PatternFactory/patternFactory";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { aptitudeList, checkAp, getUser, recordResult, startSession, submitSession } from "../tests/engine";
import { useState, useEffect } from "react";
import Intro from "@/components/activities/DelayedRecall/delayed";
import { Ending } from "@/components/activities/DelayedRecall/delayed";
import { Welcome, GameSection, ThankYou } from "@/components/activities/static";
import SpeakUp from "@/components/activities/Orientation/speakup";
import TaskOrder from "@/components/activities/BasicFunc/taskord";
import { supabase } from "@/lib/supabase";

export const registry = {
  "seenIt-10987": SeenIt,
  "wordGarden-11987": WordGarden,
  "digMeOut-12546": DigMeOut,
  "patternFactory-13476": PatternFactory,
  "intro-1": Intro,
  "ending-1": Ending,
  'welcome': Welcome,
  'gamesection_m': GameSection,
  'thanks': ThankYou,
  "orient-1": SpeakUp,
  'basicfunc-1':TaskOrder

};

let usedList: any

export default function GameLoader() {
    useEffect(() => {
      const check = async () => {
        return await checkAp()
      }

      const depend = async () => {
        const user = await getUser()
        if (await finished===true) {
          const { data, error } = await supabase
            .from("daily_lists")
            .select("data")
            .eq("patient_id", user.id)
            .order("list_date", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            usedList = data.data.aptitudeList;
            if (gameID === usedList[0]) startSession();
          }
        } else {
          usedList = aptitudeList;
          if (gameID === usedList[0]) startSession();
        }
      }

      const finished = check();
      depend();
      
    }, []);
  const theme = useTheme();


  
  const color_registry: Record<string, string> = {
    "seenIt-10987": theme.primary,
    "wordGarden-11987": "#2db35d",
    "digMeOut-12546": "#EFBF04",
    "patternFactory-13476": theme.primary,
    "intro-1":theme.background,
    "ending-1":theme.background,
    "welcome":theme.background,
    "gamesection_m":theme.background,
    "thanks":theme.background,
    "orient-1":theme.background,
    'basicfunc-1':theme.background
  };

  const { gameID = usedList[0] } = useLocalSearchParams<{ gameID?: string }>();
  const [isComplete, setIsComplete] = useState(false);



  useEffect(() => {
    setIsComplete(false);
  }, [gameID]);



  const RunningGame = registry[gameID as keyof typeof registry];
  const primaryColor = color_registry[gameID] || theme.primary;

  const handleGameComplete = (result?: Record<string, unknown>) => {
    recordResult(gameID, result);
    setIsComplete(true);
  };

  const handleNextStep = async() => {
    const currentIndex = usedList.indexOf(gameID);
    const nextIndex = currentIndex + 1;

    if (nextIndex < usedList.length) {
      const nextGameID = usedList[nextIndex];
      router.setParams({ gameID: nextGameID });
    } else {
      await submitSession();
      router.replace("/(patient)/(tabs)")
    }
  };

  if (!RunningGame) return null;

  return (
    <View style={[styles.container, { backgroundColor: primaryColor }]}>
      <SafeAreaView style={styles.safeArea}>
        {isComplete ? (
          <FatHeader 
            backgroundColor={primaryColor} 
            rightButtonIcon={ChevronRight} 
            rightButtonText="Next" 
            rightButtonOnPress={handleNextStep}
            rightButtonType="primary"
          />
        ) : (
          <FatHeader backgroundColor={primaryColor} />
        )}
        <View style={[styles.heroSection, { backgroundColor: primaryColor }]}> 
          <RunningGame onComplete={handleGameComplete} />
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
});