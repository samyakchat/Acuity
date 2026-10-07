import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { WORDS } from "./word-list";

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
  const startedAt = useRef<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [gameStats, setGameStats] = useState<{
    timeTaken: number;
    correct: number;
    incorrect: number;
  } | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

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
  }

  function handleAnswer(clickedSeen: boolean) {
    if (buttonCounter >= 30 || gameStats) {
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

    setCurrentWord(chooseWord());
  }

  function onSeenClicked() {
    handleAnswer(true);
  }

  function onNewClicked() {
    handleAnswer(false);
  }

  if (!hasStarted) {
    return (
      <ThemedView style={[styles.container, styles.instructionsContainer]}>
        <ThemedText type="title" style={[styles.title, styles.resultsTitle]}>
          How to Play
        </ThemedText>

        <ThemedText style={styles.instructionsText}>
          You will see a series of words show up on the screen. For each word,
          select &quot;Seen It&quot; if the word has already been displayed in this
          round, and select &quot;New&quot; if the word has not yet.
        </ThemedText>

        <View style={styles.continueButtonContainer}>
          <View pointerEvents="none" style={styles.buttonShadow} />
          <Pressable
            accessibilityRole="button"
            onPress={onContinueClicked}
            style={({ pressed }) => [
              styles.gameButton,
              pressed && styles.gameButtonPressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>Continue</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  if (gameStats) {
    return (
      <ThemedView style={[styles.container, styles.resultsContainer]}>
        <ThemedText type="title" style={[styles.title, styles.resultsTitle]}>
          Game Complete!
        </ThemedText>

        <View style={styles.statsCard}>
          <ThemedText type="subtitle" style={styles.statsHeading}>
            Your Stats
          </ThemedText>
          <ThemedText style={styles.statText}>
            Time taken: {gameStats.timeTaken.toFixed(1)} seconds
          </ThemedText>
          <ThemedText style={styles.statText}>
            Correct: {gameStats.correct}
          </ThemedText>
          <ThemedText style={styles.statText}>
            Incorrect: {gameStats.incorrect}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const progressWidth = `${(answeredCount / 30) * 100}%` as `${number}%`;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Seen It
      </ThemedText>
      <ThemedView style={styles.progressTrack}>
        <ThemedView
          style={[styles.progressFill, { width: progressWidth }]}
        ></ThemedView>
      </ThemedView>

      <ThemedView style={styles.gameArea}>
        <ThemedText type="subtitle" style={styles.word}>
          {currentWord}
        </ThemedText>

        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <View pointerEvents="none" style={styles.buttonShadow} />
            <Pressable
              accessibilityRole="button"
              onPress={onSeenClicked}
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
              onPress={onNewClicked}
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
    width: "0%",
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
  resultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    backgroundColor: "rgb(0, 166, 255)",
  },
  instructionsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    backgroundColor: "rgb(0, 166, 255)",
  },
  instructionsText: {
    maxWidth: 560,
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
  },
  continueButtonContainer: {
    position: "relative",
    width: "100%",
    maxWidth: 280,
    height: 63,
    marginTop: Spacing.three,
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
  },
});
