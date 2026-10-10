import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useRef, useState } from "react";
import { StyleSheet, View, Animated } from "react-native";
import { FONT } from "@/components/fatUI/theme";
import { useTheme } from "@/components/fatUI/theme";
import { WORDS } from "./word-list";
import FatButton from "@/components/fatUI/fatButton";
import { Eye, BadgePlus } from "lucide-react-native";
import { Image } from "expo-image";
import { Text } from "react-native";
import FatSheet from "@/components/fatUI/fatSheet";
import { getDefinition } from "@/components/games/SeenItGame/word-list";

const chosen: string[] = [];
let buttonCounter: number = 0;
let seen: boolean = false;
let correct: number = 0;
let previousWord: string | null = null;

export function newWord(): string {
  const unchosenWords = WORDS.filter((word) => !chosen.includes(word));

  if (unchosenWords.length === 0) {
    return seenWord();
  }

  const randomIndex = Math.floor(Math.random() * unchosenWords.length);
  return unchosenWords[randomIndex];
}

export function seenWord(): string {
  if (chosen.length === 0) {
    return "";
  }

  const repeatableWords = chosen.filter((word) => word !== previousWord);
  const candidates = repeatableWords.length > 0 ? repeatableWords : chosen;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

export function chooseWord(): string {
  if (chosen.length === 0) {
    const word = newWord();
    chosen.push(word);
    seen = false;
    previousWord = word;
    return word;
  }

  const shouldChooseNewWord = chosen.length === 1 || Math.random() < 0.5;

  if (shouldChooseNewWord) {
    const word = newWord();
    const wasAlreadyChosen = chosen.includes(word);

    if (!wasAlreadyChosen) {
      chosen.push(word);
    }

    seen = wasAlreadyChosen;
    previousWord = word;
    return word;
  }

  seen = true;
  const word = seenWord();
  previousWord = word;
  return word;
}

export default function SeenIt() {
  const [open, setOpen] = useState(false);
  const [defOpen, setDefOpen] = useState(false);
  const theme = useTheme();
  const startedAt = useRef<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [gameStats, setGameStats] = useState<{
    timeTaken: number;
    correct: number;
    incorrect: number;
  } | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isAnimating = useRef(false);

  function animateToNextWord(nextWordCallback: () => void) {
    isAnimating.current = true;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      nextWordCallback();
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    });
  }

  function onContinueClicked() {
    chosen.length = 0;
    buttonCounter = 0;
    seen = false;
    correct = 0;
    previousWord = null;
    setAnsweredCount(0);
    setGameStats(null);
    startedAt.current = Date.now();
    setCurrentWord(chooseWord());
    setHasStarted(true);

    slideAnim.setValue(0);
    opacityAnim.setValue(1);
    scaleAnim.setValue(1);
    isAnimating.current = false;
  }

  function handleAnswer(clickedSeen: boolean) {
    if (buttonCounter >= 30 || gameStats || isAnimating.current) {
      return;
    }

    if (clickedSeen === seen) {
      correct += 1;
    }

    buttonCounter += 1;
    setAnsweredCount(buttonCounter);

    if (buttonCounter === 30) {
      const startTime = startedAt.current;

      setGameStats({
        timeTaken: startTime === null ? 0 : (Date.now() - startTime) / 1000,
        correct,
        incorrect: buttonCounter - correct,
      });
      return;
    }

    animateToNextWord(() => {
      setCurrentWord(chooseWord());
    });
  }

  function onSeenClicked() {
    handleAnswer(true);
  }

  function onNewClicked() {
    handleAnswer(false);
  }

  function onDefClicked() {
    setDefOpen(true);
  }

  if (!hasStarted) {
    return (
      <View
        style={[
          styles.container,
          styles.instructionsContainer,
          {
            backgroundColor: theme.primary,
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 20,
          },
        ]}
      >
        <FatSheet
          visible={open}
          onDismiss={() => setOpen(false)}
          title="How to play"
          message="You will see a word on the screen. Your decide if you have seen this word before in the game or if it's new. If you have seen it, press 'Seen It'. If it's new, press 'New'."
          buttonText="Got it"
          buttonType="secondary"
        />

        <View style={styles.titleGroup}>
          <Text style={[styles.subtitle, { color: theme.background }]}>
            Welcome to your daily game
          </Text>
          <Text style={[styles.title, { color: theme.background }]}>
            Have I Seen It?
          </Text>
        </View>
        <Image
          source={require("@/assets/mochi_stale/mochi_think.svg")}
          style={{
            width: 210,
            height: 300,
            alignSelf: "center",
            objectFit: "contain",
          }}
        />
        <View style={styles.inlineButtonContainer}>
          <FatButton
            onPress={() => setOpen(true)}
            text="HOW TO PLAY?"
            type="secondary"
            size="small"
          />
          <FatButton
            onPress={onContinueClicked}
            text="START GAME"
            type="secondary"
            size="small"
          />
        </View>
      </View>
    );
  }

  if (gameStats) {
    console.log("Game stats:", gameStats);
    return (
      <View
        style={[
          styles.container,
          styles.resultsContainer,
          { backgroundColor: theme.primary },
        ]}
      >
        <Text
          style={[
            styles.title,
            styles.resultsTitle,
            { color: theme.background },
          ]}
        >
          Great Work!
        </Text>
        <Text style={[styles.subtitle, { color: theme.background }]}>
          Let's move on to the next game!
        </Text>
        <Image
          source={require("@/assets/mochi_stale/mochi_celebrate.svg")}
          style={{
            width: 210,
            height: 300,
            alignSelf: "center",
            objectFit: "contain",
          }}
        />
      </View>
    );
  }

  const progressWidth = `${(answeredCount / 30) * 100}%` as `${number}%`;

  return (
    <View style={styles.container}>
      <FatSheet
        visible={defOpen}
        onDismiss={() => setDefOpen(false)}
        title={currentWord}
        message={getDefinition(currentWord)}
        buttonText="Thanks!"
        buttonType="secondary"
      />

      <View style={[styles.gameArea, { backgroundColor: theme.primary }]}>
        <Text style={[styles.subtitle, { color: theme.background }]}>
          Your word is...
        </Text>

        <Animated.View
          style={{
            width: "100%",
            alignItems: "center",
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }}
        >
          <FatButton
            text={currentWord}
            type="primary"
            size="large"
            style={{ width: "80%" }}
            onPress={() => onDefClicked()}
          />
        </Animated.View>
      </View>
      <View style={{ width: "100%", gap: 32, paddingBottom: 32 }}>
        <View>
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <FatButton
                onPress={onSeenClicked}
                text="Seen It"
                type="secondary"
                size="small"
                icon={Eye}
              />
            </View>

            <View style={styles.buttonContainer}>
              <FatButton
                onPress={onNewClicked}
                text="New"
                type="secondary"
                size="small"
                icon={BadgePlus}
              />
            </View>
          </View>
        </View>
        <View
          style={[styles.progressTrack, { backgroundColor: theme.primaryEdge }]}
        >
          <View
            style={[
              styles.progressFill,
              { width: progressWidth, backgroundColor: theme.background },
            ]}
          ></View>
        </View>
      </View>
    </View>
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
    width: "0%",
    height: "100%",
    justifyContent: "flex-start",
    overflow: "hidden",
    borderRadius: 9,
  },
  gameArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: Spacing.four,
    gap: Spacing.four,
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
    justifyContent: "flex-end",
  },
  resultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  instructionsContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  statsCard: {
    width: "100%",
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "rgb(0, 126, 194)",
    backgroundColor: "rgb(0, 166, 255)",
  },
  resultsTitle: {
    color: "#FFFFFF",
  },
  statsHeading: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  statText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
  },
  title: {
    textAlign: "center",
    fontFamily: FONT.title,
    fontSize: 40,
    lineHeight: 48,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: FONT.body,
    fontSize: 20,
    lineHeight: 28,
  },
  titleGroup: {
    flexDirection: "column",
    justifyContent: "center",
  },
  inlineButtonContainer: {
    flexDirection: "column",
    width: "80%",
    gap: 16,
  },
});
