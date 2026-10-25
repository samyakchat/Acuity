import { Spacing } from "@/constants/theme";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FONT, useTheme } from "@/components/fatUI/theme";
import FatButton from "@/components/fatUI/fatButton";
import { WORDS } from "@/components/games/SeenItGame/word-list";
const WORD_COUNT = 3;
const GRID_SIZE = 16;

let storedWords: string[] = [];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Intro({ onComplete }: { onComplete?: () => void }) {
  const theme = useTheme();

  const [words] = useState(() => {
    const picked = shuffle(WORDS).slice(0, WORD_COUNT);
    storedWords = picked;
    return picked;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Remember these words
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSoft }]}>
          We will ask you about them later.
        </Text>

        <View style={styles.wordList}>
          {words.map((word) => (
            <Text key={word} style={[styles.bigWord, { color: theme.primary }]}>
              {word}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <FatButton
          onPress={() => onComplete?.()}
          text="I REMEMBER THEM"
          type="primary"
          size="small"
        />
      </View>
    </View>
  );
}

function Ending({ onComplete }: { onComplete?: (result?: Record<string, unknown>) => void }) {
  const theme = useTheme();
  const startedAt = useRef(Date.now());
  const [selected, setSelected] = useState<string[]>([]);

  const [grid] = useState(() => {
    const others = shuffle(WORDS.filter((w) => !storedWords.includes(w))).slice(
      0,
      GRID_SIZE - storedWords.length,
    );
    return shuffle([...storedWords, ...others]);
  });

  function toggle(word: string) {
    if (selected.includes(word)) {
      setSelected(selected.filter((w) => w !== word));
    } else if (selected.length < WORD_COUNT) {
      setSelected([...selected, word]);
    }
  }

  function submit() {
    if (selected.length !== WORD_COUNT) return;

    const correct = selected.filter((w) => storedWords.includes(w)).length;
    const result = {
      correct,
      incorrect: WORD_COUNT - correct,
      timeTaken: (Date.now() - startedAt.current) / 1000,
    };

    console.log(JSON.stringify(result));
    onComplete?.(result);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Which words were they?
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSoft }]}>
        Pick the {WORD_COUNT} words from earlier.
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {grid.map((word) => (
          <View key={word} style={styles.cell}>
            <FatButton
              onPress={() => toggle(word)}
              text={word}
              type={selected.includes(word) ? "primary" : "secondary"}
              size="small"
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <FatButton
          onPress={submit}
          text={`DONE (${selected.length}/${WORD_COUNT})`}
          type={selected.length === WORD_COUNT ? "primary" : "secondary"}
          size="small"
        />
      </View>
    </View>
  );
}

export { Intro, Ending };
export { Intro as intro, Ending as ending };
export default Intro;

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
  wordList: {
    alignItems: "center",
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  bigWord: {
    fontFamily: FONT.title,
    fontSize: 44,
    lineHeight: 52,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  cell: {
    width: "47%",
  },
  footer: {
    paddingBottom: 32,
  },
});