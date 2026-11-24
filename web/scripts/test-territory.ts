// Checks the territory rules (R-21) on the real cell map with the mock season's tiers.
// Run from web/: node scripts/test-territory.ts
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AFFILIATION, mockSeason } from "../lib/mock-season.ts";
import { regionCount } from "../lib/map-regions.ts";
import { claimMultiplier, provisionalWeek, runTerritory, type MapCells, type TerritoryGuild } from "../lib/territory.ts";

const map: MapCells = JSON.parse(readFileSync(new URL("../lib/map-cells.json", import.meta.url), "utf8"));
const closed = mockSeason().filter((t) => t.closed);
let failed = 0;
const check = (name: string, fn: () => void) => {
  try { fn(); console.log(`ok    ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e instanceof Error ? e.message : e}`); }
};

check("map: every cell has a neighbour, neighbours are mutual", () => {
  assert.ok(map.cells > 1900 && map.cells <= 2000, `${map.cells} cells`);
  map.neighbours.forEach((ns, i) => {
    assert.ok(ns.length > 0, `cell ${i} alone`);
    for (const j of ns) assert.ok(map.neighbours[j].includes(i), `${i}-${j} one way`);
  });
});

check("regions: every region named, each one joined up on its own continent", () => {
  assert.equal(map.regions, regionCount, `${map.regions} regions, ${regionCount} names`);
  for (let r = 0; r < map.regions; r++) {
    const cells = map.region.flatMap((x, i) => (x === r ? [i] : []));
    assert.ok(cells.length >= 15, `region ${r}: ${cells.length} cells`);
    const seen = new Set([cells[0]]);
    for (const stack = [cells[0]]; stack.length; ) for (const v of map.neighbours[stack.pop()!]) {
      if (map.region[v] === r && !seen.has(v)) { seen.add(v); stack.push(v); }
    }
    // Small islands may sit apart from their region across water, but most of it must touch
    assert.ok(seen.size >= cells.length * 0.8, `region ${r}: ${seen.size} of ${cells.length} cells joined`);
  }
});

check("multiplier fills the map in about 2.5 weeks, never below 1", () => {
  assert.equal(claimMultiplier(2000, 9), 42);
  assert.equal(claimMultiplier(2000, 100), 4);
  assert.equal(claimMultiplier(2000, 5000), 1);
});

