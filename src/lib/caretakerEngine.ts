import { supabase } from '@/lib/supabase';
import { summarizeAptitude, type AptitudeRaw, type AptitudeSummary } from '@/lib/aptitude';

/*
 * Caretaker-side daily results engine.
 *
 * Deliberately standalone: it never imports the patient engine (protected route).
 * The scoring + trend maths below mirror what the patient engine feeds the AI, so the
 * trends a caretaker sees match what the AI reasoned over.
 */

export type Trend = 'improving' | 'stable' | 'declining' | 'insufficient';
export type MetricKey = 'memory' | 'processingSpeed' | 'seenIt' | 'patternFactory' | 'wordGarden' | 'digMeOut';

export const MIN_ENTRIES = 3; // results needed before a trend is shown
const TREND_DELTA = 0.08;
const TREND_WINDOW = 7; // the AI looks at the last 7 days, so trends do too
const FETCH_LIMIT = 60; // newest daily results to load

export const METRIC_LABEL: Record<MetricKey, string> = {
  memory: 'Memory',
  processingSpeed: 'Processing speed',
  seenIt: 'Seen It',
  patternFactory: 'Pattern Factory',
  wordGarden: 'Word Garden',
  digMeOut: 'Dig Me Out',
};
const METRIC_ORDER: MetricKey[] = ['memory', 'processingSpeed', 'seenIt', 'patternFactory', 'wordGarden', 'digMeOut'];

/** "patternFactory" -> "Pattern Factory"; unknown keys from the AI still read nicely. */
export function areaLabel(key: string): string {
  if (key in METRIC_LABEL) return METRIC_LABEL[key as MetricKey];
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return spaced ? spaced.charAt(0).toUpperCase() + spaced.slice(1) : 'Unknown area';
}

export type DailyNote = {
  reason: string | null;
  decision: string | null;
  focusGame: string | null;
  decliningAreas: string[];
};

export type MetricCell = {
  key: MetricKey;
  label: string;
  score: number | null; // 0-100, null = not played that day
  trend: Trend;
  points: number; // how many results the trend had to work with
};

export type DayEntry = {
  id: string;
  takenAt: string;
  dateKey: string;
  dayShort: string; // "Today", "Yesterday", "Oct 20"
  dayLong: string; // "Thursday, October 22"
  isToday: boolean;
  summary: AptitudeSummary | null; // same shape the baseline page uses (brain regions, measures)
  metrics: MetricCell[];
  note: DailyNote | null; // null when no daily_lists row exists for the day
  focusLabel: string | null; // "Pattern Factory" when the day was a focus session
};

type DailyRow = { id?: string | number; taken_at: string; data: any };
type ListRow = { list_date: string | null; data: any };

/* ---------- scoring (0-1), mirrors the patient engine ---------- */
const num = (v: unknown): number | null => (typeof v === 'number' && isFinite(v) ? v : null);
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const ratio = (good: unknown, bad: unknown) => {
  const g = num(good);
  const b = num(bad);
  return g === null || b === null || g + b === 0 ? null : g / (g + b);
};

function scoreAll(res: any): Record<MetricKey, number | null> {
  const r = res && typeof res === 'object' ? res : {};

  const seen = r.seenIt;
  const seenTotal = ['hit', 'miss', 'cr', 'fa'].reduce((s, k) => s + (num(seen?.[k]) ?? 0), 0);
  const rts = (Array.isArray(seen?.reactionTimes) ? seen.reactionTimes : []).filter(
    (x: unknown) => num(x) !== null,
  ) as number[];
  const wg = num(r.wordGarden?.metrics?.validCount);
  const eff = num(r.digMeOut?.efficiency);

  return {
    memory: ratio(r.ending?.correct, r.ending?.incorrect),
    processingSpeed: rts.length === 0 ? null : clamp(1 - (median(rts) - 500) / 1000),
    seenIt: seenTotal === 0 ? null : ((num(seen.hit) ?? 0) + (num(seen.cr) ?? 0)) / seenTotal,
    patternFactory: ratio(r.patternFactory?.correct, r.patternFactory?.incorrect),
    wordGarden: wg === null ? null : clamp(wg / 15),
    digMeOut:
      eff === null ? null : clamp(eff - 0.1 * ((num(r.digMeOut?.rockHits) ?? 0) + (num(r.digMeOut?.waterHits) ?? 0))),
  };
}

function trendOf(series: (number | null)[]): { trend: Trend; points: number } {
  const s = series.filter((x): x is number => x !== null);
  if (s.length < MIN_ENTRIES) return { trend: 'insufficient', points: s.length };
  const d = mean(s.slice(-2)) - mean(s.slice(0, -2));
  return { trend: d >= TREND_DELTA ? 'improving' : d <= -TREND_DELTA ? 'declining' : 'stable', points: s.length };
}

