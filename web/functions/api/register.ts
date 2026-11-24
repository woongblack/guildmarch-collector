// Cloudflare Pages Function: POST /api/register. Secrets are set on the Pages project.
import { handleRegister, type Env } from "../../server/handlers.ts";

export const onRequestPost = ({ request, env }: { request: Request; env: Env }) => handleRegister(request, env);
