import { Spacing } from "@/constants/theme";
import { useEffect, useRef, useState, memo } from "react";
import {
  StyleSheet,
  View,
  Animated,
  Text,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { FONT, useTheme } from "@/components/fatUI/theme";
import FatButton from "@/components/fatUI/fatButton";
import FatSheet from "@/components/fatUI/fatSheet";
import { Sprout } from "lucide-react-native";
import { Image } from "expo-image";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { CATEGORIES, findWord, type Category } from "./word-list";
import { duration_sec, duration_ms, countd_max, stablems, 
    pausems, burstgap_ms, bins, force_category, DEBUG_TEXT_INPUT, fillers } from "./settings";
import { Signpost, TreePine } from "lucide-react-native";
import { routerObj } from "@/app/(patient)/tests/engine";
const theme = {
  primary: "#2db35d",
  primaryEdge: "#1f8a46",
  background: "#FFFFFF",
  sky: "#E8F8EE",
};
const dirtTheme = {
  primary: "#8B5A2B", 
  primaryEdge: "#6F451F",

};


type Phase = "intro" | "countdown" | "playing" | "results" | "garden";
type Status = "valid" | "invalid" | "repeat";
type WordEvent = {
  raw: string;
  word: string | null;
  status: Status;
  cluster: string | null;
  tMs: number; //total
  gapMs: number;
  confidence: number | null;
};
type GardenTreeData = { word: string; day: string; id: number };
type GardenUIProps = {
  planted: GardenTreeData[];
  onPlantPress: (plant: string) => void;
};

let lastSession: { valid: number; invalid: number; category: string } | null = null;
let sessionsPlayed = 0;
const gardenTrees: GardenTreeData[] = [];

const today = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

function pickCategory(): Category {
  const forced = CATEGORIES.find((c) => c.id === force_category);
  if (forced) return forced;
  const dayNumber = Math.floor(Date.now() / 86400000);
  return CATEGORIES[dayNumber % CATEGORIES.length];
}

const round = (n: number | null) => (n === null ? null : Math.round(n));
const round2 = (n: number | null) => (n === null ? null : Math.round(n * 100) / 100);
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
function median(a: number[]) {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function analyse(events: WordEvent[]) {
  const valid = events.filter((e) => e.status === "valid");
  const invalid = events.filter((e) => e.status === "invalid");
  const repeats = events.filter((e) => e.status === "repeat");

  //pauses
  const betweenGaps = events.slice(1).map((e) => e.gapMs);
  const lastEvent = events[events.length - 1];
  const trailingSilenceMs = duration_ms - (lastEvent ? lastEvent.tMs : 0);
  const allPauses = [...betweenGaps, trailingSilenceMs];

  //valid words per time slice (fluency usually drops off over the round)
  const binMs = duration_ms / bins;
  const validPerBin: number[] = Array(bins).fill(0);
  valid.forEach((e) => (validPerBin[Math.min(bins - 1, Math.floor(e.tMs / binMs))] += 1));

  //semantic clusters->runs of consecutive valid words from the same subgrup
  const clusterRuns: number[] = [];
  let prevCluster: string | null = null;
  valid.forEach((e) => {
    if (clusterRuns.length && e.cluster === prevCluster) clusterRuns[clusterRuns.length - 1] += 1;
    else clusterRuns.push(1);
    prevCluster = e.cluster;
  });

  //speech bursts->runs of words with short gaps between them
  const bursts: number[] = [];
  events.forEach((e, i) => {
    if (i === 0 || e.gapMs > burstgap_ms) bursts.push(1);
    else bursts[bursts.length - 1] += 1;
  });

  return {
    totalSpoken: events.length,
    validCount: valid.length,
    invalidCount: invalid.length,
    repeatCount: repeats.length,
    invalidRate: events.length ? round2(invalid.length / events.length) : null,
    // invalidWords: invalid.map((e) => e.raw),
    // repeatWords: repeats.map((e) => e.raw),

    timeToFirstWordMs: round(events.length ? events[0].tMs : null),
    timeToFirstValidMs: round(valid.length ? valid[0].tMs : null),

    meanGapMs: round(mean(betweenGaps)),
    medianGapMs: round(median(betweenGaps)),
    longestPauseMs: round(allPauses.length ? Math.max(...allPauses) : null),
    trailingSilenceMs: round(trailingSilenceMs),
    pauseCountOverThreshold: allPauses.filter((g) => g > pausems).length,
    pauseThresholdMs: pausems,

    // validPerBin,
    firstHalfValid: validPerBin.slice(0, bins / 2).reduce((a, b) => a + b, 0),
    secondHalfValid: validPerBin.slice(bins / 2).reduce((a, b) => a + b, 0),
    validWordsPerSec: round2(valid.length / duration_sec),
    meanWordLength: round2(mean(valid.map((e) => (e.word ?? "").length))),

    // semanticClusterSizes: clusterRuns,
    semanticClusterCount: clusterRuns.filter((n) => n >= 2).length, //clusters of 2or more words
    semanticSwitches: Math.max(0, clusterRuns.length - 1),
    meanSemanticClusterSize: round2(mean(clusterRuns)),
    // subgroupsUsed: Array.from(new Set(valid.map((e) => e.cluster))),

    // burstSizes: bursts,
    // burstCount: bursts.length,
    // meanBurstSize: round2(mean(bursts)),
  };
}

const plantslist = {
  orchard: require("@/assets/wordgarden/plant-orchard.svg"),
  tomato: require("@/assets/wordgarden/plant-tomato.svg"),
  yellow: require("@/assets/wordgarden/plant-yellow.svg"),
  carrot: require("@/assets/wordgarden/plant-carrot.svg")
};

const RisingPlant = ({ source }: { source: any }) => {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(rise, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", width: "110%", height: "110%", left: 0, top: 0, zIndex: 1,
        opacity: rise.interpolate({
          inputRange: [0, 0.4],
          outputRange: [0, 1],
          extrapolate: "clamp",
        }),
        transform: [
          {
            translateY: rise.interpolate({
              inputRange: [0, 1],
              outputRange: [12, -20],
            }),
          },
        ],
      }}
    >
      <Image source={source} contentFit="contain" style={{ width: "100%", height: "100%" }} />
    </Animated.View>
  );
};

