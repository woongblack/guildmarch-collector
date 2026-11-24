// The standings summary the next build compares against (lib/digest.ts, roadmap 5)
import { published } from "@/lib/digest";

export const dynamic = "force-static";

export function GET() {
  return Response.json(published());
}
