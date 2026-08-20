/**
 * Live-site fidelity compare tool (ADR-0004): diffs computed styles and
 * geometry between the live site and local dev server via a per-page
 * selector-pair map (DOMs don't match 1:1). Diagnostic only, not a test --
 * excluded from `npm test`, exits 0 regardless of drift found.
 *
 * Usage: npm run compare -- <page>
 */
import { chromium } from "@playwright/test";

const LIVE_ORIGIN = "https://cascadiajs.com";
const LOCAL_ORIGIN = "http://localhost:4321";
const VIEWPORT = { width: 1280, height: 720 };
const PX_TOLERANCE = 1;

// Style properties compared: typography, color, spacing.
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

// page key -> { path, pairs }; each pair maps a live selector to its local
// counterpart.
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
      // Home renders the flat "Past Sponsors" section; the tiered grid
      // isn't shown on any page yet so it's not compared here.
      {
        label: "sponsors section (.landing padding, centered)",
        live: "#sponsors",
        local: "#sponsors",
      },
      {
        label: "sponsors heading (Past Sponsors, 48px)",
        live: "#sponsors h1",
        local: "#sponsors h1",
      },
      {
        label: "sponsors flat logo (60px md height)",
        live: "#sponsors .sponsors-grid div img",
        local: "#sponsors img",
      },
      {
        label: "sponsors CTA (Sponsor Our Event)",
        live: "#sponsors .cta a",
        local: "#sponsors a[href='/2026/sponsor']",
      },
    ],
  },
  welcome: {
    path: "/welcome",
    pairs: [
      {
        label: "page-title bar",
        live: "simple-page .page-title",
        local: ".page-title",
      },
      {
        label: "page-title heading",
        live: "simple-page .page-title h1",
        local: ".page-title h1",
      },
      {
        label: "page body column",
        live: "simple-page .page-body",
        local: ".page-body",
      },
      {
        label: "body heading: CascadiaJS",
        live: "simple-page .page-body h2",
        local: ".page-body h2",
      },
      {
        label: "body list link: CascadiaJS Discord Community",
        live: "simple-page .page-body a[href='https://discord.gg/kkYR86GM29']",
        local: ".page-body a[href='https://discord.gg/kkYR86GM29']",
      },
      {
        label: "body image",
        live: "simple-page .page-body img",
        local: ".page-body img",
      },
    ],
  },
  // Legacy uses hand-rolled classes with no Astro equivalent, so most local
  // selectors below are structural (ids, text/href) rather than class-based.
  //
  // Known ~20px rect.y drift on most pairs: every live /2026/* page swaps
  // in a taller Event-specific nav bar (`<nav-2026>`) that this port
  // doesn't build (out of scope, shared chrome) -- confirmed the
  // title-bar/body implementation itself is pixel-correct via /welcome's
  // zero-drift pair.
  schedule: {
    path: "/dev/schedule",
    pairs: [
      {
        label: "page-title bar",
        live: "simple-page .page-title",
        local: ".page-title",
      },
      {
        label: "page-title heading",
        live: "simple-page .page-title h1",
        local: ".page-title h1",
      },
      {
        // ~138px rect.height drift over ~8000px is accumulated sub-pixel/
        // line-height rounding, not missing content -- element/text counts
        // match exactly.
        label: "page body column (wide, 70%)",
        live: "simple-page .page-body",
        local: ".page-body",
      },
      {
        // rect.height drifts hugely by design: the reference leaves this
        // Day's `<div>` unclosed, so later Days become its DOM children
        // live. Our clean sibling structure doesn't replicate that
        // (ADR-0001) -- visual order matches, only the broken nesting doesn't.
        label: "a day block (May 29 / Cascadia AI Hackathon)",
        live: "#cascadia-ai-hackathon",
        local: "#cascadia-ai-hackathon",
      },
      {
        label: "a day header (May 29)",
        live: "#cascadia-ai-hackathon .day-header",
        local: "#cascadia-ai-hackathon > div:first-child",
      },
      {
        // font-family and background-color drift are tooling false
        // positives: font-family differs only because the shared
        // --font-display token picks one fallback for a legacy rule with
        // none; background-color is the same colour reported in different
        // colour spaces (Tailwind v4's OKLab color-mix vs. legacy rgba).
        label: "a location band (May 29, TBD)",
        live: "#cascadia-ai-hackathon .location",
        local: "#cascadia-ai-hackathon > div:nth-child(2)",
      },
      {
        label: "a show-item row (May 29, Cascadia AI Hackathon)",
        live: "#cascadia-ai-hackathon .show-item",
        local: "#cascadia-ai-hackathon .m-4.flex",
      },
      {
        // ~2px width/x drift here and on Hallway below: sub-pixel
        // flex-basis rounding dividing the row three ways, invisible in
        // practice.
        label: "track heading: Main Track (June 1)",
        live: "#day-one .main.track h3",
        local: '#day-one h3:has-text("Main Track")',
      },
      {
        label: "track heading: Hallway Track (June 1)",
        live: "#day-one .hallway.track h3",
        local: '#day-one h3:has-text("Hallway Track")',
      },
      {
        label: "track heading: Workshop Track (June 1)",
        live: "#day-one .workshop.track h3",
        local: '#day-one h3:has-text("Workshop Track")',
      },
      {
        // Identical selector works: same href both sides.
        label: "a talk row's title link (Practical Refactors...)",
        live: "a[href='/2026/talks/practical-refactors-with-modern-css-colors']",
        local:
          "a[href='/2026/talks/practical-refactors-with-modern-css-colors']",
      },
      {
        label: "a talk row's time cell (Practical Refactors..., 11:00am)",
        live: ".show-item:has(a[href='/2026/talks/practical-refactors-with-modern-css-colors']) .when",
        local:
          ".m-4.flex:has(a[href='/2026/talks/practical-refactors-with-modern-css-colors']) .mr-4",
      },
      {
        label: "keynote badge (Day One Opening Keynote)",
        live: ".keynote-badge",
        local: '[class*="emerald-city-green"][class*="rounded"]',
      },
      {
        label: "a CTA (Hackathon Register)",
        live: "text=Register",
        local: "text=Register",
      },
      {
        label: "Hallway sponsor logo wall image (width: 100%)",
        live: "#day-one .hallway .sponsors img",
        local: '#day-one h3:has-text("Hallway Track") ~ div img[alt$=" logo"]',
      },
      {
        // ~4.5px height drift, despite matching width/margin -- the
        // sponsor logo asset's own intrinsic aspect ratio. Assets out of
        // scope; left as a documented sub-5px residual.
        label: "Hallway sponsor logo wall wrapper (32px bottom margin)",
        live: "#day-one .hallway .sponsors > div",
        local:
          '#day-one h3:has-text("Hallway Track") ~ div div:has(> a > img[alt$=" logo"])',
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

/** Computed styles + bounding box for the first match, or null. */
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
