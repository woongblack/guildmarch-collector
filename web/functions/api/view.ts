// Cloudflare Pages Function: POST /api/view, one page view for the live strip (R-46)
import { handleView, type LiveEnv } from "../../server/live.ts";

export const onRequestPost = ({ request, env }: { request: Request; env: LiveEnv }) => handleView(request, env);