for (const ruleset of ["pvp", "normal"] as const) {
  const weeks: TerritoryGuild[][] = closed.map((t) => t.guilds.filter((g) => AFFILIATION[g.id].ruleset === ruleset)
    .map((g) => ({ id: g.id, status: g.status, tier: g.tier ?? 0, registeredAt: g.registeredAt })));
  const run = runTerritory(map, weeks);
  const count = (w: number, id: string) => run[w].owner.filter((o) => o === id).length;

  check(`${ruleset}: replaying the march log rebuilds each week's map exactly (R-30)`, () => {
    let owner: (string | null)[] = Array(map.cells).fill(null);
    run.forEach((w, k) => {
      for (const g of weeks[k]) if (g.status === "not-found") owner = owner.map((o) => (o === g.id ? null : o));
      const heldAtStart = new Map<string, number>();
      for (const o of owner) if (o) heldAtStart.set(o, (heldAtStart.get(o) ?? 0) + 1);
      const lost = new Map<string, number>();
      let claims = 0, captures = 0, far = 0, lastRound = 0;
      for (const e of w.events) {
        assert.ok(e.round >= lastRound, `week ${k + 1}: rounds go forward`);
        lastRound = e.round;
        if (e.kind === "hold") {
          assert.equal(owner[e.cell], e.from, `week ${k + 1}: hold on a cell ${e.from} owns`);
          if (e.reason === "capital") assert.ok(Object.values(w.capitals).includes(e.cell), `week ${k + 1}: capital hold on a capital`);
          else assert.equal(lost.get(e.from) ?? 0, Math.floor((heldAtStart.get(e.from) ?? 0) / 2), `week ${k + 1}: cap hold only at the cap`);
          continue;
        }
        if (e.kind !== "capital") {
          assert.equal(owner[e.cell], e.from, `week ${k + 1}: ${e.kind} takes the cell from its owner`);
          if (e.kind === "capture") { captures++; lost.set(e.from!, (lost.get(e.from!) ?? 0) + 1); } else claims++;
          if (e.far) far++;
        }
        owner[e.cell] = e.guild;
      }
      assert.deepEqual(owner, w.owner, `week ${k + 1}: replay matches the stored map`);
      assert.equal(claims, w.claimed);
      assert.equal(captures, w.captured);
      assert.equal(far, w.expeditions);
    });
  });

  check(`${ruleset}: a forecast from today's ranks runs on the same engine (R-31)`, () => {
    const open = mockSeason().at(-1)!;
    const ids = new Set(weeks.flat().map((g) => g.id));
    const next = provisionalWeek(open, ids);
    assert.ok(next.some((g) => g.tier > 0), "some guild has a provisional tier");
    const ahead = runTerritory(map, [...weeks, next]);
    assert.deepEqual(ahead.slice(0, -1).map((w) => w.owner), run.map((w) => w.owner), "closed weeks unchanged");
  });

  check(`${ruleset}: same input, same map`, () => {
    assert.deepEqual(runTerritory(map, weeks), run);
  });

  check(`${ruleset}: every ranked guild has a capital it still holds`, () => {
    run.forEach((w, k) => {
      for (const g of weeks[k].filter((x) => x.status === "ranked")) {
        const c = w.capitals[g.id];
        assert.ok(c !== undefined, `week ${k + 1} ${g.id} no capital`);
        assert.equal(w.owner[c], g.id, `week ${k + 1} ${g.id} lost its capital`);
      }
    });
  });

  check(`${ruleset}: capitals never move`, () => {
    for (let k = 1; k < run.length; k++) for (const [id, c] of Object.entries(run[k - 1].capitals)) {
      if (run[k].capitals[id] !== undefined) assert.equal(run[k].capitals[id], c, id);
    }
  });

  check(`${ruleset}: nobody loses more than half in a week`, () => {
    for (let k = 1; k < run.length; k++) for (const id of Object.keys(run[k - 1].capitals)) {
      const before = count(k - 1, id);
      const after = count(k, id);
      const lost = run[k - 1].owner.filter((o, i) => o === id && run[k].owner[i] !== id).length;
      assert.ok(lost <= Math.floor(before / 2), `week ${k + 1} ${id}: lost ${lost} of ${before}, now ${after}`);
    }
  });

  check(`${ruleset}: only ranked guilds gain land`, () => {
    run.forEach((w, k) => {
      for (const g of weeks[k].filter((x) => x.status !== "ranked")) {
        const before = k ? count(k - 1, g.id) : 0;
        assert.ok(count(k, g.id) <= before, `week ${k + 1} ${g.id} grew while ${g.status}`);
      }
    });
  });

  check(`${ruleset}: a lord holds more than half of its region`, () => {
    const w = run[run.length - 1];
    for (const [r, id] of Object.entries(w.lords)) {
      const cells = w.owner.filter((_, i) => map.region[i] === Number(r));
      assert.ok(cells.filter((o) => o === id).length * 2 > cells.length, `region ${r}`);
    }
  });

  check(`${ruleset}: map nearly full by week 3, taking starts by then`, () => {
    const last = run[run.length - 1];
    const empty = last.owner.filter((o) => o === null).length;
    assert.ok(empty < map.cells * 0.1, `${empty} empty`);
    assert.ok(last.captured > 0, "no captures");
    console.log(`      week by week: ${run.map((w, k) => `w${k + 1} x${w.multiplier} +${w.claimed} taken ${w.captured} empty ${w.owner.filter((o) => o === null).length}`).join(" | ")}`);
  });
}

console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
