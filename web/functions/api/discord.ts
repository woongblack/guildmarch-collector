// Cloudflare Pages Function: POST /api/discord. Secrets are set on the Pages project.
import { handleDiscord, type Env } from "../../server/handlers.ts";

export const onRequestPost = ({ request, env }: { request: Request; env: Env }) => handleDiscord(request, env);
