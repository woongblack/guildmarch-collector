// Cloudflare Pages Function: GET /api/live, recently viewed guilds and visitors now (R-46)
import { handleLive, type LiveEnv } from "../../server/live.ts";

export const onRequestGet = ({ env }: { env: LiveEnv }) => handleLive(env);
