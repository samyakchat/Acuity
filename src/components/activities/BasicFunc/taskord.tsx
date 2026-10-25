import { Spacing } from "@/constants/theme";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FONT, useTheme } from "@/components/fatUI/theme";
import FatButton from "@/components/fatUI/fatButton";

const TASKS = [
  {
    title: "You are leaving the house.",
    steps: ["Unlock the door", "Open the door", "Lock the door"],
  },
  {
    title: "You are making a cup of tea.",
    steps: ["Boil the water", "Pour it into a cup", "Drink the tea"],
  },
  {
    title: "You are washing your hands.",
    steps: ["Turn on the water", "Wash with soap", "Dry your hands"],
  },
  {
    title: "You are making a phone call.",
    steps: ["Pick up the phone", "Dial the number", "Say hello"],
  },
  {
    title: "You are getting milk.",
    steps: ["Open the fridge", "Take out the milk", "Close the fridge"],
  },
  {
    title: "You are brushing your teeth.",
    steps: ["Put toothpaste on the brush", "Brush your teeth", "Rinse your mouth"],
  },
  {
    title: "You are mailing a letter.",
    steps: ["Write the letter", "Put it in an envelope", "Put it in the mailbox"],
  },
  {
    title: "You are going to bed.",
    steps: ["Put on pajamas", "Get into bed", "Turn off the light"],
  },
];

const MAX_FAILED_ATTEMPTS = 3;

function shuffleDifferent(steps: string[]): string[] {
  const copy = [...steps];
  do {
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
  } while (copy.every((step, i) => step === steps[i]));
  return copy;
}

export default function TaskOrder({ onComplete }: { onComplete?: (result?: Record<string, unknown>) => void }) {
  const theme = useTheme();
  const startedAt = useRef(Date.now());

  const [task] = useState(() => TASKS[Math.floor(Math.random() * TASKS.length)]);
  const [options] = useState(() => shuffleDifferent(task.steps));
  const [selected, setSelected] = useState<string[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  function toggle(step: string) {
    if (done) return;
    setMessage("");
    if (selected.includes(step)) {
      setSelected(selected.filter((s) => s !== step));
    } else if (selected.length < task.steps.length) {
      setSelected([...selected, step]);
    }
  }

  function finish(solved: boolean, failed: number) {
    console.log(
      JSON.stringify({
        task: task.title,
        solved,
        failedAttempts: failed,
        timeTaken: Math.round((Date.now() - startedAt.current) / 100) / 10,
      }),
    );
    setDone(true);
    setMessage(solved ? "Great job!" : "Thank you!");
    onComplete?.({task: task.title,
        solved,
        failedAttempts: failed,
        timeTaken: Math.round((Date.now() - startedAt.current) / 100) / 10,});
  }

  function check() {
    if (done || selected.length !== task.steps.length) return;

    if (selected.every((step, i) => step === task.steps[i])) {
      finish(true, failedAttempts);
      return;
    }

    const failed = failedAttempts + 1;
    setFailedAttempts(failed);
    setSelected([]);

    if (failed >= MAX_FAILED_ATTEMPTS) {
      finish(false, failed);
    } else {
      setMessage("Not quite. Try again!");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{task.title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSoft }]}>
        Tap the steps in order: first, middle, last.
      </Text>

      <View style={styles.options}>
        {options.map((step) => {
          const position = selected.indexOf(step);
          return (
            <FatButton
              key={step}
              onPress={() => toggle(step)}
              text={position >= 0 ? `${position + 1}. ${step}` : step}
              type={position >= 0 ? "primary" : "secondary"}
              size="small"
            />
          );
        })}
      </View>

      <Text style={[styles.subtitle, { color: theme.textSoft }]}>{message}</Text>

      {!done && (
        <View style={styles.footer}>
          <FatButton
            onPress={check}
            text="CHECK"
            type={selected.length === task.steps.length ? "primary" : "secondary"}
            size="small"
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
  options: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.three,
  },
  footer: {
    paddingBottom: 32,
  },
});