const GardenUI = memo(({ planted, onPlantPress }: GardenUIProps) => {
  return (
    <View
      style={{flexDirection: "row", flexWrap: "wrap", columnGap: 10, rowGap: 10, justifyContent: "center", alignContent: "flex-start",
        minHeight: 312,
        marginBottom: 30,
      }}
    >
      {Array.from({ length: 20 }, (_, index) => {
        const isPlanted = planted.some((tree) => tree.id === index);
        let plant;
        let planttogive: string
        if ((index + 1) % 7 === 0) {
          plant = plantslist.yellow;
          planttogive = "yellow"
        } else if ((index + 1) % 4 === 0) {
          plant = plantslist.tomato;
          planttogive = "tomato"
        } else if ((index + 1) % 3 === 0) {
          plant = plantslist.orchard;
          planttogive = "orchard"
        } else {
          plant = plantslist.carrot;
          planttogive = "carrot"
        }
        return (
          <View key={index} style={{ width: "16%", aspectRatio: 1, position: "relative"}}>
            <FatButton
              type={isPlanted ? "primary" : "secondary"}
              onPress={() => {
                onPlantPress(isPlanted ? planttogive : "grass")
              }}
              edgeColor={isPlanted ? dirtTheme.primaryEdge : theme.primaryEdge}
              color={isPlanted ? dirtTheme.primary : theme.primary}
              style={{ width: "100%" }}
            />

            {isPlanted && <RisingPlant source={plant} />}
          </View>
        );
      })}
    </View>
  );
});


