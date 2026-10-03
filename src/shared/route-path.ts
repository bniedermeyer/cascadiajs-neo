/**
 * The page's route path: no `.html` suffix and no trailing slash (the root
 * stays "/"). With `build.format: "file"`, `Astro.url.pathname` includes
 * `.html` during the build (`/2026/attend.html`, `/index.html`) but not in dev or preview,
 * so layouts read the path through this instead of `Astro.url.pathname`.
 */
export function routePath(url: URL): string {
  const path = url.pathname
    .replace(/\/index\.html$/, "/")
    .replace(/\.html$/, "")
    .replace(/\/+$/, "");
  return path === "" ? "/" : path;
}
