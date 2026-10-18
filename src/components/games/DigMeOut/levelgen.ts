export type Cell = [number, number];

export const OBSTACLES = "RW";

export const DIRS: Cell[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export const DEFAULT_LEVEL = [
  "....W.H",
  ".RR.W..",
  "..R.WR.",
  "R....R.",
  "..RR...",
  ".WWR.R.",
  ".....R.",
  ".RR..R.",
  "S...R..",
];

const MIN_DETOUR = 4; 
const MAX_DETOUR = 10;//donthcange this its way too hard after 10 
const MIN_JUNCTIONS = 2;

export const isOpenCell = (level: string[], r: number, c: number) =>
  r >= 0 && r < level.length && c >= 0 && c < level[0].length && !OBSTACLES.includes(level[r][c]);

export function findCell(level: string[], ch: string): Cell {
  const r = level.findIndex((row) => row.includes(ch));
  return [r, level[r].indexOf(ch)];
}

export function distancesFrom(level: string[], from: Cell): number[][] {
  const dist = level.map((row) => Array(row.length).fill(-1));
  dist[from[0]][from[1]] = 0;
  const queue: Cell[] = [from];
  while (queue.length) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (isOpenCell(level, nr, nc) && dist[nr][nc] < 0) {
        dist[nr][nc] = dist[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return dist;
}

export function bestPath(level: string[], dist: number[][], start: Cell): Cell[] {
  const out: Cell[] = [start];
  for (;;) {
    const [r, c] = out[out.length - 1];
    const d = dist[r][c];
    if (d <= 0) return out;
    const next = DIRS.map(([dr, dc]): Cell => [r + dr, c + dc]).find(
      ([nr, nc]) => isOpenCell(level, nr, nc) && dist[nr][nc] === d - 1
    )!;
    out.push(next);
  }
}


function makeRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a winding walk from start to home that never crosses itself; steps toward home are 3x more likely
function carveRoute(rows: number, cols: number, start: Cell, home: Cell, rand: () => number): Cell[] | null {
  const far = (r: number, c: number) => Math.abs(r - home[0]) + Math.abs(c - home[1]);
  const route: Cell[] = [start];
  const seen = new Set([`${start[0]},${start[1]}`]);

  while (far(...route[route.length - 1]) > 0) {
    const [r, c] = route[route.length - 1];
    const options = DIRS.map(([dr, dc]): Cell => [r + dr, c + dc]).filter(
      ([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen.has(`${nr},${nc}`)
    );
    if (!options.length || route.length > (rows * cols) / 2) return null; // boxed in or too long: retry

    const weights = options.map(([nr, nc]) => (far(nr, nc) < far(r, c) ? 3 : 1));
    let roll = rand() * weights.reduce((a, b) => a + b, 0);
    let i = 0;
    while (i < weights.length - 1 && roll >= weights[i]) roll -= weights[i++];

    route.push(options[i]);
    seen.add(`${options[i][0]},${options[i][1]}`);
  }
  return route;
}

type Options = { rows?: number; cols?: number; density?: number; seed?: number };

export function generateLevel({ rows = 9, cols = 7, density = 0.55, seed = Date.now() }: Options = {}): string[] {
  const rand = makeRandom(seed);
  const randInt = (n: number) => Math.floor(rand() * n);

  for (let attempt = 0; attempt < 300; attempt++) {
    const start: Cell = [rows - 1, randInt(cols)];
    const home: Cell = [0, randInt(cols)];
    const route = carveRoute(rows, cols, start, home, rand);
    if (!route) continue;

    const onRoute = new Set(route.map(([r, c]) => `${r},${c}`));
    const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill("."));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (onRoute.has(`${r},${c}`) || rand() > density) continue;
        const nextToWater = grid[r - 1]?.[c] === "W" || grid[r]?.[c - 1] === "W";
        grid[r][c] = rand() < (nextToWater ? 0.7 : 0.2) ? "W" : "R";
      }
    }
    grid[start[0]][start[1]] = "S";
    grid[home[0]][home[1]] = "H";
    const level = grid.map((row) => row.join(""));

    const dist = distancesFrom(level, home);
    const manhattan = Math.abs(start[0] - home[0]) + Math.abs(start[1] - home[1]);
    const detour = dist[start[0]][start[1]] - manhattan;
    if (detour < MIN_DETOUR || detour > MAX_DETOUR) continue;

    const forks = bestPath(level, dist, start).filter(
      ([r, c]) => DIRS.filter(([dr, dc]) => isOpenCell(level, r + dr, c + dc)).length >= 3
    ).length;
    if (forks < MIN_JUNCTIONS) continue;

    return level;
  }
  return DEFAULT_LEVEL;
}