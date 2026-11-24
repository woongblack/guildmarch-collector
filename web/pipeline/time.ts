// Day and week numbers for the pipeline, counted from the first week's start.
// PIPELINE_EPOCH (ISO time) moves day 0 for local tests on old snapshots; never set it in production.
import { FIRST_WEEK } from "../server/types.ts";

export const DAY = 86_400_000;
export const EPOCH = process.env.PIPELINE_EPOCH ? Date.parse(process.env.PIPELINE_EPOCH) : FIRST_WEEK;
// Territory seasons are four weeks (Guild_League_Requirements.md, R-21)
export const SEASON_WEEKS = 4;
// Bump when lib/map-cells.json is regenerated, so stored maps keep pointing at the cells they used
export const MAP_VERSION = 1;

// A run started at 08:00 KST belongs to that day; the whole run counts as that moment
export const dayOf = (ms: number) => Math.floor((ms - EPOCH) / DAY);
export const weekStart = (week: number) => EPOCH + week * 7 * DAY;
