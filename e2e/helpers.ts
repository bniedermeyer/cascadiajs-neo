import { readdirSync } from "node:fs";
import { join } from "node:path";

/** Every file under `dir` (recursively) matching `pattern`, as `dir`-relative paths. */
export function filesUnder(dir: string, pattern: RegExp): string[] {
  return (readdirSync(dir, { recursive: true, encoding: "utf8" }) as string[])
    .filter((file) => pattern.test(file))
    .sort();
}

/**
 * Every built page's `dist/`-relative path. The preview webServer builds
 * first, so `dist/` always reflects the site.
 */
export function builtPages(): string[] {
  return filesUnder("dist", /\.html$/);
}

export const distPath = (file: string) => join("dist", file);
