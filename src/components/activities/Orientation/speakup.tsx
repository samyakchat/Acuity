import { Spacing } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { FONT, useTheme } from "@/components/fatUI/theme";
import FatButton from "@/components/fatUI/fatButton";
import { Mic, Square } from "lucide-react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const QUESTIONS = [
  "How was your day today?",
  "What did you have for breakfast this morning?",
  "Tell me about a place you enjoy visiting.",
  "What is your favorite season, and why?",
  "Tell me about something that made you smile recently.",
  "What do you like to do on a quiet afternoon?",
  "Tell me about your favorite meal.",
  "What is something you are looking forward to?",
];

// Speech recognizers often leave out "um" and "uh", so this is a lower bound.
const FILLERS = [
  "um",
  "umm",
  "uh",
  "uhh",
  "er",
  "erm",
  "ah",
  "hmm",
  "like",
  "you know",
  "i mean",
  "kind of",
  "sort of",
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countFillers(text: string): number {
  const clean = text.toLowerCase().replace(/[^a-z' ]/g, " ");
  let total = 0;
  for (const filler of FILLERS) {
    total += clean.match(new RegExp(`\\b${filler}\\b`, "g"))?.length ?? 0;
  }
  return total;
}

const round = (n: number) => Math.round(n * 10) / 10;

type Phase = "ready" | "listening" | "done";

export default function SpeakUp({ onComplete }: { onComplete?: (result?: Record<string, unknown>) => void }) {
  const theme = useTheme();
  const [question] = useState(
    () => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)],
  );
  const [phase, setPhase] = useState<Phase>("ready");
  const [message, setMessage] = useState("");

  const pressedAt = useRef(0);
  const firstWordAt = useRef<number | null>(null);
  const lastWordAt = useRef<number | null>(null);
  const finalText = useRef("");
  const interimText = useRef("");
  const finished = useRef(false);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (phase !== "listening") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? "";
    if (!transcript.trim()) return;

    const now = Date.now();
    if (firstWordAt.current === null) firstWordAt.current = now;
    lastWordAt.current = now;

    if (event.isFinal) {
      finalText.current += ` ${transcript}`;
      interimText.current = "";
    } else {
      interimText.current = transcript;
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    // "no-speech" just means nothing was said; "end" will still fire.
    if (event.error !== "no-speech" && event.error !== "aborted") {
      setMessage("Something went wrong. Please try again.");
    }
  });

  // "end" fires after Done is pressed, or if the recognizer stops by itself.
  useSpeechRecognitionEvent("end", () => finish());

  function finish() {
    if (finished.current || pressedAt.current === 0) return;
    finished.current = true;

    const transcript = `${finalText.current} ${interimText.current}`.trim();
    const words = countWords(transcript);
    const speakingTime =
      firstWordAt.current !== null && lastWordAt.current !== null
        ? (lastWordAt.current - firstWordAt.current) / 1000
        : 0;

    const result = {
      question,
      wordCount: words,
      fillerCount: countFillers(transcript),
      speakingTime: round(speakingTime),
      wordsPerMinute: speakingTime > 0 ? round(words / (speakingTime / 60)) : 0,
      timeToFirstWord:
        firstWordAt.current === null
          ? null
          : round((firstWordAt.current - pressedAt.current) / 1000),
      totalTime: round((Date.now() - pressedAt.current) / 1000),
    };

    console.log(JSON.stringify(result));
    setPhase("done");
    onComplete?.(result);
  }

  async function onStart() {
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setMessage("Please allow microphone and speech access to answer.");
      return;
    }

    setMessage("");
    finalText.current = "";
    interimText.current = "";
    firstWordAt.current = null;
    lastWordAt.current = null;
    finished.current = false;
    pressedAt.current = Date.now();

    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: true,
    });
    setPhase("listening");
  }

  function onStop() {
    ExpoSpeechRecognitionModule.stop();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{question}</Text>

        <Text style={[styles.subtitle, { color: theme.textSoft }]}>
          {phase === "ready" && "Tap the button and answer out loud."}
          {phase === "done" && "Thank you!"}
        </Text>

        {phase === "listening" && (
          <Animated.Text
            style={[styles.subtitle, { color: theme.primary, opacity: pulse }]}
          >
            Listening...
          </Animated.Text>
        )}

        {message !== "" && (
          <Text style={[styles.subtitle, { color: theme.error }]}>{message}</Text>
        )}
      </View>

      {phase !== "done" && (
        <View style={styles.footer}>
          <FatButton
            onPress={phase === "ready" ? onStart : onStop}
            text={phase === "ready" ? "TAP TO SPEAK" : "I'M DONE"}
            type="primary"
            size="small"
            icon={phase === "ready" ? Mic : Square}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.three,
  },
  title: {
    textAlign: "center",
    fontFamily: FONT.title,
    fontSize: 36,
    lineHeight: 44,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: FONT.body,
    fontSize: 20,
    lineHeight: 28,
  },
  footer: {
    paddingBottom: 32,
  },
});