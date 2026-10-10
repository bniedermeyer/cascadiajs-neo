import type { APIRoute } from "astro";
import { isLiveSite } from "@shared/live-site";

const liveRobotsTxt = (sitemapURL: URL) => `\
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

const nonLiveRobotsTxt = `\
User-agent: *
Disallow: /
`;

export const GET: APIRoute = ({ site }) =>
  new Response(
    isLiveSite()
      ? liveRobotsTxt(new URL("sitemap-index.xml", site))
      : nonLiveRobotsTxt,
  );
