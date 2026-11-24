// Cloudflare Pages Function: POST /api/opt-out. Secrets are set on the Pages project.
import { handleOptOut, type Env } from "../../server/handlers.ts";

export const onRequestPost = ({ request, env }: { request: Request; env: Env }) => handleOptOut(request, env);
