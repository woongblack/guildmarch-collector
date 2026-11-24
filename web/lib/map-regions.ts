// Names for the territory map's 37 terrain regions, by region index in map-cells.json.
// Named after what the map shows, not after game zones: the painted coastlines only roughly follow
// Azeroth, so a real zone name would often sit in the wrong place. Rerunning scripts/build_map.py
// with other settings can renumber regions; check these against a labelled render if it does.
import type { Lang } from "./i18n";

const names: [string, string, string][] = [
  ["시든 땅", "Withered Lands", "凋零之地"], // 0 blighted plain, dead trees, grey lake
  ["북쪽 해안 언덕", "North Shore Hills", "北岸丘陵"], // 1
  ["안개숲 섬", "Mistwood Isle", "霧林島"], // 2 forested island in the northwest
  ["동쪽 늪 해안", "East Marsh Coast", "東沼海岸"], // 3
  ["자색 골짜기", "Violet Glen", "紫色谷地"], // 4
  ["북쪽 바위 언덕", "Northern Crags", "北方岩丘"], // 5
  ["북쪽 평원", "Northern Plains", "北方平原"], // 6
  ["검은 솔숲", "Blackpine Forest", "黑松林"], // 7
  ["자색 숲", "Violet Wood", "紫色森林"], // 8 purple forest
  ["호숫가 숲", "Lakeside Woods", "湖畔森林"], // 9
  ["서쪽 숲길", "Western Woodpath", "西方林道"], // 10
  ["흰 봉우리 산맥", "Whitepeak Range", "白峰山脈"], // 11 snow mountains
  ["서쪽 산기슭", "Western Foothills", "西方山麓"], // 12
  ["붉은 절벽", "Red Cliffs", "赤色懸崖"], // 13
  ["동쪽 해안 고원", "East Coast Highlands", "東岸高原"], // 14
  ["얼음 고개", "Icegate Pass", "冰門隘口"], // 15
  ["푸른 언덕", "Green Hills", "青色丘陵"], // 16
  ["서쪽 초원 언덕", "West Grass Hills", "西方草丘"], // 17
  ["황금 초원", "Golden Plains", "黃金草原"], // 18 savanna
  ["협곡 어귀", "Canyon Gate", "峽谷入口"], // 19
  ["밀밭 평야", "Wheatfield Plains", "麥田平原"], // 20 farmland
  ["붉은 협곡", "Red Canyon", "赤色峽谷"], // 21
  ["불타는 산", "Burning Mountain", "燃燒之山"], // 22 volcano
  ["깊은 숲", "Deepwood", "深林"], // 23
  ["모래바람 고개", "Sandwind Pass", "沙風隘口"], // 24
  ["분지 절벽", "Crater Rim", "盆地崖緣"], // 25
  ["모래 사막", "Sand Desert", "沙漠"], // 26
  ["동쪽 늪지", "Eastern Marsh", "東方沼澤"], // 27
  ["남서 모래언덕", "Southwest Dunes", "西南沙丘"], // 28
  ["깊은 분지", "Deep Crater", "深谷盆地"], // 29 jungle crater
  ["서쪽 밀림", "West Jungle", "西方叢林"], // 30
  ["남서 해안", "Southwest Coast", "西南海岸"], // 31
  ["남쪽 밀림", "South Jungle", "南方叢林"], // 32
  ["남동 밀림 해안", "Southeast Jungle Coast", "東南叢林海岸"], // 33
  ["동쪽 해안 밀림", "East Shore Jungle", "東岸叢林"], // 34
  ["남쪽 정글 반도", "Southern Jungle Cape", "南方叢林半島"], // 35
  ["남쪽 해안 사구", "South Coast Dunes", "南岸沙丘"], // 36
];

export const regionCount = names.length;

export function regionNames(lang: Lang): string[] {
  const i = lang === "ko" ? 0 : lang === "en" ? 1 : 2;
  return names.map((n) => n[i]);
}

// URL slug per region, from the English name ("Burning Mountain" -> "burning-mountain")
export const regionSlugs: string[] = names.map((n) => n[1].toLowerCase().replace(/ /g, "-"));
