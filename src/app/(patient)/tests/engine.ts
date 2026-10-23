import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type routerObj = {
    gameID: String;
    primaryColor: String;
}

const KEY = "aptitude_session_v1";
type Result = Record<string, unknown>;
type Session = { v: 1; startedAt: string; os: string; results: Record<string, Result> };
let session: Session | null = null;

export async function startSession() {
    const saved = await AsyncStorage.getItem(KEY);
    session = saved
        ? JSON.parse(saved)
        : { v: 1, startedAt: new Date().toISOString(), os: Platform.OS, results: {} };
}

export function recordResult(stepId: string, data?: Result) {
    if (!data) return;
    if (!session) session = { v: 1, startedAt: new Date().toISOString(), os: Platform.OS, results: {} };
    session.results[stepId.split("-")[0]] = data;//turn stupid ids
    AsyncStorage.setItem(KEY, JSON.stringify(session)).catch(() => {});
}

export const aptitudeList = [
    'welcome',
    'intro-1',
    'orient-1',
    'basicfunc-1',
    'gamesection_m',
    "seenIt-10987",
    "wordGarden-11987",
    "digMeOut-12546",
    "patternFactory-13476",
    'ending-1',
    'thanks'

]

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('not sigend in');
    return user
}

export async function checkAp() {
    const user = await getUser()
    const { data, error } = await supabase
        .from('aptitude_test')
        .select('id')
        .eq('patient_id', user.id)
    console.log(data)
    
    if (data?.length===0) {
        return false
    } else {
        return true
    }

    
}

export async function submitSession() {
    if (!session) throw new Error("no session");

    const user = await getUser();
    if (!user) throw new Error("Not signed in");

    const { data: existingTest, error: checkError } = await supabase
        .from("aptitude_test")
        .select("id")
        .eq("patient_id", user.id)
        .limit(1)
        .maybeSingle();

    if (checkError) throw checkError;

    const targetTable = existingTest ? "daily_results" : "aptitude_test";

    const insertData = existingTest
        ? { patient_id: user.id, data: session }
        : { patient_id: user.id, raw: session };

    const { data, error } = await supabase
        .from(targetTable)
        .insert(insertData as any)
        .select("id")
        .single();

    if (error) throw error;
    await AsyncStorage.removeItem(KEY);
    session = null;
    setAptitudeList();

    return data.id;
}

//claude natifve code below beware it may be buggy asl

type Trend = "improving" | "stable" | "declining" | "insufficient";
type Summary = {
    memory: number | null;
    processingSpeed: number | null;
    games: Record<"seenIt" | "patternFactory" | "wordGarden" | "digMeOut", number | null>;
};

const HISTORY_DAYS = 7;       
const MIN_ENTRIES = 3;       
const TREND_DELTA = 0.08;    

