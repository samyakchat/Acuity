import type { BrainMeasure, BrainRegion, BrainRegionId } from '@/components/brain/BrainMap';
import { REGION_ORDER } from '@/components/brain/BrainMap';

/**
 * Turns the aptitude_test.raw JSON into 0-100 scores.
 *
 * IMPORTANT: these scores are a rough, friendly summary of a one-off baseline.
 * They are NOT clinical norms. Thresholds below are simple heuristics so the
 * caretaker gets a readable overview; the real use of this data is as the
 * baseline the daily check-ins are compared against.
 */

export type AptitudeRaw = {
  v?: number;
  os?: string;
  startedAt?: string;
  results?: Record<string, any>;
};

export type AptitudeMeasure = BrainMeasure & { region: BrainRegionId };

export type AptitudeSummary = {
  startedAt: string | null;
  measures: AptitudeMeasure[];
  regions: BrainRegion[];
  /** mean of every measured score, or null if nothing was measured */
  average: number | null;
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const fmtSec = (s: number) => `${s.toFixed(1)}s`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function summarizeAptitude(raw: AptitudeRaw | null | undefined): AptitudeSummary {
  const r = raw?.results ?? {};
  const measures: AptitudeMeasure[] = [];
  const add = (region: BrainRegionId, label: string, value: string, score: number | null) =>
    measures.push({ region, label, value, score: score == null ? null : clamp(score) });

  // Delayed recall (asked at the end of the test)
  if (r.ending) {
    const correct = num(r.ending.correct) ?? 0;
    const incorrect = num(r.ending.incorrect) ?? 0;
    const total = correct + incorrect;
    const time = num(r.ending.timeTaken);
    add(
      'temporal',
      'Delayed recall',
      `${correct} of ${total} correct${time != null ? ` in ${fmtSec(time)}` : ''}`,
      total > 0 ? (correct / total) * 100 : null,
    );
  }

  // Orientation (spoken answer to a simple question)
  if (r.orient) {
    const words = num(r.orient.wordCount) ?? 0;
    const first = num(r.orient.timeToFirstWord);
    const fillers = num(r.orient.fillerCount) ?? 0;
    if (words === 0) {
      add('temporal', 'Orientation', 'No spoken answer was picked up', 0);
    } else {
      const slow = first != null ? Math.min(40, Math.max(0, first - 3) * 8) : 0;
      const filler = Math.min(20, fillers * 5);
      add(
        'temporal',
        'Orientation',
        `Answered with ${plural(words, 'word')}${first != null ? `, first word after ${fmtSec(first)}` : ''}`,
        100 - slow - filler,
      );
    }
  }

  // Pattern Factory (reasoning)
  if (r.patternFactory) {
    const correct = num(r.patternFactory.correct) ?? 0;
    const incorrect = num(r.patternFactory.incorrect) ?? 0;
    const total = correct + incorrect;
    add('frontal', 'Pattern reasoning', `${correct} of ${total} correct`, total > 0 ? (correct / total) * 100 : null);
  }

  // Basic function (an everyday task)
  if (r.basicfunc) {
    const solved = !!r.basicfunc.solved;
    const fails = num(r.basicfunc.failedAttempts) ?? 0;
    const time = num(r.basicfunc.timeTaken);
    add(
      'frontal',
      'Everyday task',
      `${solved ? 'Solved' : 'Not solved'}, ${plural(fails, 'failed attempt')}${time != null ? `, ${fmtSec(time)}` : ''}`,
      solved ? Math.max(40, 100 - fails * 15) : 0,
    );
  }

  // Word Garden (60 second category fluency)
  if (r.wordGarden) {
    const wg = r.wordGarden;
    const m = wg.metrics ?? {};
    if (wg.micPermissionGranted === false) {
      add('frontal', 'Word finding', 'Microphone was not available', null);
    } else {
      const valid = num(m.validCount) ?? 0;
      const first = num(m.timeToFirstValidMs);
      const dur = num(wg.durationSec) ?? 60;
      add(
        'frontal',
        'Word finding',
        `${plural(valid, 'valid word')} in ${dur}s${first != null ? `, first after ${fmtSec(first / 1000)}` : ''}`,
        (valid / 15) * 100,
      );
    }
  }

  // Dig Me Out (spatial planning)
  if (r.digMeOut) {
    const d = r.digMeOut;
    const efficiency = num(d.efficiency);
    const hits = (num(d.rockHits) ?? 0) + (num(d.waterHits) ?? 0);
    const back = num(d.backtracks) ?? 0;
    const ideal = num(d.idealLength);
    const final = num(d.finalLength);
    add(
      'parietal',
      'Spatial planning',
      `${Math.round((efficiency ?? 0) * 100)}% efficient route, ${plural(hits, 'obstacle hit')}, ${plural(back, 'backtrack')}` +
        (ideal != null && final != null ? `, ${final} steps vs ${ideal} ideal` : ''),
      efficiency == null ? null : efficiency * 100 - Math.min(30, hits * 10),
    );
  }

  // Seen It (visual attention + reaction time)
  if (r.seenIt) {
    const s = r.seenIt;
    const hit = num(s.hit) ?? 0;
    const miss = num(s.miss) ?? 0;
    const cr = num(s.cr) ?? 0;
    const fa = num(s.fa) ?? 0;
    const total = hit + miss + cr + fa;
    add(
      'occipital',
      'Visual attention',
      `${hit} of ${hit + miss} repeats caught, ${plural(fa, 'false alarm')}`,
      total > 0 ? ((hit + cr) / total) * 100 : null,
    );

    const times: number[] = Array.isArray(s.reactionTimes)
      ? s.reactionTimes.filter((t: unknown): t is number => typeof t === 'number' && Number.isFinite(t))
      : [];
    const med = median(times);
    if (med != null) {
      // 300ms or faster = full marks, 900ms or slower = zero
      add('cerebellum', 'Reaction time', `${Math.round(med)} ms typical response`, ((900 - med) / 600) * 100);
    }
  }

  const regions: BrainRegion[] = REGION_ORDER.map((id) => {
    const ms = measures.filter((m) => m.region === id);
    const scores = ms.map((m) => m.score).filter((s): s is number => s != null);
    const avg = mean(scores);
    return {
      id,
      score: avg == null ? null : clamp(avg),
      measures: ms.map(({ label, value, score }) => ({ label, value, score })),
    };
  });

  const all = measures.map((m) => m.score).filter((s): s is number => s != null);
  const avg = mean(all);

  return {
    startedAt: typeof raw?.startedAt === 'string' ? raw.startedAt : null,
    measures,
    regions,
    average: avg == null ? null : clamp(avg),
  };
}