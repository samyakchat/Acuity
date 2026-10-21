import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import FatButton, { type FatButtonType } from "@/components/fatUI/fatButton";
import FatSheet from "@/components/fatUI/fatSheet";
import { FONT, useTheme } from "@/components/fatUI/theme";
import { Spacing } from "@/constants/theme";
import Block, { availableShapes, type Shape } from "./block";
import { routerObj } from "@/app/(patient)/tests/engine";

type PatternAnswer = "same" | "different";

const TOTAL_ROUNDS = 7;
const PATTERN_LENGTH = 4;

// Animation timing
const BLOCK_STAGGER_MS = 90; 
const BLOCK_FADE_IN_MS = 400; 
const BLOCKS_ENTRANCE_MS = (PATTERN_LENGTH - 1) * BLOCK_STAGGER_MS + BLOCK_FADE_IN_MS;
const BLOCKS_FADE_OUT_MS = 280;
const ANSWER_EXIT_MS = 360; 

function createPattern(): Shape[] {
  return Array.from({ length: PATTERN_LENGTH }, (): Shape => {
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

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number; 
  scaleFrom?: number;
  style?: StyleProp<ViewStyle>;
};

function FadeIn({
  children,
  delay = 0,
  duration = 400,
  distance = 14,
  scaleFrom = 1,
  style,
}: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const scale = useRef(new Animated.Value(scaleFrom)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          speed: 12,
          bounciness: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 12,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]),
    ]);
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[style, { opacity, transform: [{ translateY }, { scale }] }]}
    >
      {children}
    </Animated.View>
  );
}

type PatternBlocksProps = {
  shapes: Shape[];
  width: number;
  hide: boolean;
  onLayoutWidth: (width: number) => void;
};

