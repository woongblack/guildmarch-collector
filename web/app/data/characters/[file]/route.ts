// Character search index per region (roadmap 7): name, character id, guild id, level. Fetched by
// the search page only when someone searches, so other pages don't carry it.
import { characterIndex, regions } from "@/lib/data";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return regions.map((r) => ({ file: `${r}.json` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const region = file.replace(/\.json$/, "") as (typeof regions)[number];
  return Response.json(regions.includes(region) ? characterIndex(region) : []);
}
