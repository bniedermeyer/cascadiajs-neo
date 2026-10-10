import process from "node:process";

/**
 * Whether this build is the live site (ADR-0014): a Netlify production build
 * whose main address is on cascadiajs.com. Build-time only; import it from
 * server-side or build-time code, never from client scripts.
 */
export function isLiveSite(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.CONTEXT !== "production" || !env.URL) {
    return false;
  }
  try {
    return new URL(env.URL).hostname === "cascadiajs.com";
  } catch {
    return false;
  }
}
