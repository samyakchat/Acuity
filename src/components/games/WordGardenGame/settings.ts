
export const duration_sec = 60;
export const duration_ms = duration_sec * 1000;
export const countd_max = 5;
export const stablems = 600; // an unfinished last word must stay unchanged this long before we count it
export const pausems = 2000; // a silence longer than this counts as a "pause"
export const burstgap_ms = 1500; // words closer together than this belong to the same speech burst
export const bins = 4; // split the round into this many time slices (decay curve)
export const force_category: string | null = null; // e.g. "foods" to always test one category
export const DEBUG_TEXT_INPUT = false; // true = type words instead of speaking (simulator testing)
export const fillers = ["um", "uh", "umm", "uhh", "hmm", "and", "the", "a", "oh", "like"];