// ---------- helpers ----------
const num = (v: unknown): number | null => (typeof v === "number" && isFinite(v) ? v : null);
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const r2 = (n: number | null) => (n === null ? null : Math.round(n * 100) / 100);
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const median = (a: number[]) => {
    const s = [...a].sort((x, y) => x - y);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const ratio = (good: unknown, bad: unknown) => {
    const g = num(good), b = num(bad);
    return g === null || b === null || g + b === 0 ? null : g / (g + b);
};

const scoreSeenIt = (r: any) => {
    const total = ["hit", "miss", "cr", "fa"].reduce((s, k) => s + (num(r?.[k]) ?? 0), 0);
    return total === 0 ? null : ((num(r.hit) ?? 0) + (num(r.cr) ?? 0)) / total;
};
const scorePatternFactory = (r: any) => ratio(r?.correct, r?.incorrect);
const scoreWordGarden = (r: any) => {
    const v = num(r?.metrics?.validCount);
    return v === null ? null : clamp(v / 15);
};
const scoreDigMeOut = (r: any) => {
    const eff = num(r?.efficiency);
    if (eff === null) return null;
    return clamp(eff - 0.1 * ((num(r.rockHits) ?? 0) + (num(r.waterHits) ?? 0)));
};
const scoreMemory = (r: any) => ratio(r?.correct, r?.incorrect);
const scoreSpeed = (r: any) => {
    const rts = (r?.reactionTimes ?? []).filter((x: unknown) => num(x) !== null) as number[];
    return rts.length === 0 ? null : clamp(1 - (median(rts) - 500) / 1000);
};

function summarize(res: any): Summary {
    return {
        memory: scoreMemory(res?.ending),
        processingSpeed: scoreSpeed(res?.seenIt),
        games: {
            seenIt: scoreSeenIt(res?.seenIt),
            patternFactory: scorePatternFactory(res?.patternFactory),
            wordGarden: scoreWordGarden(res?.wordGarden),
            digMeOut: scoreDigMeOut(res?.digMeOut),
        },
    };
}

function trendOf(series: (number | null)[]): Trend {
    const s = series.filter((x): x is number => x !== null);
    if (s.length < MIN_ENTRIES) return "insufficient";
    const d = mean(s.slice(-2)) - mean(s.slice(0, -2));
    return d >= TREND_DELTA ? "improving" : d <= -TREND_DELTA ? "declining" : "stable";
}

export function buildRecentHistory(rows: { taken_at: string; data: any }[]) {
    if (rows.length === 0) {
        return { status: "no_tests_yet", note: "Patient hasn't taken any tests past the aptitude test.", entries: [] };
    }
    if (rows.length < MIN_ENTRIES) {
        return { status: "not_enough_data", note: `Not enough data (${rows.length} of ${MIN_ENTRIES} daily tests needed for trends).`, entries: [] };
    }

    const days = rows.map((r) => ({ date: r.taken_at.slice(0, 10), s: summarize(r.data?.results ?? r.data) }));

    const cell = (i: number, pick: (s: Summary) => number | null) => ({
        score: r2(pick(days[i].s)),
        trend: trendOf(days.slice(0, i + 1).map((d) => pick(d.s))),
    });

    const entries = days.map((d, i) => ({
        date: d.date,
        summary: {
            memory: cell(i, (s) => s.memory),
            processingSpeed: cell(i, (s) => s.processingSpeed),
            games: {
                seenIt: cell(i, (s) => s.games.seenIt),
                patternFactory: cell(i, (s) => s.games.patternFactory),
                wordGarden: cell(i, (s) => s.games.wordGarden),
                digMeOut: cell(i, (s) => s.games.digMeOut),
            },
        },
    }));

    return { status: "ok", note: `Last ${entries.length} daily tests, oldest first.`, entries };
}

export async function getAptitudeWithHistory(patientId?: string) {
    const id = patientId ?? (await getUser()).id;

    const { data: apt, error: aptErr } = await supabase
        .from("aptitude_test")
        .select("raw")
        .eq("patient_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (aptErr) throw aptErr;
    if (!apt) throw new Error("no aptitude test found");

    const { data: rows, error } = await supabase
        .from("daily_results")
        .select("taken_at, data")
        .eq("patient_id", id)
        .order("taken_at", { ascending: false })
        .limit(HISTORY_DAYS);
    if (error) throw error;

    return { ...apt.raw, recentHistory: buildRecentHistory((rows ?? []).reverse()) };
}

export async function setAptitudeList() {
    const user = await getUser();
    if (!user) throw new Error("Not signed in");

    const jsonHistoryRaw = await getAptitudeWithHistory(user.id);
    const { data, error } = await supabase.functions.invoke(
        "get_daily_list",
        {
            body: jsonHistoryRaw,
        }
    );

    if (error) throw error;

    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
    ].join("-");

    const { error: insertError } = await supabase
        .from("daily_lists")
        .insert(
            {
                patient_id: user.id,
                list_date: today,
                data: data,
            },

        );

    if (insertError) throw insertError;

    return data.aptitudeList;
}