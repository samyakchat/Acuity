import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import FatButton, { type FatButtonType } from "@/components/fatUI/fatButton";
import FatSheet from "@/components/fatUI/fatSheet";
import { FONT, useTheme } from "@/components/fatUI/theme";
import { Spacing } from "@/constants/theme";
import Block, { availableShapes, type Shape } from "./block";

type PatternAnswer = "same" | "different";

function createPattern(): Shape[] {
  return Array.from({ length: 4 }, (): Shape => {
    const randomIndex: number = Math.floor(Math.random() * availableShapes.length);
    return availableShapes[randomIndex];
  });
}

function createSecondPattern(firstPattern: Shape[], useSamePattern: boolean): Shape[] {
  if (useSamePattern) {
    return firstPattern;
  }

  const nextPattern: Shape[] = createPattern();
  const patternsMatch: boolean = nextPattern.every(
    (shape, index) => shape === firstPattern[index],
  );

  if (patternsMatch) {
    const randomIndex: number = Math.floor(Math.random() * nextPattern.length);
    const otherShapes: Shape[] = availableShapes.filter(
      (shape) => shape !== nextPattern[randomIndex],
    );
    const randomShapeIndex: number = Math.floor(Math.random() * otherShapes.length);
    nextPattern[randomIndex] = otherShapes[randomShapeIndex];
  }

  return nextPattern;
}

