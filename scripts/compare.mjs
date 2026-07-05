/**
 * Live-site fidelity compare tool (ADR-0004).
 *
 * Compares computed styles and element geometry between the live legacy site
 * (https://cascadiajs.com) and the local Astro dev server, using an explicit
 * per-page map of corresponding selector pairs (the Enhance DOM and the Astro
 * DOM do not match one-to-one).
 *
 * Usage: npm run compare -- <page>   (e.g. npm run compare -- home)
 *
 * This is an on-demand diagnostic report, not a test: it is network-dependent
 * and intentionally excluded from `npm test`. Exit code is 0 even when drift
 * is found.
 */
import { chromium } from "@playwright/test";

const LIVE_ORIGIN = "https://cascadiajs.com";
const LOCAL_ORIGIN = "http://localhost:4321";
const VIEWPORT = { width: 1280, height: 720 };
const PX_TOLERANCE = 1;

/**
 * Curated computed-style properties to compare (typography, color, spacing).
 */
const STYLE_PROPS = [
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "color",
  "background-color",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "text-transform",
  "text-align",
];

/**
 * Page map: page key -> { path, pairs }.
 * Each pair names a live (Enhance DOM) selector and its local (Astro DOM)
 * counterpart. Add an entry per page as it gets ported.
 */
const PAGES = {
  home: {
    path: "/",
    pairs: [
      { label: "body", live: "body", local: "body" },
      {
        label: "header alert banner",
        live: "main-header header section.alert",
        local: "header > div:first-child",
      },
      {
        label: "primary nav",
        live: "main-header header nav.primary",
        local: "header nav",
      },
      {
        label: "logo image",
        live: "#logo img",
        local: "#logo img",
      },
      {
        label: "nav link: CascadiaJS 2026",
        live: "main-header header nav a[href='/2026']",
        local: "header nav a[href='/2026']",
      },
      {
        label: "nav link: Newsletter",
        live: "main-header header nav a[href='/mailing-list']",
        local: "header nav a[href='/mailing-list']",
      },
      {
        label: "nav link: Code of Conduct",
        live: "main-header header nav a[href='/code-of-conduct']",
        local: "header nav a[href='/code-of-conduct']",
      },
      {
        label: "hero heading",
        live: "#hero h2",
        local: "main h2",
      },
      {
        label: "hero pre-header",
        live: "#hero .pre-header",
        local: "main article div",
      },
      {
        label: "hero CTA box",
        live: "#hero .cta",
        local: "main article div:has(> a[href='/2026'])",
      },
      {
        label: "hero CTA text",
        live: "#hero .cta a",
        local: "main a[href='/2026']",
      },
      {
        label: "trailer heading",
        live: "#trailer h1",
        local: "main h1",
      },
      { label: "footer", live: "footer", local: "footer" },
      {
        label: "footer tagline heading",
        live: "footer #when-where h2",
        local: "footer section:first-of-type h2",
      },
      {
        label: "footer link: Privacy Policy",
        live: "footer a[href='/privacy']",
        local: "footer a[href='/privacy']",
      },
      {
        label: "footer link: 2025 event",
        live: "footer a[href='/2025']",
        local: "footer a[href='/2025']",
      },
    ],
  },
};

function usage() {
  console.error("Usage: npm run compare -- <page>");
  console.error(`Available pages: ${Object.keys(PAGES).join(", ")}`);
}

async function assertLocalServerReachable() {
  try {
    await fetch(LOCAL_ORIGIN, { signal: AbortSignal.timeout(5000) });
  } catch {
    console.error(
      `Error: local dev server is not reachable at ${LOCAL_ORIGIN}.`,
    );
    console.error("Start it with `npm run dev` and re-run the compare.");
    process.exit(1);
  }
}

/**
 * Extract computed styles + bounding box from the first element matching
 * `selector`, or null if no element matches.
 */
async function snapshot(page, selector) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) return null;
  return locator.evaluate((el, props) => {
    const computed = getComputedStyle(el);
    const styles = {};
    for (const prop of props) styles[prop] = computed.getPropertyValue(prop);
    const rect = el.getBoundingClientRect();
    return {
      styles,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    };
  }, STYLE_PROPS);
}

/** Parse a CSS value as a pixel number, or NaN if it isn't one. */
function asPx(value) {
  const match = /^(-?\d+(?:\.\d+)?)px$/.exec(String(value).trim());
  return match ? Number(match[1]) : NaN;
}

function valuesDiffer(liveValue, localValue) {
  if (liveValue === localValue) return false;
  const livePx = asPx(liveValue);
  const localPx = asPx(localValue);
  if (!Number.isNaN(livePx) && !Number.isNaN(localPx)) {
    return Math.abs(livePx - localPx) > PX_TOLERANCE;
  }
  return true;
}

function formatPx(n) {
  return `${Math.round(n * 100) / 100}px`;
}

function comparePair(label, live, local) {
  const lines = [];

  for (const prop of STYLE_PROPS) {
    if (valuesDiffer(live.styles[prop], local.styles[prop])) {
      lines.push(
        `    ${prop}: live=${live.styles[prop]}  local=${local.styles[prop]}`,
      );
    }
  }

  for (const dim of ["x", "y", "width", "height"]) {
    if (Math.abs(live.rect[dim] - local.rect[dim]) > PX_TOLERANCE) {
      lines.push(
        `    rect.${dim}: live=${formatPx(live.rect[dim])}  local=${formatPx(local.rect[dim])}`,
      );
    }
  }

  if (lines.length === 0) {
    console.log(`  OK   ${label}`);
  } else {
    console.log(`  DRIFT ${label} (${lines.length} differences)`);
    for (const line of lines) console.log(line);
  }
  return lines.length;
}

async function main() {
  const pageKey = process.argv[2];
  if (!pageKey || !PAGES[pageKey]) {
    usage();
    process.exit(1);
  }
  const { path, pairs } = PAGES[pageKey];

  await assertLocalServerReachable();

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const livePage = await context.newPage();
    const localPage = await context.newPage();

    console.log(
      `Comparing "${pageKey}" (${path}) at ${VIEWPORT.width}x${VIEWPORT.height}`,
    );
    console.log(`  live:  ${LIVE_ORIGIN}${path}`);
    console.log(`  local: ${LOCAL_ORIGIN}${path}`);
    console.log("");

    await livePage.goto(`${LIVE_ORIGIN}${path}`, { waitUntil: "load" });
    await localPage.goto(`${LOCAL_ORIGIN}${path}`, { waitUntil: "load" });
    // Ensure web fonts are settled on both pages before reading styles.
    await livePage.evaluate(() => document.fonts.ready);
    await localPage.evaluate(() => document.fonts.ready);

    let totalDrift = 0;
    for (const { label, live, local } of pairs) {
      const [liveSnap, localSnap] = await Promise.all([
        snapshot(livePage, live),
        snapshot(localPage, local),
      ]);

      if (!liveSnap || !localSnap) {
        if (!liveSnap) {
          console.log(
            `  MISSING ${label}: no live element matches \`${live}\``,
          );
        }
        if (!localSnap) {
          console.log(
            `  MISSING ${label}: no local element matches \`${local}\``,
          );
        }
        totalDrift += 1;
        continue;
      }

      totalDrift += comparePair(label, liveSnap, localSnap) > 0 ? 1 : 0;
    }

    console.log("");
    console.log(
      totalDrift === 0
        ? `All ${pairs.length} element pairs match within tolerance.`
        : `${totalDrift} of ${pairs.length} element pairs drifted (tolerance ${PX_TOLERANCE}px).`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Compare tool failed:", error);
  process.exit(1);
});
