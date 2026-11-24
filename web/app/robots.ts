import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// Search engines and AI answer engines may read every public page. AI training crawlers may not:
// the pages show guild and character data from the Blizzard API, which isn't ours to hand on for
// model training (the same choice as the Cloudflare zone setting, 2026-11-09). /api/ is the
// register and removal-request functions, nothing to read.
const answerBots = ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"];
const trainingBots = ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot", "Applebot-Extended", "Bytespider", "meta-externalagent"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      // Crawlers follow only the most specific group that names them, so the /api/ rule repeats
      { userAgent: answerBots, allow: "/", disallow: "/api/" },
      { userAgent: trainingBots, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