function PatternBlocks({ shapes, width, hide, onLayoutWidth }: PatternBlocksProps) {
  const groupOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(groupOpacity, {
      toValue: hide ? 0 : 1,
      duration: BLOCKS_FADE_OUT_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [hide, groupOpacity]);

  return (
    <Animated.View
      style={[styles.blockViewport, styles.blockColumn, { opacity: groupOpacity }]}
      onLayout={({ nativeEvent }) => onLayoutWidth(nativeEvent.layout.width)}
    >
      {width > 0 &&
        shapes.map((shape, index) => (
          <FadeIn
            key={index}
            delay={index * BLOCK_STAGGER_MS}
            duration={BLOCK_FADE_IN_MS}
            distance={18}
            scaleFrom={0.85}
          >
            <Block
              width={width}
              shape={shape}
              accessibilityLabel={`Wood block ${index + 1}`}
            />
          </FadeIn>
        ))}
    </Animated.View>
  );
}

/** Countdown digit that pops in on every change (give it key={value}). */
function CountdownNumber({ value, style }: { value: number; style: StyleProp<TextStyle> }) {
  const scale = useRef(new Animated.Value(1.35)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        speed: 14,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.Text style={[style, { opacity, transform: [{ scale }] }]}>
      {value}
    </Animated.Text>
  );
}

export default function PatternFactory({ onComplete }: { onComplete?: (result?: Record<string, unknown>) => void }) {
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
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [stage2, setStage2] = useState<boolean>(false);
  const [shouldContinue, setShouldContinue] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<PatternAnswer | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(0);
  const blockWidth = Math.max(0, (viewportWidth - Spacing.two * 3) / 4)*1.13;

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
      // The clock starts once the blocks have finished fading in.
      patternStartedAt.current = Date.now() + BLOCKS_ENTRANCE_MS;
      setStage2(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [countdown, shouldContinue, pattern, gameOver]);

  useEffect(() => {
    if (gameOver || !stage2 || selectedAnswer !== null) return;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      if (patternStartedAt.current === null) return;
      setTimePerPattern(Math.max(0, (Date.now() - patternStartedAt.current) / 1000));
    }, 100);

    return () => clearInterval(interval);
  }, [stage2, selectedAnswer, gameOver]);

  useEffect(() => {
    if (!gameOver) return;

    console.log("PatternFactory Stats", JSON.stringify({
      correct: numberCorrect,
      incorrect: numberWrong,
    }));

    onComplete?.({correct: numberCorrect,
      incorrect: numberWrong,})
  }, [gameOver, numberCorrect, numberWrong, totalTimeTaken]);

  useEffect(() => {
    return () => {
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    };
  }, []);

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

  function advanceRound(nextCounter: number): void {
    setCounter(nextCounter);

    if (nextCounter >= TOTAL_ROUNDS) {
      setGameOver(true);
      return;
    }

    setPattern(createPattern());
    setSecondPattern([]);
    setUseSamePattern(false);
    setTimePerPattern(0);
    setCountdown(5);
    setStage2(false);
    setSelectedAnswer(null);
  }

  function onAnswerClicked(answer: PatternAnswer): void {
    if (selectedAnswer !== null) return;

    const startedAt: number | null = patternStartedAt.current;
    if (startedAt === null || Date.now() < startedAt) return;

    const elapsedSeconds: number = (Date.now() - startedAt) / 1000;
    patternStartedAt.current = null;
    setTotalTimeTaken((current) => current + elapsedSeconds);

    const isCorrect: boolean = (answer === "same") === useSamePattern;
    if (isCorrect) {
      setNumberCorrect((current) => current + 1);
    } else {
      setNumberWrong((current) => current + 1);
    }

    setSelectedAnswer(answer);
    const nextCounter: number = counter + 1;
    advanceTimeout.current = setTimeout(() => advanceRound(nextCounter), ANSWER_EXIT_MS);
  }

  if (gameOver) {
    return (
      <View
        key="results"
        style={[
          styles.container,
          styles.resultsContainer,
          { backgroundColor: theme.primary },
        ]}
      >
        <FadeIn>
          <Text style={[styles.title, { color: theme.background }]}>
            Great Work!
          </Text>
        </FadeIn>
        <FadeIn delay={150}>
          <Text style={[styles.subtitle, { color: theme.background }]}>
            Let's move on to the next game!
          </Text>
        </FadeIn>
        <FadeIn delay={350} distance={24} scaleFrom={0.8} duration={500}>
          <Image
            source={require("@/assets/mochi_stale/mochi_celebrate.svg")}
            style={{
              width: 210,
              height: 300,
              alignSelf: "center",
              objectFit: "contain",
            }}
          />
        </FadeIn>
      </View>
    );
  }

  if (!shouldContinue) {
    return (
      <View
        key="intro"
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
          message="You will see a series of wood blocks making a pattern on the screen. You will have 5 seconds to memorize and choose if it's the same, or different."
          buttonText="Got it"
          buttonType="secondary"
        />

        <FadeIn style={styles.titleGroup}>
          <Text style={[styles.subtitle, { color: theme.background }]}>
            Welcome to your daily game
          </Text>
          <Text style={[styles.title, { color: theme.background }]}>
            Pattern Factory
          </Text>
        </FadeIn>
        <FadeIn delay={200} distance={20} scaleFrom={0.9} duration={500}>
          <Image
            source={require("@/assets/mochi_stale/mochi_blocks.svg")}
            style={{
              width: 210,
              height: 300,
              alignSelf: "center",
              objectFit: "contain",
            }}
          />
        </FadeIn>
        <FadeIn delay={0} style={styles.inlineButtonContainer}>
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
        </FadeIn>
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
      <View
        key={`stage2-${counter}`}
        style={[styles.container, { backgroundColor: theme.primary }]}
      >
        <FadeIn>
          <Text style={[styles.subtitle, { color: theme.background }]}>
            Same or different?
          </Text>
        </FadeIn>
        <PatternBlocks
          shapes={secondPattern}
          width={blockWidth}
          hide={selectedAnswer !== null}
          onLayoutWidth={setViewportWidth}
        />
        <FadeIn delay={BLOCKS_ENTRANCE_MS - 200} style={styles.buttonRow}>
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
        </FadeIn>
      </View>
    );
  }

  return (
    <View
      key={`countdown-${counter}`}
      style={[styles.container, { backgroundColor: theme.primary }]}
    >
      <CountdownNumber
        key={countdown}
        value={countdown}
        style={[styles.title, { color: theme.background }]}
      />
      <FadeIn>
        <Text style={[styles.subtitle, { color: theme.background }]}>
          Your pattern...
        </Text>
      </FadeIn>
      <PatternBlocks
        shapes={pattern}
        width={blockWidth}
        hide={countdown === 0}
        onLayoutWidth={setViewportWidth}
      />
      <FadeIn delay={BLOCKS_ENTRANCE_MS - 200}>
        <Text
          style={[
            styles.subtitle,
            { color: theme.background, marginTop: Spacing.two },
          ]}
        >
          Memorize the pattern.
        </Text>
      </FadeIn>
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