/* ---------- normalising stored JSON ---------- */

/**
 * daily_results.data comes in two shapes: the full session ({ v, os, startedAt, results: {...} })
 * or a flat results object ({ ending, seenIt, ... }). Both become an AptitudeRaw so the
 * baseline page's summarizeAptitude (and therefore BrainMap) can be reused as-is.
 */
function toRaw(data: any, takenAt: string): { raw: AptitudeRaw; results: any } | null {
  if (!data || typeof data !== 'object') return null;
  const results = data.results && typeof data.results === 'object' ? data.results : data;
  const raw = { v: data.v ?? 1, os: data.os ?? 'unknown', startedAt: data.startedAt ?? takenAt, results };
  return { raw: raw as unknown as AptitudeRaw, results };
}

/** The AI doesn't always fill every field, so anything missing just becomes empty. */
function parseNote(data: any): DailyNote | null {
  if (!data || typeof data !== 'object') return null;
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const note: DailyNote = {
    reason: str(data.reason),
    decision: str(data.decision),
    focusGame: str(data.focusGame),
    decliningAreas: Array.isArray(data.decliningAreas)
      ? data.decliningAreas.filter((a: unknown): a is string => typeof a === 'string' && !!a.trim())
      : [],
  };
  const empty = !note.reason && !note.decision && !note.focusGame && note.decliningAreas.length === 0;
  return empty ? null : note;
}

const pad = (n: number) => String(n).padStart(2, '0');
const localKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/* ---------- building the day list ---------- */

export function buildDays(rows: DailyRow[], lists: ListRow[], now = new Date()): DayEntry[] {
  const asc = rows
    .filter((r) => r?.taken_at && !Number.isNaN(new Date(r.taken_at).getTime()))
    .sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());

  const scored = asc.map((row) => {
    const parsed = toRaw(row.data, row.taken_at);
    return { row, parsed, scores: scoreAll(parsed?.results) };
  });

  // daily_lists rows are keyed by the date the list was made, i.e. the day of the result they describe.
  const noteByDate = new Map<string, DailyNote>();
  for (const l of lists) {
    const note = parseNote(l?.data);
    if (note && l?.list_date) noteByDate.set(String(l.list_date).slice(0, 10), note);
  }

  const todayKey = localKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = localKey(yesterday);

  const claimed = new Set<string>();
  const entries: DayEntry[] = [];

  // newest first, so if two tests share a date the latest one gets that day's note
  for (let i = scored.length - 1; i >= 0; i--) {
    const { row, parsed, scores } = scored[i];
    const when = new Date(row.taken_at);
    const dateKey = localKey(when);

    let note: DailyNote | null = null;
    for (const key of [dateKey, row.taken_at.slice(0, 10)]) {
      if (!claimed.has(key) && noteByDate.has(key)) {
        note = noteByDate.get(key)!;
        claimed.add(key);
        break;
      }
    }

    const window = scored.slice(Math.max(0, i - (TREND_WINDOW - 1)), i + 1);
    const metrics: MetricCell[] = METRIC_ORDER.map((key) => {
      const { trend, points } = trendOf(window.map((w) => w.scores[key]));
      const s = scores[key];
      return { key, label: METRIC_LABEL[key], score: s === null ? null : Math.round(s * 100), trend, points };
    });

    let summary: AptitudeSummary | null = null;
    try {
      summary = parsed ? summarizeAptitude(parsed.raw) : null;
    } catch {
      summary = null;
    }

    entries.push({
      id: String(row.id ?? row.taken_at),
      takenAt: row.taken_at,
      dateKey,
      dayShort:
        dateKey === todayKey
          ? 'Today'
          : dateKey === yesterdayKey
            ? 'Yesterday'
            : when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      dayLong: when.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
      isToday: dateKey === todayKey,
      summary,
      metrics,
      note,
      focusLabel: note?.decision === 'focus' && note.focusGame ? areaLabel(note.focusGame) : null,
    });
  }

  return entries;
}

/* ---------- loading ---------- */

export async function loadDailyHistory(patientId: string): Promise<DayEntry[]> {
  const [resultsRes, listsRes] = await Promise.all([
    supabase
      .from('daily_results')
      .select('id, taken_at, data')
      .eq('patient_id', patientId)
      .order('taken_at', { ascending: false })
      .limit(FETCH_LIMIT),
    supabase.from('daily_lists').select('list_date, data').eq('patient_id', patientId),
  ]);

  if (resultsRes.error) throw resultsRes.error;
  // Missing / unreadable lists must never hide the results themselves.
  const lists = listsRes.error ? [] : ((listsRes.data ?? []) as ListRow[]);

  return buildDays((resultsRes.data ?? []) as DailyRow[], lists);
}