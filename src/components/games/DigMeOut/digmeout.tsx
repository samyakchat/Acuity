import { Spacing } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Animated, Text, PanResponder } from "react-native";
import { FONT } from "@/components/fatUI/theme";
import FatButton from "@/components/fatUI/fatButton";
import FatSheet from "@/components/fatUI/fatSheet";
import { Image } from "expo-image";
import { House, Mountain, Waves, Smile, RotateCcw } from "lucide-react-native";
import {
  type Cell,
  DIRS,
  bestPath,
  distancesFrom,
  findCell,
  generateLevel,
  isOpenCell,
} from "@/components/games/DigMeOut/levelgen";
import { Dimensions } from "react-native";
import { routerObj } from "@/app/(patient)/tests/engine";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isCompact = SCREEN_HEIGHT < 700;

const theme = { primary: "#EFBF04", primaryEdge: "#BF9903", background: "#4C3D01" };
const ART: Record<string, any> = {
  mochi: require("@/assets/digmeout/mochi-head.svg"),
  home: require("@/assets/digmeout/decor-house.svg"),
  rock: require("@/assets/digmeout/decor-rock.svg"),
  gator: require("@/assets/digmeout/decor-water.svg"),
};
const CELL_ART: Record<string, { art: string; Icon: any; color: string }> = {
  R: { art: "rock", Icon: Mountain, color: "#6B6B6B" },
  W: { art: "gator", Icon: Waves, color: "#FFFFFF" },
};
const COLORS = { grass: "#7BC65A", dirt: "#6B4226", water: "#4FB3E8", line: "rgba(0,0,0,0.08)" };

const PAUSE_MS = 1500; //imo max they shud wait before we think theyre thinking abt where to go
const MAX_STEPS_PER_MOVE = 3;
const PAD = 15;
const FRAME = 4;

type TrailType = "dig" | "back" | "hitRock" | "hitWater" | "restart";
type TrailEvent = {
  type: TrailType;
  from: Cell;//og
  to: Cell;
  tMs: number
  gapMs: number;
  toward: boolean | null;
};