export default function PatternFactory() {
  const theme = useTheme();
  const [pattern, setPattern] = useState<Shape[]>(createPattern);
  const [secondPattern, setSecondPattern] = useState<Shape[]>([]);
  const [useSamePattern, setUseSamePattern] = useState<boolean>(false);
  const [numberCorrect, setNumberCorrect] = useState<number>(0);
  const [numberWrong, setNumberWrong] = useState<number>(0);
  const [timePerPattern, setTimePerPattern] = useState<number>(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState<number>(0);
  const [counter, setCounter] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const patternStartedAt = useRef<number | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [stage2, setStage2] = useState<boolean>(false);
  const [shouldContinue, setShouldContinue] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<PatternAnswer | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(0);
  const blockWidth = Math.max(0, (viewportWidth - Spacing.two * 3) / 4) * 1.5;

  useEffect(() => {
    if (gameOver || !shouldContinue || countdown === 0) return;

    const timeout: ReturnType<typeof setTimeout> = setTimeout(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [countdown, shouldContinue, gameOver]);

  useEffect(() => {
    if (gameOver || !shouldContinue || countdown !== 0) return;

    const timeout: ReturnType<typeof setTimeout> = setTimeout(() => {
      const shouldUseSamePattern: boolean = Math.random() < 0.5;
      setUseSamePattern(shouldUseSamePattern);
      setSecondPattern(createSecondPattern(pattern, shouldUseSamePattern));
      setTimePerPattern(0);
      patternStartedAt.current = Date.now();
      setStage2(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [countdown, shouldContinue, pattern, gameOver]);

  useEffect(() => {
    if (gameOver || !stage2 || selectedAnswer !== null) return;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      if (patternStartedAt.current === null) return;
      setTimePerPattern((Date.now() - patternStartedAt.current) / 1000);
    }, 100);

    return () => clearInterval(interval);
  }, [stage2, selectedAnswer, gameOver]);

  useEffect(() => {
    if (counter >= 11) {
      setGameOver(true);
    }
  }, [counter]);

  useEffect(() => {
    if (!gameOver) return;

    console.log("PatternFactory Stats", JSON.stringify({
      correct: numberCorrect,
      incorrect: numberWrong,
      timeTaken: totalTimeTaken,
    }));
  }, [gameOver, numberCorrect, numberWrong, totalTimeTaken]);

  function onContinueClicked(): void {
    setPattern(createPattern());
    setSecondPattern([]);
    setUseSamePattern(false);
    setTimePerPattern(0);
    patternStartedAt.current = null;
    setCountdown(5);
    setStage2(false);
    setSelectedAnswer(null);
    setOpen(false);
    setShouldContinue(true);
  }

  function onAnswerClicked(answer: PatternAnswer): void {
    if (patternStartedAt.current === null) return;

    const elapsedSeconds: number = (Date.now() - patternStartedAt.current) / 1000;
    patternStartedAt.current = null;
    setTotalTimeTaken((current) => current + elapsedSeconds);
    setCounter((current) => current + 1);

    const isCorrect: boolean = (answer === "same") === useSamePattern;
    if (isCorrect) {
      setNumberCorrect((current) => current + 1);
    } else {
      setNumberWrong((current) => current + 1);
    }

    setPattern(createPattern());
    setSecondPattern([]);
    setUseSamePattern(false);
    setTimePerPattern(0);
    setCountdown(5);
    setStage2(false);
    setSelectedAnswer(null);
  }

  if (gameOver) {
    return (
      <View
        style={[
          styles.container,
          styles.resultsContainer,
          { backgroundColor: theme.primary },
        ]}
      >
        <Text style={[styles.title, { color: theme.background }]}>
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

  if (!shouldContinue) {
    return (
      <View
        style={[
          styles.container,
          styles.instructionsContainer,
          { backgroundColor: theme.primary },
        ]}
      >
        <FatSheet
          visible={open}
          onDismiss={() => setOpen(false)}
          title="How to play"
          message="You will see a series of wood blocks making a pattern on the screen. You will have 5 seconds to memorize the pattern before going to the next screen, where you will see a new pattern. If the pattern is the same, press 'Same'. If it's different, press 'Different'."
          buttonText="Got it"
          buttonType="secondary"
        />

        <View style={styles.titleGroup}>
          <Text style={[styles.subtitle, { color: theme.background }]}>
            Welcome to your daily game
          </Text>
          <Text style={[styles.title, { color: theme.background }]}>
            Pattern Factory
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

  if (stage2) {
    let sameButtonType: FatButtonType = "secondary";
    let differentButtonType: FatButtonType = "secondary";

    if (selectedAnswer === "same") {
      sameButtonType = "primary";
    }
    if (selectedAnswer === "different") {
      differentButtonType = "primary";
    }

    return (
      <View style={[styles.container, { backgroundColor: theme.primary }]}>
        <Text style={[styles.subtitle, { color: theme.background }]}>
          Same or different?
        </Text>
        <View
          style={[styles.blockViewport, styles.blockColumn]}
          onLayout={({ nativeEvent }) => setViewportWidth(nativeEvent.layout.width)}
        >
          {secondPattern.map((shape, index) => (
            <Block
              key={index}
              width={blockWidth}
              shape={shape}
              accessibilityLabel={`Wood block ${index + 1}`}
            />
          ))}
        </View>
        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <FatButton
              text="Same"
              type={sameButtonType}
              size="small"
              onPress={() => onAnswerClicked("same")}
            />
          </View>
          <View style={styles.buttonContainer}>
            <FatButton
              text="Different"
              type={differentButtonType}
              size="small"
              onPress={() => onAnswerClicked("different")}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <Text style={[styles.title, { color: theme.background }]}>
        {countdown}
      </Text>
      <Text style={[styles.subtitle, { color: theme.background }]}>
        Your pattern...
      </Text>
      <View
        style={[styles.blockViewport, styles.blockColumn]}
        onLayout={({ nativeEvent }) => setViewportWidth(nativeEvent.layout.width)}
      >
        {pattern.map((shape, index) => (
          <Block
            key={index}
            width={blockWidth}
            shape={shape}
            accessibilityLabel={`Wood block ${index + 1}`}
          />
        ))}
      </View>
      <Text
        style={[
          styles.title,
          { color: theme.background, marginTop: Spacing.two },
        ]}
      >
        Memorize the pattern.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
    marginVertical: Spacing.three,
  },
  title: {
    fontFamily: FONT.title,
    fontSize: 40,
    lineHeight: 48,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    fontFamily: FONT.body,
    fontSize: 20,
    lineHeight: 28,
  },
  resultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: 0,
  },
  instructionsContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: 20,
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
  blockViewport: {
    width: "100%",
    marginTop: Spacing.four,
  },
  blockColumn: {
    flexDirection: "column",
    alignItems: "center",
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: "auto",
    paddingTop: Spacing.two,
  },
  buttonContainer: {
    flex: 1,
    height: 63,
    position: "relative",
    justifyContent: "flex-end",
  },
});