export default function WordGarden({ onComplete }: { onComplete?: (result?: Record<string, unknown>) => void }){
  const [phase, setPhase] = useState<Phase>("intro");
  const [howOpen, setHowOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(countd_max);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [planted, setPlanted] = useState<GardenTreeData[]>([]);
  const [typed, setTyped] = useState("");
  const [openplant, setOpenPlant] = useState(false)
  const ovtheme = useTheme()
  const popAnim = useRef(new Animated.Value(1)).current;
  const [currentPlant, setCurrentPlant] = useState<string | null>(null);
  const [currentMessage, setcurrentmessage] = useState<string | null>(null);

  const phaseRef = useRef<Phase>("intro");
  const categoryRef = useRef<Category>(CATEGORIES[0]);
  const eventsRef = useRef<WordEvent[]>([]);
  const validSetRef = useRef<Set<string>>(new Set());
  const t0Ref = useRef(0); 
  const startedAtRef = useRef("");
  const committedRef = useRef(0);
  const pendingRef = useRef<{ word: string; since: number; confidence: number | null } | null>(null);
  const fillersRef = useRef(0);
  const earlyRef = useRef(0);
  const lateRef = useRef(0);
  const rawRef = useRef<{ tMs: number; text: string; isFinal: boolean; confidence: number | null }[]>([]);
  const errorsRef = useRef<{ tMs: number; code: string; message: string }[]>([]);
  const restartsRef = useRef(0);
  const recStartRef = useRef<number | null>(null);
  const permissionRef = useRef(false);
  const howOpenedRef = useRef(0);
  
  function goTo(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function startListening() {
    if (DEBUG_TEXT_INPUT) return;
    committedRef.current = 0;
    pendingRef.current = null;
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: true,
    });
  }

  function onPlantPress(plant:string) {
    if (plant === "grass") {
      setcurrentmessage("Once you say more words, you get more plants!");
      setCurrentPlant("Just Grass...")
    } else if (plant==="orchard") {
      setcurrentmessage("This Apple Tree (Orchard) plant is common!");
      setCurrentPlant("Orchard")
    } else if (plant==="tomato") {
      setcurrentmessage("This Tomato plant is uncommon!");
      setCurrentPlant("Tomato")
    } else if (plant==="carrot") {
      setcurrentmessage("This Carrot plant is VERY common!");
      setCurrentPlant("Carrot")
    } else {
      setcurrentmessage("This Sunflower is VERY RARE!")
      setCurrentPlant("Sunflower")
    }
    console.log(plant)
    setOpenPlant(true)
  }

  useSpeechRecognitionEvent("start", () => {
    if (recStartRef.current === null) recStartRef.current = Date.now();
  });

  useSpeechRecognitionEvent("result", (e) => {
    const r = e.results[0];
    if (r) onTranscript(r.transcript, e.isFinal, r.confidence ?? null);
  });

  useSpeechRecognitionEvent("error", (e) => {
    errorsRef.current.push({
      tMs: t0Ref.current ? Date.now() - t0Ref.current : -1,
      code: e.error,
      message: e.message,
    });
  });

  useSpeechRecognitionEvent("end", () => {
    const running = phaseRef.current === "countdown" || phaseRef.current === "playing";
    if (running && restartsRef.current < 30) {
      restartsRef.current += 1;
      startListening();
    }
  });

  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {}
    };
  }, []);

  function onTranscript(text: string, isFinal: boolean, confidence: number | null) {
    if (phaseRef.current !== "playing" && phaseRef.current !== "countdown") return;
    const now = Date.now();
    rawRef.current.push({ tMs: t0Ref.current ? now - t0Ref.current : -1, text, isFinal, confidence });

    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length < committedRef.current) committedRef.current = 0; 

    const stableCount = isFinal ? words.length : words.length - 1;
    for (let i = committedRef.current; i < stableCount; i++) {
      const p = pendingRef.current;
      let t = now;
      if (p && p.word === words[i]) {
        t = p.since;
        pendingRef.current = null;
      }
      addWord(words[i], t, confidence);
    }
    committedRef.current = Math.max(committedRef.current, stableCount);

    if (isFinal) {
      pendingRef.current = null;
      committedRef.current = 0;
    } else if (words.length > committedRef.current) {
      const last = words[words.length - 1];
      if (pendingRef.current?.word !== last) {
        pendingRef.current = { word: last, since: now, confidence };
      }
    }
  }

  function flushPending() {
    const p = pendingRef.current;
    if (!p) return;
    pendingRef.current = null;
    committedRef.current += 1;
    addWord(p.word, p.since, p.confidence);
  }

  function addWord(raw: string, at: number, confidence: number | null) {
    const spoken = raw.toLowerCase().replace(/[^a-z' ]/g, "").trim();
    if (!spoken) return;

    if (phaseRef.current === "countdown") {
      earlyRef.current += 1;
      return;
    }
    if (phaseRef.current !== "playing") return;

    const tMs = at - t0Ref.current;
    if (tMs < 0) {
      earlyRef.current += 1;
      return;
    }
    if (tMs > duration_ms) {
      lateRef.current += 1;
      return;
    }

    if (fillers.includes(spoken)) {
      fillersRef.current += 1;
      return;
    }

    const events = eventsRef.current;
    const catId = categoryRef.current.id;
    let text = spoken;
    let startMs = tMs;

    const last = events[events.length - 1];
    if (last && last.status === "invalid" && findWord(catId, `${last.raw} ${spoken}`)) {
      events.pop();
      text = `${last.raw} ${spoken}`;
      startMs = last.tMs;
    }

    const hit = findWord(catId, text);
    const status: Status = !hit ? "invalid" : validSetRef.current.has(hit.word) ? "repeat" : "valid";
    const prevT = events.length ? events[events.length - 1].tMs : 0;

    events.push({
      raw: text,
      word: hit ? hit.word : null,
      status,
      cluster: hit ? hit.cluster : null,
      tMs: startMs,
      gapMs: startMs - prevT,
      confidence,
    });
    console.log(`[WordGarden] "${text}" -> ${status} @ ${Math.round(startMs)}ms`);

    if (hit && status === "valid") {
      validSetRef.current.add(hit.word);
      setPlanted((p) => {
        const availableIds = Array.from({ length: 20 }, (_, i) => i)
          .filter((id) => !p.some((item) => item.id === id));
        if (availableIds.length === 0) return p;
        const id = availableIds[Math.floor(Math.random() * availableIds.length)];
        return [...p, { word: hit.word, day: today(), id }];
      });

      
    }
  }

  async function onStartClicked() {
    let granted = DEBUG_TEXT_INPUT;
    if (!DEBUG_TEXT_INPUT) {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      granted = perm.granted;
    }
    permissionRef.current = granted;
    if (!granted) {
      setError("Word Garden needs the microphone and speech recognition to hear your words. You can turn them on in Settings.");
      return;
    }

    const picked = pickCategory();
    categoryRef.current = picked;
    setCategory(picked);

    eventsRef.current = [];
    validSetRef.current = new Set();
    fillersRef.current = 0;
    earlyRef.current = 0;
    lateRef.current = 0;
    rawRef.current = [];
    errorsRef.current = [];
    restartsRef.current = 0;
    recStartRef.current = null;
    t0Ref.current = 0;
    startedAtRef.current = new Date().toISOString();
    setPlanted([]);
    setElapsedMs(0);
    setCountdown(countd_max);

    goTo("countdown");
    startListening(); 
  }

  useEffect(() => {
    if (phase !== "countdown") return;
    popAnim.setValue(0.6);
    Animated.spring(popAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    const id = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1);
      } else {
        t0Ref.current = Date.now();
        goTo("playing");
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      const elapsed = Date.now() - t0Ref.current;
      const p = pendingRef.current;
      if (p && Date.now() - p.since >= stablems) flushPending();
      setElapsedMs(Math.min(elapsed, duration_ms));
      if (elapsed >= duration_ms) finishGame();
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  function finishGame() {
    if (phaseRef.current !== "playing") return;
    flushPending();
    if (!DEBUG_TEXT_INPUT) ExpoSpeechRecognitionModule.stop();
    goTo("results");

    const events = eventsRef.current;
    const metrics = analyse(events);
    const cat = categoryRef.current;

    const report = {
      sessionId: `${t0Ref.current}`,
      startedAt: startedAtRef.current,
      localHour: new Date(t0Ref.current).getHours(),
      category: cat.id,
      durationSec: duration_sec,
      micPermissionGranted: permissionRef.current,
      // howToPlayOpenedCount: howOpenedRef.current,

      metrics,
      // events,

      fillerWordsHeard: fillersRef.current,
      wordsBeforeGoDropped: earlyRef.current,
      wordsAfterTimeDropped: lateRef.current,
      // recognition: {
      //   restarts: restartsRef.current,
      //   readyMsAfterGo: recStartRef.current ? recStartRef.current - t0Ref.current : null,
      //   errors: errorsRef.current,
      //   rawTranscripts: rawRef.current,
      // },
    };
    console.log("[WordGarden] SESSION REPORT\n" + JSON.stringify(report, null, 2));

    lastSession = { valid: metrics.validCount, invalid: metrics.invalidCount, category: cat.id };
    sessionsPlayed += 1;
    gardenTrees.push(...planted);
    onComplete?.(report)
  }

  function onTypedSubmit() {
    typed
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w) => addWord(w, Date.now(), null));
    setTyped("");
  }

  const secondsLeft = Math.max(0, Math.ceil((duration_ms - elapsedMs) / 1000));
  const progressWidth = `${(elapsedMs / duration_ms) * 100}%` as `${number}%`;

  const sheets = (
    <>
      <FatSheet
        visible={howOpen}
        onDismiss={() => setHowOpen(false)}
        title="How to play"
        message="You will be given a group, like animals. Say as many things in that group as you can before time runs out. Every word you say plants a tree in your garden!"
        buttonText="Got it"
        buttonType="secondary"
      />
      <FatSheet
        visible={error !== null}
        onDismiss={() => setError(null)}
        title="Microphone needed"
        message={error ?? ""}
        buttonText="OK"
        buttonType="secondary"
      />
      <FatSheet
        visible={openplant}
        onDismiss={() => setOpenPlant(false)}
        title={currentPlant as any}
        message={currentMessage as any}
        buttonText={phase==="garden" ? "Back to Garden!" : "Back to Game!"}
        buttonType="secondary"
      />
    </>
  );

  if (phase === "intro") {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          {
            backgroundColor: theme.primary,
            justifyContent: "space-between",
            paddingVertical: 20,
          },
        ]}
      >
        {sheets}
        <View style={styles.titleGroup}>
          <Text style={[styles.subtitle, { color: theme.background }]}>
            Welcome to your daily game
          </Text>
          <Text style={[styles.title, { color: theme.background }]}>Word Garden</Text>
        </View>
        <Image
          source={require("@/assets/mochi_stale/mochi_garden.svg")}
          style={styles.mochi}
        />
        <View style={styles.inlineButtonContainer}>
          <FatButton
            onPress={() => {
              howOpenedRef.current += 1;
              setHowOpen(true);
            }}
            text="HOW TO PLAY?"
            type="secondary"
            size="small"
          />
          <FatButton onPress={onStartClicked} text="START GAME" type="secondary" size="small" />
          {gardenTrees.length > 0 && (
            <FatButton
              onPress={() => goTo("garden")}
              text="MY GARDEN"
              type="secondary"
              size="small"
              icon={Sprout}
            />
          )}
        </View>
      </View>
    );
  }

  if (phase === "countdown") {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.primary }]}>
        <Text style={[styles.subtitle, { color: theme.background }]}>Name as many</Text>
        <Text style={[styles.title, { color: theme.background }]}>{category.title}</Text>
        <Text style={[styles.subtitle, { color: theme.background }]}>as you can!</Text>
        <Animated.Text
          style={[styles.bigNumber, { color: theme.background, transform: [{ scale: popAnim }] }]}
        >
          {countdown}
        </Animated.Text>
        {sheets}
      </View>
    );
  }

  if (phase === "results") {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.primary, justifyContent: "space-between", paddingVertical: 20 },
        ]}
      >
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: theme.background }]}>Great Work!</Text>
          <Text style={[styles.subtitle, { color: theme.background }]}>
            {planted.length === 1 ? "You planted 1 tree!" : `You planted ${planted.length} trees!`}
          </Text>
        </View>
        <Image
          source={require("@/assets/mochi_stale/mochi_celebrate.svg")}
          style={styles.mochi}
        />
        <View style={styles.inlineButtonContainer}>
          <FatButton
            onPress={() => goTo("garden")}
            text="VISIT GARDEN"
            type="secondary"
            size="small"
            icon={Sprout}
          />
          <Text style={[styles.subtitle, { color: theme.background }]}>
            Let's move on to the next game!
          </Text>
        </View>
      </View>
    );
  }

  if (phase === "garden") {
    return (
      <View style={[styles.container, { backgroundColor: theme.primary }]}>
        {sheets}
        <View style={[styles.titleGroup, { paddingTop: Spacing.four }]}>
          <Text style={[styles.title, { color: theme.background, marginBottom: 10 }]}>Your Garden</Text>
          <Text style={[styles.subtitle, { color: theme.background, marginBottom: 28 }]}>
            Tap on any plant to check it out!
          </Text>
          <GardenUI planted={planted} onPlantPress={onPlantPress} />
        </View>
        {/* <View style={{ paddingHorizontal: Spacing.four, paddingBottom: 32 }}>
          <FatButton onPress={() => goTo("intro")} text="BACK" type="secondary" size="small" />
        </View> */}
      </View>
    );
  }

  //phase === "playing"
  return (
    <View style={styles.container}>
      {sheets}
      <View style={[styles.gameArea, { backgroundColor: theme.primary }]}>
        <View style={{marginBottom: 10}}>
          <Text style={[styles.title, { color: theme.background, fontSize: 30 }]}>{category.title}</Text>
          <Text style={[styles.bigNumber, { color: theme.background }]}>{secondsLeft}</Text>
        </View>
        <GardenUI planted={planted} onPlantPress={onPlantPress}/>
        {!DEBUG_TEXT_INPUT && (
          <Text style={[styles.subtitle, { color: theme.background, opacity: 0.8 }]}>
            Listening...
          </Text>
        )}
      </View>

      <View style={{ width: "100%", gap: 16, paddingBottom:0 }}>
        {DEBUG_TEXT_INPUT && (
          <TextInput
            value={typed}
            onChangeText={setTyped}
            onSubmitEditing={onTypedSubmit}
            placeholder="type words (debug)"
            autoCapitalize="none"
            style={styles.debugInput}
          />
        )}
        <View style={[styles.progressTrack, { backgroundColor: theme.primaryEdge }]}>
          <View
            style={[styles.progressFill, { width: progressWidth, backgroundColor: theme.background }]}
          />
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
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  gameArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: Spacing.four,
    gap: Spacing.two,
  },
  progressTrack: {
    height: 18,
    marginHorizontal: Spacing.four,
    overflow: "hidden",
    borderRadius: 9,
  },
  progressFill: {
    width: "0%",
    height: "100%",
    borderRadius: 9,
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
  bigNumber: {
    textAlign: "center",
    fontFamily: FONT.title,
    fontSize: 50,
    lineHeight: 70,
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
  mochi: {
    width: 210,
    height: 300,
    alignSelf: "center",
    objectFit: "contain",
  },
  debugInput: {
    marginHorizontal: Spacing.four,
    padding: 10,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
})