// Looks guilds up on the real Forever API the way /api/register does, without touching the database.
// Uses BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET from the shell; never prints them.
//   node scripts/check-guild.ts kr "둠스데이" "War Song"
import { findGuild, token } from "../server/blizzard.ts";
import { REGIONS, type Region } from "../server/types.ts";

const [region, ...names] = process.argv.slice(2);
if (!REGIONS.includes(region as Region) || !names.length) {
  console.error(`usage: node scripts/check-guild.ts <${REGIONS.join("|")}> "guild name" ...`);
  process.exit(1);
}
const { BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET } = process.env;
if (!BLIZZARD_CLIENT_ID || !BLIZZARD_CLIENT_SECRET) {
  console.error("Set BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET first.");
  process.exit(1);
}

const tok = await token({ BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET });
console.log("token: ok");
for (const name of names) {
  const r = await findGuild(tok, region as Region, name);
  if ("found" in r) {
    const g = r.found;
    console.log(`[${region}] ${name}: found  slug=${g.slug}  name=${g.name}  id=${g.id}  members=${g.members}  faction=${g.faction}`);
  } else {
    console.log(`[${region}] ${name}: not found  tried ${r.notFound.join(", ")}`);
  }
}