function buildMaze(level: string[]) {
  const start = findCell(level, "S");
  const home = findCell(level, "H");
  const dist = distancesFrom(level, home); // steps to home from every cell
  return { level, rows: level.length, cols: level[0].length, start, home, dist, ideal: bestPath(level, dist, start) };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function Art({ name, Icon, size, color }: { name: string; Icon: any; size: number; color: string }) {
  const src = ART[name];
  if (src) return <Image source={src} contentFit="cover" style={{ width: size*1.2, height: size*1.2 }} />;
  return <Icon size={size * 0.7} color={color} />;
}

export default function DigMeOut({ onComplete }: { onComplete?: (result?: Record<string, unknown>) => void }) {
  const [maze] = useState(() => buildMaze(generateLevel()));
  const { level, rows, cols, start, home, dist, ideal } = maze;

  const [started, setStarted] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [path, setPath] = useState<Cell[]>([start]);

  const pathRef = useRef<Cell[]>([start]);
  const trailRef = useRef<TrailEvent[]>([]);
  const startedAt = useRef(Date.now());
  const restarts = useRef(0);
  const howOpened = useRef(0);
  const touching = useRef(false);
  const finished = useRef(false);
  const lastHit = useRef("");
  const placed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mochiX = useRef(new Animated.Value(0)).current;
  const mochiY = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  // biggest square cell that fits, leaving PAD around the board
  const room = 2 * (PAD + FRAME);
  const BOARD_SCALE = 1.0;
  const cell = Math.max(0, Math.floor(Math.min((size.w - room) / cols, (size.h - room) / rows) * BOARD_SCALE));
  const cellRef = useRef(0);
  cellRef.current = cell;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Mochi springs to the tip of the tunnel
  useEffect(() => {
    if (!cell) return;
    const [r, c] = path[path.length - 1];
    if (!placed.current) {
      mochiX.setValue(c * cell);
      mochiY.setValue(r * cell);
      placed.current = true;
      return;
    }
    const spring = { friction: 8, tension: 140, useNativeDriver: true };
    Animated.spring(mochiX, { toValue: c * cell, ...spring }).start();
    Animated.spring(mochiY, { toValue: r * cell, ...spring }).start();
  }, [path, cell]);

  function onStart() {
    startedAt.current = Date.now(); // thinking time is counted from here
    setStarted(true);
  }

  function bump() {
    Animated.sequence([
      Animated.timing(shake, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  // call BEFORE changing the path so "from" is correct
  function log(type: TrailType, to: Cell, toward: boolean | null = null) {
    const p = pathRef.current;
    const tMs = Date.now() - startedAt.current;
    const last = trailRef.current[trailRef.current.length - 1];
    trailRef.current.push({ type, from: p[p.length - 1], to, tMs, gapMs: last ? tMs - last.tMs : tMs, toward });
  }

  function stepTo(r: number, c: number): boolean {
    if (finished.current) return false;
    const p = pathRef.current;
    const prev = p[p.length - 2];

    // moving back onto the previous cell fills the tunnel back in
    if (prev && prev[0] === r && prev[1] === c) {
      log("back", [r, c]);
      p.pop();
      lastHit.current = "";
      setPath([...p]);
      return true;
    }
    // can't cross your own tunnel
    if (p.some(([pr, pc]) => pr === r && pc === c)) return false;

    // obstacle: bump (log once per obstacle, not once per finger wiggle)
    const kind = level[r][c];
    if (CELL_ART[kind]) {
      const key = `${r},${c}`;
      if (lastHit.current !== key) {
        lastHit.current = key;
        log(kind === "W" ? "hitWater" : "hitRock", [r, c]);
        bump();
      }
      return false;
    }

    lastHit.current = "";
    const head = p[p.length - 1];
    log("dig", [r, c], dist[r][c] < dist[head[0]][head[1]]);
    p.push([r, c]);
    setPath([...p]);
    if (r === home[0] && c === home[1]) finish();
    return true;
  }

  // walk toward the finger one cell at a time, straight lines only
  function moveTo([r, c]: Cell) {
    for (let i = 0; i < MAX_STEPS_PER_MOVE; i++) {
      const [hr, hc] = pathRef.current[pathRef.current.length - 1];
      const dr = r - hr, dc = c - hc;
      if (!dr && !dc) return;
      const horizontal = Math.abs(dc) > Math.abs(dr);
      if (!stepTo(horizontal ? hr : hr + Math.sign(dr), horizontal ? hc + Math.sign(dc) : hc)) return;
    }
  }

  function toCell(e: any): Cell | null {
    const k = cellRef.current;
    if (!k) return null;
    const r = Math.floor(e.nativeEvent.locationY / k);
    const c = Math.floor(e.nativeEvent.locationX / k);
    return r >= 0 && r < rows && c >= 0 && c < cols ? [r, c] : null;
  }

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        // finger must start on or next to Mochi
        const t = toCell(e);
        const h = pathRef.current[pathRef.current.length - 1];
        touching.current = !!t && Math.max(Math.abs(t[0] - h[0]), Math.abs(t[1] - h[1])) <= 1;
        if (touching.current && t) moveTo(t);
      },
      onPanResponderMove: (e) => {
        const t = touching.current && toCell(e);
        if (t) moveTo(t);
      },
      onPanResponderRelease: () => { touching.current = false; },
      onPanResponderTerminate: () => { touching.current = false; },
    })
  ).current;


  function finish() {
    finished.current = true;
    const report = buildReport();
    console.log("[DigMeOut] SESSION REPORT\n" + JSON.stringify(report, null, 2));
    onComplete?.(report);
    timer.current = setTimeout(() => setDone(true), 700);
  }

  function buildReport() {
    const trail = trailRef.current;
    const taken = pathRef.current;
    const digs = trail.filter((e) => e.type === "dig");
    const openNeighbors = ([r, c]: Cell) => DIRS.filter(([dr, dc]) => isOpenCell(level, r + dr, c + dc)).length;
    const pauses = trail
      .filter((e) => e.gapMs > PAUSE_MS)
      .map((e) => ({ atCell: e.from, ms: e.gapMs, exits: openNeighbors(e.from), thenDid: e.type }));
    const finalLength = taken.length - 1;
    const idealLength = ideal.length - 1;
    
    return {
    //   level,
      totalMs: Date.now() - startedAt.current,
      timeToFirstMoveMs: trail.length ? trail[0].tMs : null,
      howToPlayOpenedCount: howOpened.current,

    //   pathTaken: taken,
    //   idealPath: ideal,
      idealLength,
      finalLength,
      extraSteps: finalLength - idealLength,
      efficiency: round2(idealLength / finalLength),

      totalDigs: digs.length,
      stepsAwayFromHome: digs.filter((e) => e.toward === false).length, 
      backtracks: trail.filter((e) => e.type === "back").length,
      rockHits: trail.filter((e) => e.type === "hitRock").length,
      waterHits: trail.filter((e) => e.type === "hitWater").length,
    //   restarts: restarts.current,

      pauses: pauses.length, 
      pausesAtJunctions: pauses.filter((p) => p.exits >= 3).length,
    //   trail, 
    };
  }

  if (!started) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.primary, justifyContent: "space-between", paddingVertical: 20 },
        ]}
      >
        <FatSheet
          visible={howOpen}
          onDismiss={() => setHowOpen(false)}
          title="How to play"
          message="Mochi is stuck underground! Drag your finger from Mochi to dig a path to his home. Go around the rocks and the water."
          buttonText="Got it"
          buttonType="secondary"
        />
        <View style={styles.titleGroup}>
          <Text style={[styles.subtitle, { color: theme.background }]}>Welcome to your daily theme</Text>
          <Text style={[styles.title, { color: theme.background }]}>Dig Me Out!</Text>
        </View>
        <Image source={require("@/assets/mochi_stale/mochi_shovel.svg")} style={styles.mochi} />
        <View style={styles.inlineButtonContainer}>
          <FatButton
            onPress={() => {
              howOpened.current += 1;
              setHowOpen(true);
            }}
            text="HOW TO PLAY?"
            type="secondary"
            size="small"
          />
          <FatButton onPress={onStart} text="START GAME" type="secondary" size="small" />
        </View>
      </View>
    );
  }

  if (done) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.primary }]}>
        <Text style={[styles.title, { color: theme.background }]}>Great Work!</Text>
        <Text style={[styles.subtitle, { color: theme.background }]}>Let's move on to the next theme!</Text>
        <Image source={require("@/assets/mochi_stale/mochi_celebrate.svg")} style={styles.mochi} />
      </View>
    );
  }

  const dug = new Set(path.map(([r, c]) => `${r},${c}`));

  return (
    <View style={styles.container}>
      <View style={[styles.themeArea, { backgroundColor: theme.primary }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.background }]}>Dig Me Out!</Text>
          <Text style={[styles.subtitle, { color: theme.background }]}>Dig a path home for Mochi!</Text>
        </View>

        <View
          style={[styles.boardWrap, {}]}
          onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        >
          {cell > 0 && (
            <Animated.View
              style={{
                borderWidth: FRAME,
                borderColor: theme.primaryEdge,
                borderRadius: 16,
                overflow: "hidden",
                transform: [{ translateX: shake }],
                
              }}
            >
              <View {...pan.panHandlers} style={{ width: cell * cols, height: cell * rows }}>
                <View pointerEvents="none">
                  {level.map((row, r) => (
                    <View key={r} style={{ flexDirection: "row" }}>
                      {row.split("").map((ch, c) => {
                        const obstacle = CELL_ART[ch];
                        const bg = ch === "W" ? COLORS.water : dug.has(`${r},${c}`) ? COLORS.dirt : COLORS.grass;
                        return (
                          <View key={c} style={[styles.tile, { width: cell, height: cell, backgroundColor: bg }]}>
                            {obstacle && (
                              <Art name={obstacle.art} Icon={obstacle.Icon} size={cell * 0.85} color={obstacle.color} />
                            )}
                            {ch === "H" && <Art name="home" Icon={House} size={cell * 0.85} color="#FFFFFF" />}
                          </View>
                        );
                      })}
                    </View>
                  ))}

                  <Animated.View
                    style={[
                      styles.tile,
                      {
                        position: "absolute",
                        width: cell,
                        height: cell,
                        transform: [{ translateX: mochiX }, { translateY: mochiY }],
                      },
                    ]}
                  >
                    <Art name="mochi" Icon={Smile} size={cell * 0.95} color="#FFFFFF" />
                  </Animated.View>
                </View>
              </View>
            </Animated.View>
          )}
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
  themeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: isCompact ? Spacing.two : Spacing.three,
  },
  header: {
    paddingHorizontal: Spacing.four,
    marginBottom: isCompact ? 8 : 16,
  },
  title: {
    textAlign: "center",
    fontFamily: FONT.title,
    fontSize: isCompact ? 32 : 40, 
    lineHeight: isCompact ? 38 : 48,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: FONT.body,
    fontSize: isCompact ? 16 : 20,
    lineHeight: isCompact ? 22 : 28,
    marginBottom: 10
  },
  boardWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tile: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
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
});