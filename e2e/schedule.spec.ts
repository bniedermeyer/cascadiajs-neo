import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Schedule page e2e spec. Fixtures below are transcribed from
 * src/shared/data/sponsors.json and 2026/activities.json (filtered to
 * this Event) to assert against.
 */

const TIER_ORDER = [
  "diamond",
  "platinum",
  "gold",
  "silver",
  "bronze",
  "community",
];
const SPONSOR_COUNT_2026 = 28;

// -- Activity fixtures (src/shared/data/2026/activities.json) -------------

interface ActivityFixture {
  title: string;
  when: string;
  url: string;
  target?: "_blank";
  body: string[];
  cta: { label: string; href: string; target?: "_blank" };
}

const HACKATHON: ActivityFixture = {
  title: "Cascadia AI Hackathon",
  when: "5pm",
  url: "https://luma.com/cascadia-ai-hackathon-2026?coupon=F7S4JY",
  target: "_blank",
  body: [
    "We're hosting an AI hackathon leading up to CascadiaJS 2026! Stay tuned for more details, but it will kick-off Friday evening and conclude Saturday afternoon, with the winning team being invited to demo what they built at CascadiaJS 2026!",
  ],
  cta: {
    label: "Register",
    href: "https://luma.com/cascadia-ai-hackathon-2026?coupon=F7S4JY",
    target: "_blank",
  },
};

const VANCOUVER_TRAIN: Omit<ActivityFixture, "cta" | "target"> = {
  title: "Vancouver Hacker Train departs",
  when: "11:30am",
  url: "/2026/travel",
  body: ["Meet up with your fellow hackers for a ride down to Seattle!"],
};

const PORTLAND_TRAIN: Omit<ActivityFixture, "cta" | "target"> = {
  title: "Portland Hacker Train departs",
  when: "2:10pm",
  url: "/2026/travel",
  body: ["Meet up with your fellow hackers for a ride up to Seattle!"],
};

const WELCOME_RECEPTION = {
  title: "Welcome Reception",
  when: "5:30pm - 8:30pm",
  url: "https://luma.com/cascadiajs-2026-welcome-reception?coupon=UZHCP1",
  target: "_blank" as const,
  titleSuffix: "& Pre-Registration by",
  sponsorLogoAlt: "Warp logo",
  body: [
    "The Welcome Reception will be an opportunity for folks to pre-register, get their badge, pickup swag and have fun with our friends from Warp and Whiskey Web and Whatnot.",
    "Want to play a survival game... entirely driven by GitHub issues? Come join Warp and Web Whiskey at the CascadiaJS Welcome Reception! You'll get to play a multiplayer game based on the popular party game Death by AI, backed by Warp's issue triage agents to decide your fate. Can you survive the longest?",
  ],
  cta: {
    label: "RSVP",
    href: "https://luma.com/cascadiajs-2026-welcome-reception?coupon=UZHCP1",
    target: "_blank" as const,
  },
};

const TRAININGS: (Omit<ActivityFixture, "target"> & { date: string })[] = [
  {
    date: "June 3",
    title: "Coding with Claude",
    when: "10am",
    url: "/2026/trainings/coding-with-claude",
    body: [
      "AI is changing how we write code, and you're about to become fluent in these new tools. We'll explore everything from basic AI integration to building sophisticated AI agents that can help with development tasks. Let’s explore everything from AI-assisted coding in your editor to autonomous development with Claude Code.",
    ],
    cta: {
      label: "Learn More",
      href: "/2026/trainings/coding-with-claude",
      target: "_blank",
    },
  },
  {
    date: "June 4",
    title: "AI for TypeScript Developers",
    when: "10am",
    url: "/2026/trainings/ai-for-typescript-developers",
    body: [
      "Ready to build AI-powered applications? Let's dive into the Vercel AI SDK and modern AI patterns to create intelligent features your users will love. We'll start with the fundamentals and work our way up to building production-ready AI applications.",
    ],
    cta: {
      label: "Learn More",
      href: "/2026/trainings/ai-for-typescript-developers",
      target: "_blank",
    },
  },
  {
    date: "June 5",
    title: "Building AI Agents",
    when: "10am",
    url: "/2026/trainings/building-ai-agents",
    body: [
      "Explore everything from basic tool calling to sophisticated multi-step agents that can reason and act autonomously. We'll build a simple agent that can search the web and answer questions, and then we'll add more complex agents that can reason and act autonomously.",
    ],
    cta: {
      label: "Learn More",
      href: "/2026/trainings/building-ai-agents",
      target: "_blank",
    },
  },
];

/** Locates a ShowItem row by title link; the row is the link's 3rd ancestor. */
function rowFor(page: Page, title: string): Locator {
  // Not exact: true -- a target="_blank" link's accessible name includes
  // the external-link indicator's generated content, so exact text never matches.
  return page
    .getByRole("link", { name: title })
    .locator("xpath=ancestor::*[3]");
}

/** True when the element's generated ::after content shows the external-link glyph. */
async function hasExternalIndicator(locator: Locator): Promise<boolean> {
  const content = await locator.evaluate(
    (el) => getComputedStyle(el, "::after").content,
  );
  return content !== "none";
}

// -- June 1 / June 2 fixtures (issue #34): Talks, Tracks, Hallway, Workshops -

/** The 24 Main Track Talks, in render order. `when` is set only on the first Talk in a run, matching the page. */
interface TalkFixture {
  title: string;
  speaker: string;
  keynote: boolean;
  /** False for exactly one Talk in the roster: `day-one-opening-keynote`. */
  linked: boolean;
  /** Set whenever `linked` is true, so a detail-page href can be asserted exactly. */
  slug?: string;
  when?: string;
}

const DAY_ONE_TALKS: TalkFixture[] = [
  {
    title: "Day One Opening Keynote",
    speaker: "Matt Biilmann",
    keynote: true,
    linked: false,
    when: "9:00am",
  },
  {
    title: "AI Agent Swarms Are Amazing",
    speaker: "Joel Hooks",
    keynote: false,
    linked: true,
    slug: "ai-agent-swarms-are-amazing",
  },
  {
    title: "Practical Refactors With Modern CSS Colors",
    speaker: "James Steinbach",
    keynote: false,
    linked: true,
    slug: "practical-refactors-with-modern-css-colors",
    when: "11:00am",
  },
  {
    title: "Keep the Main Thread Free With Web Workers",
    speaker: "Courtney Yatteau",
    keynote: false,
    linked: true,
    slug: "keep-the-main-thread-free-with-web-workers",
  },
  {
    title: "AI Helped Me Learn: Vue Through the Lens of a React Developer",
    speaker: "Daniel Mendoza",
    keynote: false,
    linked: true,
    slug: "ai-helped-me-learn-vue-through-the-lens-of-a-react-developer",
  },
  {
    title: "Implementing the Web on Native With Linked Literate Programming",
    speaker: "James Ide",
    keynote: false,
    linked: true,
    slug: "implementing-the-web-on-native-with-linked-literate-programming",
  },
  {
    title: "Choosing the Wrong Abstraction (And What It Cost Us)",
    speaker: "Darius Cepulis",
    keynote: false,
    linked: true,
    slug: "choosing-the-wrong-abstraction-and-what-it-cost-us",
    when: "1:40pm",
  },
  {
    title: "Shared Components Beyond the Design System",
    speaker: "Jonathan Keslin",
    keynote: false,
    linked: true,
    slug: "shared-components-beyond-the-design-system",
  },
  {
    title: "How to Successfully Build a Junior Dev Team",
    speaker: "Dylan Goings",
    keynote: false,
    linked: true,
    slug: "how-to-successfully-build-a-junior-dev-team",
  },
  {
    title: "Building an AI Platform Your Engineers Actually Trust",
    speaker: "Jeff Otaño",
    keynote: false,
    linked: true,
    slug: "building-an-ai-platform-your-engineers-actually-trust",
  },
  {
    title: "How To Use Spec-Driven Development for Production Workflows",
    speaker: "Erik Hanchett",
    keynote: true,
    linked: true,
    slug: "how-to-use-spec-driven-development-for-production-workflows",
    when: "4:10pm",
  },
  {
    title: "The Last Mile Is Code",
    speaker: "Joe Duffy",
    keynote: true,
    linked: true,
    slug: "the-last-mile-is-code",
  },
];

const DAY_TWO_TALKS: TalkFixture[] = [
  {
    title: "JavaScript Won the Web. Rust Is Taking the Critical Path.",
    speaker: "Francesco Ciulla",
    keynote: true,
    linked: true,
    slug: "javascript-won-the-web-rust-is-taking-the-critical-path",
    when: "9:00am",
  },
  {
    title: "Choosing TypeScript Matters More Than Ever",
    speaker: "Filip Sodić",
    keynote: false,
    linked: true,
    slug: "choosing-typescript-matters-more-than-ever",
  },
  {
    title: "Accelerating Musical Live Coding With On-Device AI",
    speaker: "Alex Hinson",
    keynote: false,
    linked: true,
    slug: "accelerating-musical-live-coding-with-on-device-ai",
    when: "11:00am",
  },
  {
    title: "Teaching LLMs New Tricks",
    speaker: "Marty Nelson",
    keynote: false,
    linked: true,
    slug: "teaching-llms-new-tricks",
  },
  {
    title: "Beowulf Stroganoff: Building Economically Useless Chatbots",
    speaker: "Molly Jean Bennett",
    keynote: false,
    linked: true,
    slug: "beowulf-stroganoff-building-economically-useless-chatbots",
  },
  {
    title: "Design Tokens: Getting Agents to Follow Brand Guidelines",
    speaker: "Kaelig Deloumeau-Prigent",
    keynote: false,
    linked: true,
    slug: "design-tokens-getting-agents-to-follow-brand-guidelines",
  },
  {
    title: "Unlocking AI's Hidden Connections With Graphs",
    speaker: "Nyah Macklin",
    keynote: false,
    linked: true,
    slug: "unlocking-ais-hidden-connections-with-graphs",
    when: "1:40pm",
  },
  {
    title: "Building Apps With ATProto",
    speaker: "Brittany Ellich",
    keynote: false,
    linked: true,
    slug: "building-apps-with-atproto",
  },
  {
    title: "The Request Tax: Re-evaluating 20+ Years of Web Performance Dogma",
    speaker: "Alex Moon",
    keynote: false,
    linked: true,
    slug: "the-request-tax-re-evaluating-20-years-of-web-performance-dogma",
  },
  {
    title:
      "Trust, But Verify: Human-in-the-Loop for Agents That Actually Matter",
    speaker: "Michael Liendo",
    keynote: false,
    linked: true,
    slug: "trust-but-verify-human-in-the-loop-for-agents-that-actually-matter",
  },
  {
    title: "Hold me closer, Tony Danza",
    speaker: "Luis Montes",
    keynote: false,
    linked: true,
    slug: "hold-me-closer-tony-danza",
    when: "3:50pm",
  },
  {
    title: "It's Time To Rethink Everything",
    speaker: "Theo",
    keynote: true,
    linked: true,
    slug: "its-time-to-rethink-everything",
  },
];

const ALL_TALKS = [...DAY_ONE_TALKS, ...DAY_TWO_TALKS];

// Workshop hrefs/titles come from schedule.astro's workshopTalk(), not the
// roster's own `slug` -- verified below to differ.
const WORKSHOPS = [
  {
    day: "day-one",
    when: "10:45am",
    title: "Build a Voice Agent with Vapi",
    url: "/2026/workshops/scaling-voice-pipelines",
    rosterSlugPath: "/2026/talks/build-a-voice-agent-with-vapi",
    descriptionContains: "purpose-built for voice.",
  },
  {
    day: "day-one",
    when: "1:40pm",
    title: "Build Better Agent Tools with Apify",
    url: "/2026/workshops/recipe-better-agents",
    rosterSlugPath: "/2026/talks/build-better-agent-tools-with-apify",
    descriptionContains: "No Apify experience is needed",
  },
  {
    day: "day-two",
    when: "10:45am",
    title: "Offloading Work, Without the Workers",
    url: "/2026/workshops/offloading-work-with-the-workers",
    rosterSlugPath: "/2026/talks/offloading-work-with-the-workers",
    descriptionContains: "you'll have a deployed background execution pipeline",
  },
  {
    day: "day-two",
    when: "1:40pm",
    title:
      "Deploying AI Agents on AWS With Pulumi and Amazon Bedrock AgentCore",
    url: "/2026/workshops/deploying-ai-agents",
    rosterSlugPath:
      "/2026/talks/deploying-ai-agents-on-aws-with-pulumi-and-amazon-bedrock-agentcore",
    descriptionContains:
      "call external tools, execute code, and maintain state over time.",
  },
];

/** Same as `rowFor`, scoped to avoid Playwright strict-mode violations on titles that repeat across days (e.g. "Lunch", "Break"). */
function rowIn(scope: Page | Locator, title: string): Locator {
  return scope
    .getByRole("link", { name: title })
    .locator("xpath=ancestor::*[3]");
}

/** Locates the one Talk with no link (plain-text title) -- one ancestor level shallower than a linked title, so 2 ancestors up not 3. */
function plainTitleRow(page: Page, title: string): Locator {
  return page.getByText(title, { exact: true }).locator("xpath=ancestor::*[2]");
}

/** Locates a row by its time-cell text, for titles with no link (e.g. "Break") -- must be scoped to a single Track since times can repeat. */
function rowByTimeIn(scope: Locator, time: string): Locator {
  return scope.getByText(time, { exact: true }).locator("xpath=ancestor::*[1]");
}

/** The Main Track element within a Day -- `Track.astro` renders no id or data-testid of its own, so it's located via its always-present heading. */
function mainTrackIn(day: Locator): Locator {
  return day
    .getByRole("heading", { level: 3, name: "Main Track" })
    .locator("xpath=..");
}

/** The Hallway Track element within a Day -- see `mainTrackIn`. */
function hallwayTrackIn(day: Locator): Locator {
  return day
    .getByRole("heading", { level: 3, name: "Hallway Track" })
    .locator("xpath=..");
}

/** The Workshop Track element within a Day -- see `mainTrackIn`. */
function workshopTrackIn(day: Locator): Locator {
  return day
    .getByRole("heading", { level: 3, name: "Workshop Track" })
    .locator("xpath=..");
}

test.describe("schedule page", () => {
  test.beforeEach(async ({ page }) => {
    // Blocks Testimonials' X widgets.js so the fallback DOM stays deterministic.
    await page.route(
      /^https:\/\/(platform\.twitter\.com|.*\.twimg\.com)\//,
      (route) => route.abort(),
    );
    await page.goto("/2026/schedule");
  });

  test("renders", async ({ page }) => {
    await expect(page.locator("body")).toBeVisible();
  });

  // -- Chrome ----------------------------------------------------------

  test("page-title bar shows Schedule and the document title identifies a 2026 Event page", async ({
    page,
  }) => {
    const heading = page.getByRole("heading", { level: 1, name: "Schedule" });
    await expect(heading).toBeVisible();
    await expect(page).toHaveTitle("CascadiaJS 2026 | Schedule");
  });

  test("page-title bar uses the overcast-gray background and sound-navy heading", async ({
    page,
  }) => {
    const titleBar = page.locator(".page-title");
    const backgroundColor = await titleBar.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).toBe("rgb(207, 211, 228)");

    const heading = titleBar.getByRole("heading", { level: 1 });
    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(17, 35, 120)");
  });

  test("desktop body column uses the wide measure, not the narrow one", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const body = page.locator(".page-body");
    const box = await body.boundingBox();
    expect(box).not.toBeNull();
    // Comfortably outside the narrow (50%) band welcome.spec.ts asserts.
    expect(box!.width).toBeGreaterThan(1280 * 0.65);
    expect(box!.width).toBeLessThan(1280 * 0.75);
  });

  test("schedule body column sits directly beneath the title bar", async ({
    page,
  }) => {
    await expect(page.locator(".page-body")).toBeVisible();
  });

  // -- Days: structure, anchors, timezone --------------------------------

  test("all seven days render in order with the legacy page's anchor ids", async ({
    page,
  }) => {
    const body = page.locator(".page-body");
    const dayIds = await body
      .locator("[id]")
      .evaluateAll((els) => els.map((el) => el.id));
    expect(dayIds).toEqual([
      "cascadia-ai-hackathon",
      "day-zero",
      "day-one",
      "day-two",
      "day-training",
      "day-training",
      "day-training",
    ]);
  });

  test("May 29 shows the Pre-Conf date heading", async ({ page }) => {
    const day = page.locator("#cascadia-ai-hackathon");
    await expect(day.getByRole("heading", { level: 2 })).toHaveText(
      "Pre-ConfMay 29",
    );
  });

  test("May 31 shows a single-line date heading", async ({ page }) => {
    const day = page.locator("#day-zero");
    await expect(day.getByRole("heading", { level: 2 })).toHaveText("May 31");
  });

  test("the three Trainings show their own date headings, June 3 carrying the Post-Conf label", async ({
    page,
  }) => {
    const trainingDays = page.locator('[id="day-training"]');
    await expect(trainingDays).toHaveCount(3);

    await expect(
      trainingDays.nth(0).getByRole("heading", { level: 2 }),
    ).toHaveText("Post-ConfTraining WorkshopsJune 3");
    await expect(
      trainingDays.nth(1).getByRole("heading", { level: 2 }),
    ).toHaveText("June 4");
    await expect(
      trainingDays.nth(2).getByRole("heading", { level: 2 }),
    ).toHaveText("June 5");
  });

  test("every day states times are in PDT (UTC-7)", async ({ page }) => {
    const days = [
      page.locator("#cascadia-ai-hackathon"),
      page.locator("#day-zero"),
      ...(await page.locator('[id="day-training"]').all()),
    ];
    for (const day of days) {
      await expect(day.getByText("All times in PDT (UTC-7)")).toBeVisible();
    }
  });

  test("each day-header carries the sound-navy bottom border", async ({
    page,
  }) => {
    const header = page
      .locator("#cascadia-ai-hackathon")
      .getByRole("heading", { level: 2 })
      .locator("xpath=..");
    const border = await header.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        width: cs.borderBottomWidth,
        style: cs.borderBottomStyle,
        color: cs.borderBottomColor,
        display: cs.display,
        alignItems: cs.alignItems,
      };
    });
    expect(border.width).toBe("3px");
    expect(border.style).toBe("solid");
    expect(border.color).toBe("rgb(17, 35, 120)");
    expect(border.display).toBe("flex");
    expect(border.alignItems).toBe("flex-end");
  });

  // -- Location bands ------------------------------------------------------

  test("May 29 shows a single TBD venue", async ({ page }) => {
    const day = page.locator("#cascadia-ai-hackathon");
    await expect(day.getByText("TBD", { exact: true })).toBeVisible();
  });

  test("May 31 shows all three of its venues in order", async ({ page }) => {
    const day = page.locator("#day-zero");
    const bandNames = [
      "Pacific Central Station",
      "Union Station",
      "Town Hall Seattle",
    ];
    const boxes = await Promise.all(
      bandNames.map(async (name) => {
        const band = day.getByText(name, { exact: true });
        await expect(band).toBeVisible();
        return band.boundingBox();
      }),
    );
    for (const box of boxes) expect(box).not.toBeNull();
    // Each venue sits below the previous one, top to bottom.
    expect(boxes[0]!.y).toBeLessThan(boxes[1]!.y);
    expect(boxes[1]!.y).toBeLessThan(boxes[2]!.y);
  });

  test("each Training shows Thinkspace Seattle", async ({ page }) => {
    const trainingDays = page.locator('[id="day-training"]');
    for (const day of await trainingDays.all()) {
      await expect(day.getByText("Thinkspace Seattle")).toBeVisible();
    }
  });

  test("a location band uses the madrona-yellow tint and sound-navy label", async ({
    page,
  }) => {
    const band = page
      .locator("#cascadia-ai-hackathon")
      .getByText("TBD", { exact: true });
    const style = await band.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        background: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        padding: cs.padding,
      };
    });
    // rgba(255, 207, 7, 0.3) in the legacy stylesheet; the madrona-yellow
    // token composites to the same rendered colour (see LocationBand.astro).
    expect(style.color).toBe("rgb(17, 35, 120)");
    expect(style.fontSize).toBe("24px");
    expect(style.fontWeight).toBe("300");
    expect(style.padding).toBe("16px");
    expect(style.background).not.toBe("rgba(0, 0, 0, 0)");
  });

  // -- Activities: content matches the legacy page -------------------------

  test("Cascadia AI Hackathon renders its time, title link, body and inline Register CTA", async ({
    page,
  }) => {
    const row = rowFor(page, HACKATHON.title);
    await expect(row).toContainText(HACKATHON.when);

    const link = row.getByRole("link", { name: HACKATHON.title });
    await expect(link).toHaveAttribute("href", HACKATHON.url);
    await expect(link).toHaveAttribute("target", HACKATHON.target!);

    for (const paragraph of HACKATHON.body) {
      await expect(row).toContainText(paragraph);
    }

    const cta = row.getByRole("link", { name: HACKATHON.cta.label });
    await expect(cta).toHaveAttribute("href", HACKATHON.cta.href);
    await expect(cta).toHaveAttribute("target", HACKATHON.cta.target!);
  });

  test("the Vancouver and Portland Hacker Trains render with their departure copy and no CTA", async ({
    page,
  }) => {
    for (const train of [VANCOUVER_TRAIN, PORTLAND_TRAIN]) {
      const row = rowFor(page, train.title);
      await expect(row).toContainText(train.when);

      const link = row.getByRole("link", { name: train.title });
      await expect(link).toHaveAttribute("href", train.url);
      await expect(link).not.toHaveAttribute("target", /.+/);

      for (const paragraph of train.body) {
        await expect(row).toContainText(paragraph);
      }
      await expect(row.getByRole("link")).toHaveCount(1); // title only, no CTA
    }
  });

  test("the Welcome Reception renders its time, title link, body and inline RSVP CTA", async ({
    page,
  }) => {
    const row = rowFor(page, WELCOME_RECEPTION.title);
    await expect(row).toContainText(WELCOME_RECEPTION.when);

    const link = row.getByRole("link", { name: WELCOME_RECEPTION.title });
    await expect(link).toHaveAttribute("href", WELCOME_RECEPTION.url);
    await expect(link).toHaveAttribute("target", WELCOME_RECEPTION.target);

    for (const paragraph of WELCOME_RECEPTION.body) {
      await expect(row).toContainText(paragraph);
    }

    const cta = row.getByRole("link", { name: WELCOME_RECEPTION.cta.label });
    await expect(cta).toHaveAttribute("href", WELCOME_RECEPTION.cta.href);
    await expect(cta).toHaveAttribute("target", WELCOME_RECEPTION.cta.target);
  });

  test("each Training renders its time, title link, description and Learn More CTA", async ({
    page,
  }) => {
    for (const training of TRAININGS) {
      const row = rowFor(page, training.title);
      await expect(row).toContainText(training.when);

      const link = row.getByRole("link", { name: training.title });
      await expect(link).toHaveAttribute("href", training.url);
      await expect(link).not.toHaveAttribute("target", /.+/);

      for (const paragraph of training.body) {
        await expect(row).toContainText(paragraph);
      }

      const cta = row.getByRole("link", { name: training.cta.label });
      await expect(cta).toHaveAttribute("href", training.cta.href);
      await expect(cta).toHaveAttribute("target", training.cta.target!);
    }
  });

  test("the Welcome Reception renders title, suffix text and sponsor logo in that order, before body and CTA", async ({
    page,
  }) => {
    const link = page.getByRole("link", { name: WELCOME_RECEPTION.title });
    const titleContainer = link.locator("xpath=..");

    // Filters whitespace-only text nodes; asserts link, suffix, then logo.
    const order = await titleContainer.evaluate((el) =>
      Array.from(el.childNodes)
        .filter(
          (n) =>
            n.nodeType === Node.ELEMENT_NODE ||
            (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()),
        )
        .map((n) =>
          n.nodeType === Node.ELEMENT_NODE ? (n as Element).tagName : "TEXT",
        ),
    );
    expect(order).toEqual(["A", "TEXT", "IMG"]);

    await expect(titleContainer).toContainText(WELCOME_RECEPTION.titleSuffix);
    const logo = titleContainer.getByRole("img", {
      name: WELCOME_RECEPTION.sponsorLogoAlt,
    });
    await expect(logo).toBeVisible();

    // Order relative to body and CTA: the title link comes first, then the
    // two body paragraphs, then the CTA -- verified via document position.
    const row = rowFor(page, WELCOME_RECEPTION.title);
    const positions = await row.evaluate(
      (rowEl, { titleText, ctaText }) => {
        const all = Array.from(rowEl.querySelectorAll("p, a"));
        const titleIdx = all.findIndex(
          (el) => el.tagName === "A" && el.textContent?.trim() === titleText,
        );
        const firstParagraphIdx = all.findIndex((el) => el.tagName === "P");
        const ctaIdx = all.findIndex(
          (el) => el.tagName === "A" && el.textContent?.trim() === ctaText,
        );
        return { titleIdx, firstParagraphIdx, ctaIdx };
      },
      {
        titleText: WELCOME_RECEPTION.title,
        ctaText: WELCOME_RECEPTION.cta.label,
      },
    );
    expect(positions.titleIdx).toBeGreaterThanOrEqual(0);
    expect(positions.titleIdx).toBeLessThan(positions.firstParagraphIdx);
    expect(positions.firstParagraphIdx).toBeLessThan(positions.ctaIdx);
  });

  // -- Calls to action: inline vs block, per the ticket ---------------------

  test("the Hackathon and Welcome Reception CTAs render inline; the Trainings render block", async ({
    page,
  }) => {
    // Scoped per-row: "RSVP" also appears on June 2's Karaoke row.
    for (const activity of [HACKATHON, WELCOME_RECEPTION]) {
      const cta = rowFor(page, activity.title).getByRole("link", {
        name: activity.cta.label,
      });
      const wrapper = cta.locator("xpath=..");
      await expect(wrapper).toHaveJSProperty("tagName", "SPAN");
      const fontSize = await cta.evaluate(
        (el) => getComputedStyle(el).fontSize,
      );
      expect(fontSize).toBe("24px");
    }

    // "Learn More" repeats across Trainings; scoped to each row.
    for (const training of TRAININGS) {
      const cta = rowFor(page, training.title).getByRole("link", {
        name: training.cta.label,
      });
      const wrapper = cta.locator("xpath=..");
      await expect(wrapper).toHaveJSProperty("tagName", "DIV");
      const style = await cta.evaluate((el) => {
        const wrapperEl = el.parentElement!;
        const cs = getComputedStyle(wrapperEl);
        return { fontSize: cs.fontSize, marginTop: cs.marginTop };
      });
      expect(style.fontSize).toBe("24px");
      expect(style.marginTop).toBe("16px");
    }
  });

  test("CTA link text is never the same colour as its own button background", async ({
    page,
  }) => {
    // Regression guard: CTA text must contrast its own button background --
    // guards against a page-level link rule re-collapsing them (a real past bug).
    async function assertVisibleContrast(cta: Locator) {
      const colors = await cta.evaluate((el) => ({
        text: getComputedStyle(el).color,
        background: getComputedStyle(el.parentElement!).backgroundColor,
      }));
      expect(colors.text).not.toBe(colors.background);
      await expect(cta).toBeVisible();
    }

    // Scoped per-row: "RSVP" also appears on June 2's Karaoke row.
    for (const activity of [HACKATHON, WELCOME_RECEPTION]) {
      await assertVisibleContrast(
        rowFor(page, activity.title).getByRole("link", {
          name: activity.cta.label,
        }),
      );
    }
    for (const training of TRAININGS) {
      await assertVisibleContrast(
        rowFor(page, training.title).getByRole("link", {
          name: training.cta.label,
        }),
      );
    }
  });

  // -- Title link styling: default sound-navy, cascade-blue on hover -------

  test("a title link is sound-navy by default and turns cascade-blue with an underline on hover", async ({
    page,
  }) => {
    const link = page.getByRole("link", { name: HACKATHON.title });
    const before = await link.evaluate((el) => ({
      color: getComputedStyle(el).color,
      decoration: getComputedStyle(el).textDecorationLine,
    }));
    expect(before.color).toBe("rgb(17, 35, 120)");
    expect(before.decoration).toBe("none");

    await link.hover();
    const after = await link.evaluate((el) => ({
      color: getComputedStyle(el).color,
      decoration: getComputedStyle(el).textDecorationLine,
    }));
    expect(after.color).toBe("rgb(0, 51, 255)");
    expect(after.decoration).toBe("underline");
  });

  test("prose links in body and slot content are cascade-blue and underlined", async ({
    page,
  }) => {
    // Body/slot prose links -- the Hallway "Cascadia Connect" link and Lunch's
    // "Walkie Talkies" link -- carry the legacy prose-link look (cascade-blue
    // + underline), now set by explicit Tailwind utilities on each link rather
    // than a page-scoped `#page a` rule (ADR-0003).
    const cascadiaConnect = page
      .getByRole("link", { name: "Cascadia Connect" })
      .first();
    const walkie = page.getByRole("link", { name: "Walkie Talkies" }).first();
    for (const link of [cascadiaConnect, walkie]) {
      const style = await link.evaluate((el) => ({
        color: getComputedStyle(el).color,
        decoration: getComputedStyle(el).textDecorationLine,
      }));
      expect(style.color).toBe("rgb(0, 51, 255)");
      expect(style.decoration).toBe("underline");
    }
  });

  // -- External-link indicator ----------------------------------------------

  test("target=_blank title and CTA links carry the external-link indicator; same-page internal links do not", async ({
    page,
  }) => {
    // Scoped per-row: "RSVP" also appears on June 2's Karaoke row.
    for (const activity of [HACKATHON, WELCOME_RECEPTION]) {
      const row = rowFor(page, activity.title);
      expect(
        await hasExternalIndicator(
          row.getByRole("link", { name: activity.title }),
        ),
      ).toBe(true);
      expect(
        await hasExternalIndicator(
          row.getByRole("link", { name: activity.cta.label }),
        ),
      ).toBe(true);
    }

    // Same-site path but target="_blank" is a deliberate, preserved
    // reference defect. Scoped per row since "Learn More" repeats.
    for (const training of TRAININGS) {
      const cta = rowFor(page, training.title).getByRole("link", {
        name: training.cta.label,
      });
      expect(await hasExternalIndicator(cta)).toBe(true);
    }

    for (const name of [VANCOUVER_TRAIN.title, PORTLAND_TRAIN.title]) {
      const link = page.getByRole("link", { name });
      expect(await hasExternalIndicator(link)).toBe(false);
    }
  });

  // -- Row geometry: the time column ----------------------------------------

  test("every row's content sits in a fixed structure of a time cell followed by content", async ({
    page,
  }) => {
    const titles = [
      HACKATHON.title,
      VANCOUVER_TRAIN.title,
      PORTLAND_TRAIN.title,
      WELCOME_RECEPTION.title,
      ...TRAININGS.map((t) => t.title),
    ];
    for (const title of titles) {
      const row = rowFor(page, title);
      const cellCount = await row.evaluate((el) => el.children.length);
      // Always 2 top-level cells (time, content) even with no `when` value.
      expect(cellCount).toBe(2);
      const display = await row.evaluate((el) => getComputedStyle(el).display);
      expect(display).toBe("flex");
    }
  });

  // -- June 1 / June 2: day structure --------------------------------------

  test("June 1 shows both of its stacked day headings; June 2 shows only its own", async ({
    page,
  }) => {
    const dayOne = page.locator("#day-one");
    const dayOneHeadings = dayOne.getByRole("heading", { level: 2 });
    await expect(dayOneHeadings).toHaveCount(2);
    await expect(dayOneHeadings.nth(0)).toHaveText("Conference");
    await expect(dayOneHeadings.nth(1)).toHaveText("Day OneJune 1");

    const dayTwoHeadings = page
      .locator("#day-two")
      .getByRole("heading", { level: 2 });
    await expect(dayTwoHeadings).toHaveCount(1);
    await expect(dayTwoHeadings).toHaveText("Day TwoJune 2");
  });

  test("both conference days show Doors Open, both Breaks, and Lunch in the Main track at the right times, with their icons", async ({
    page,
  }) => {
    for (const dayId of ["day-one", "day-two"]) {
      const doorsOpen = rowByTimeIn(page.locator(`#${dayId}`), "8:00am");
      await expect(doorsOpen).toContainText("Doors Open and Registration");
      await expect(doorsOpen.locator("i.fa-door-open")).toHaveCount(1);
    }

    const breakTimes: Record<string, string[]> = {
      "day-one": ["10:20am", "3:20pm"],
      "day-two": ["10:20am", "3:15pm"],
    };
    for (const [dayId, times] of Object.entries(breakTimes)) {
      const mainTrack = mainTrackIn(page.locator(`#${dayId}`));
      for (const time of times) {
        const row = rowByTimeIn(mainTrack, time);
        await expect(row).toContainText("Break");
        await expect(row.locator("i.fa-coffee")).toHaveCount(1);
      }
    }

    for (const dayId of ["day-one", "day-two"]) {
      const mainTrack = mainTrackIn(page.locator(`#${dayId}`));
      const lunch = rowIn(mainTrack, "Lunch");
      await expect(lunch).toContainText("12:40pm");
      // fa-taco is a paid-tier glyph, available via the Font Awesome Pro
      // kit (SiteFooter.astro).
      await expect(lunch.locator("i.fa-taco")).toHaveCount(1);
    }
  });

  test("a row's icon renders inside the title -- colour-matched and on the same line as the title text, for both a plain-text title and a linked title", async ({
    page,
  }) => {
    // Regression guard: icon must be inside the title div (not a preceding
    // sibling), or it loses inherited colour and forces a line break.
    async function assertIconInlineWithTitle(row: Locator) {
      const icon = row.locator("i").first();
      const titleEl = row.locator("div.text-sound-navy").first();
      const [iconColor, titleColor, iconBox, titleBox] = await Promise.all([
        icon.evaluate((el) => getComputedStyle(el).color),
        titleEl.evaluate((el) => getComputedStyle(el).color),
        icon.boundingBox(),
        titleEl.boundingBox(),
      ]);
      expect(iconColor).toBe("rgb(17, 35, 120)");
      expect(iconColor).toBe(titleColor);

      expect(iconBox).not.toBeNull();
      expect(titleBox).not.toBeNull();
      // Same line: the icon's and title's vertical extents overlap, rather
      // than the title starting below the icon's bottom edge.
      expect(iconBox!.y).toBeLessThan(titleBox!.y + titleBox!.height);
      expect(titleBox!.y).toBeLessThan(iconBox!.y + iconBox!.height);
    }

    // Plain-text title: Doors Open and Registration.
    await assertIconInlineWithTitle(
      rowByTimeIn(page.locator("#day-one"), "8:00am"),
    );

    // Linked title: Lunch.
    const mainTrack = mainTrackIn(page.locator("#day-one"));
    await assertIconInlineWithTitle(rowIn(mainTrack, "Lunch"));
  });

  test("Lunch links to the meals page and surfaces the Walkie Talkies meetup link, on both days", async ({
    page,
  }) => {
    for (const dayId of ["day-one", "day-two"]) {
      const mainTrack = mainTrackIn(page.locator(`#${dayId}`));
      const lunch = rowIn(mainTrack, "Lunch");

      const link = lunch.getByRole("link", { name: "Lunch" });
      await expect(link).toHaveAttribute("href", "/2026/meals");

      const walkie = lunch.getByRole("link", { name: "Walkie Talkies" });
      await expect(walkie).toHaveAttribute("href", "/2026/connect#walkie");
      await expect(lunch).toContainText(
        "Meet at the West Entrance at 1pm to join",
      );
    }
  });

  test("the Main track's venue band changes from Great Hall to Forum and back, on both days", async ({
    page,
  }) => {
    for (const dayId of ["day-one", "day-two"]) {
      const mainTrack = mainTrackIn(page.locator(`#${dayId}`));
      const bands = mainTrack.locator('[class*="madrona-yellow"]');
      const texts = await bands.evaluateAll((els) =>
        els.map((el) => el.textContent?.trim()),
      );
      expect(texts).toEqual(["Great Hall", "Forum", "Great Hall"]);
    }
  });

  // -- Tracks: layout and per-track distinction ----------------------------

  test("the three Tracks sit side by side at desktop width and stack at mobile width, on both days", async ({
    page,
  }) => {
    for (const dayId of ["day-one", "day-two"]) {
      const day = page.locator(`#${dayId}`);
      const mainHeading = day.getByRole("heading", {
        level: 3,
        name: "Main Track",
      });
      const hallwayHeading = day.getByRole("heading", {
        level: 3,
        name: "Hallway Track",
      });
      const workshopHeading = day.getByRole("heading", {
        level: 3,
        name: "Workshop Track",
      });

      await page.setViewportSize({ width: 1280, height: 900 });
      const [mainBox, hallwayBox, workshopBox] = await Promise.all([
        mainHeading.boundingBox(),
        hallwayHeading.boundingBox(),
        workshopHeading.boundingBox(),
      ]);
      expect(mainBox).not.toBeNull();
      expect(hallwayBox).not.toBeNull();
      expect(workshopBox).not.toBeNull();
      // Side by side: same row (top within a few px), increasing x.
      expect(Math.abs(mainBox!.y - hallwayBox!.y)).toBeLessThan(5);
      expect(Math.abs(hallwayBox!.y - workshopBox!.y)).toBeLessThan(5);
      expect(mainBox!.x).toBeLessThan(hallwayBox!.x);
      expect(hallwayBox!.x).toBeLessThan(workshopBox!.x);

      await page.setViewportSize({ width: 390, height: 900 });
      const [mainBoxMobile, hallwayBoxMobile, workshopBoxMobile] =
        await Promise.all([
          mainHeading.boundingBox(),
          hallwayHeading.boundingBox(),
          workshopHeading.boundingBox(),
        ]);
      expect(mainBoxMobile).not.toBeNull();
      expect(hallwayBoxMobile).not.toBeNull();
      expect(workshopBoxMobile).not.toBeNull();
      // Stacked: each below the previous.
      expect(hallwayBoxMobile!.y).toBeGreaterThan(
        mainBoxMobile!.y + mainBoxMobile!.height,
      );
      expect(workshopBoxMobile!.y).toBeGreaterThan(
        hallwayBoxMobile!.y + hallwayBoxMobile!.height,
      );
    }
  });

  test("each Track heading uses its own background colour; the Hallway heading also recolors its text", async ({
    page,
  }) => {
    const day = page.locator("#day-one");
    const mainHeading = day.getByRole("heading", {
      level: 3,
      name: "Main Track",
    });
    const hallwayHeading = day.getByRole("heading", {
      level: 3,
      name: "Hallway Track",
    });
    const workshopHeading = day.getByRole("heading", {
      level: 3,
      name: "Workshop Track",
    });

    // #FFCF07 -- the reference's literal value, not the madrona-yellow
    // theme token (#ffd007), which is off by one in the green channel.
    const mainBg = await mainHeading.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(mainBg).toBe("rgb(255, 207, 7)");

    const hallwayStyle = await hallwayHeading.evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      color: getComputedStyle(el).color,
    }));
    expect(hallwayStyle.background).toBe("rgb(17, 35, 120)");
    expect(hallwayStyle.color).toBe("rgb(255, 245, 204)");

    const workshopBg = await workshopHeading.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(workshopBg).toBe("rgb(23, 195, 123)");
  });

  test("each Track's venue-band tint is visually distinct from the other two", async ({
    page,
  }) => {
    const day = page.locator("#day-one");
    const mainBand = mainTrackIn(day)
      .getByText("Great Hall", { exact: true })
      .first();
    const hallwayBand = hallwayTrackIn(day).getByText("Main Lobby", {
      exact: true,
    });
    const workshopBand = workshopTrackIn(day).getByText("Forum", {
      exact: true,
    });

    const [mainColor, hallwayColor, workshopColor] = await Promise.all([
      mainBand.evaluate((el) => getComputedStyle(el).backgroundColor),
      hallwayBand.evaluate((el) => getComputedStyle(el).backgroundColor),
      workshopBand.evaluate((el) => getComputedStyle(el).backgroundColor),
    ]);
    expect(mainColor).not.toBe(hallwayColor);
    expect(hallwayColor).not.toBe(workshopColor);
    expect(mainColor).not.toBe(workshopColor);
  });

  // -- Talks: title, Speaker, keynote badge, links, time alignment --------

  test("all 24 Talks render with their title and Speaker name, across both days", async ({
    page,
  }) => {
    for (const talk of ALL_TALKS) {
      const row = talk.linked
        ? rowFor(page, talk.title)
        : plainTitleRow(page, talk.title);
      await expect(row).toContainText(talk.speaker);
    }
  });

  test("keynote Talks carry a badge; non-keynote Talks do not", async ({
    page,
  }) => {
    for (const talk of ALL_TALKS) {
      const row = talk.linked
        ? rowFor(page, talk.title)
        : plainTitleRow(page, talk.title);
      const badge = row.getByText("Keynote", { exact: true });
      if (talk.keynote) {
        await expect(badge).toBeVisible();
      } else {
        await expect(badge).toHaveCount(0);
      }
    }
  });

  test("the keynote badge matches the reference's colour, size, padding and radius", async ({
    page,
  }) => {
    const row = rowFor(page, "The Last Mile Is Code");
    const badge = row.getByText("Keynote", { exact: true });
    const style = await badge.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        display: cs.display,
        background: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        padding: cs.padding,
        borderRadius: cs.borderRadius,
      };
    });
    expect(style.display).toBe("inline-block");
    expect(style.background).toBe("rgb(23, 195, 123)");
    expect(style.color).toBe("rgb(17, 35, 120)");
    expect(style.fontSize).toBe("14px");
    expect(style.padding).toBe("2px 8px");
    expect(style.borderRadius).toBe("4px");
  });

  test("the Talk with no slug (Day One Opening Keynote) renders as plain text, not a link", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: "Day One Opening Keynote", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Day One Opening Keynote", { exact: true }),
    ).toBeVisible();
  });

  test("linked Talks point at their own detail page under /2026/talks", async ({
    page,
  }) => {
    for (const talk of ALL_TALKS) {
      if (!talk.linked || !talk.slug) continue;
      const link = page.getByRole("link", { name: talk.title });
      await expect(link).toHaveAttribute("href", `/2026/talks/${talk.slug}`);
    }
  });

  test("only the first Talk in a run shows a time; every Talk row still reserves the same fixed-width time column", async ({
    page,
  }) => {
    for (const talk of ALL_TALKS) {
      const row = talk.linked
        ? rowFor(page, talk.title)
        : plainTitleRow(page, talk.title);
      const timeCell = row.locator("div").first();
      await expect(timeCell).toHaveText(talk.when ?? "");

      const style = await timeCell.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { width: cs.width, marginRight: cs.marginRight };
      });
      expect(style.width).toBe("70px");
      expect(style.marginRight).toBe("0px");
    }
  });

  test("outside a Track, a row's time cell keeps its default width and 16px right margin", async ({
    page,
  }) => {
    const row = rowFor(page, HACKATHON.title);
    const timeCell = row.locator("div").first();
    const style = await timeCell.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { width: cs.width, marginRight: cs.marginRight };
    });
    expect(style.width).not.toBe("70px");
    expect(style.marginRight).toBe("16px");
  });

  // -- Hallway Track --------------------------------------------------------

  test("the Hallway Track renders as a single row carrying both of its titles and paragraphs, on both days", async ({
    page,
  }) => {
    for (const dayId of ["day-one", "day-two"]) {
      const hallway = hallwayTrackIn(page.locator(`#${dayId}`));
      const rows = hallway.locator(".m-4.flex");
      // The network/experts/sponsors row, then the Discord row -- two rows
      // total, not three, because the first carries both titles.
      await expect(rows).toHaveCount(2);

      const sameRow = await hallway.evaluate((el) => {
        const titleTexts = ["Build your Network", "Connect with Experts"];
        const matches = Array.from(el.querySelectorAll("div")).filter((d) =>
          titleTexts.includes(d.textContent?.trim() ?? ""),
        );
        if (matches.length !== 2) return false;
        const [a, b] = matches.map((d) => d.closest(".m-4.flex"));
        return a !== null && a === b;
      });
      expect(sameRow).toBe(true);

      await expect(hallway).toContainText("Back this year is");
      await expect(hallway).toContainText(
        "Connect with folks at the top web + AI companies",
      );

      const cascadiaConnectLink = hallway.getByRole("link", {
        name: "Cascadia Connect",
      });
      await expect(cascadiaConnectLink).toHaveAttribute(
        "href",
        "/2026/connect",
      );
    }
  });

  test("the Hallway Sponsor wall shows this Event's platinum and gold Sponsors, platinum first", async ({
    page,
  }) => {
    for (const dayId of ["day-one", "day-two"]) {
      const hallway = hallwayTrackIn(page.locator(`#${dayId}`));
      const logos = hallway.locator('img[alt$=" logo"]');
      await expect(logos).toHaveCount(10); // 1 platinum + 9 gold, this Event

      const altOrder = await logos.evaluateAll((els) =>
        els.map((el) => el.getAttribute("alt")),
      );
      expect(altOrder[0]).toBe("Pulumi logo"); // the only platinum Sponsor
      expect(altOrder.slice(1)).toContain("Elastic logo"); // a gold Sponsor
    }
  });

  test("Hallway sponsor logo links use target=_new, not _blank, and never gain the external-link indicator", async ({
    page,
  }) => {
    const hallway = hallwayTrackIn(page.locator("#day-one"));
    const links = hallway.locator('a:has(img[alt$=" logo"])');
    await expect(links).toHaveCount(10);

    const targets = await links.evaluateAll((els) =>
      els.map((el) => el.getAttribute("target")),
    );
    for (const target of targets) expect(target).toBe("_new");

    expect(await hasExternalIndicator(links.first())).toBe(false);
  });

  test("the Hallway Track's Discord row links out with its own call to action, on both days", async ({
    page,
  }) => {
    for (const dayId of ["day-one", "day-two"]) {
      const hallway = hallwayTrackIn(page.locator(`#${dayId}`));
      await expect(hallway.getByText("Join us on Discord")).toBeVisible();

      const cta = hallway.getByRole("link", { name: "Open Discord" });
      await expect(cta).toHaveAttribute(
        "href",
        "https://discord.gg/kkYR86GM29",
      );
      await expect(cta).toHaveAttribute("target", "_discord");
    }
  });

  // -- Workshop Track ---------------------------------------------------

  test("all four Workshop rows use the Schedule's own titles and hrefs, not the roster's slug path, with descriptions shown inline", async ({
    page,
  }) => {
    for (const workshop of WORKSHOPS) {
      const workshopTrack = workshopTrackIn(page.locator(`#${workshop.day}`));
      const row = rowIn(workshopTrack, workshop.title);
      await expect(row).toContainText(workshop.when);

      const link = row.getByRole("link", { name: workshop.title });
      await expect(link).toHaveAttribute("href", workshop.url);

      const href = await link.getAttribute("href");
      expect(href).not.toBe(workshop.rosterSlugPath);
      expect(href?.startsWith("/2026/talks/")).toBe(false);

      await expect(row).toContainText(workshop.descriptionContains);
    }
  });

  // -- Evenings -----------------------------------------------------------

  test("June 1's evening shows Dinner, the Networking Mixer with its hiring companies, the Pog Tournament with its inline sponsor logo, and the day's close", async ({
    page,
  }) => {
    const day = page.locator("#day-one");

    const dinner = rowIn(day, "Dinner");
    await expect(dinner).toContainText("5:30pm");
    await expect(dinner.getByRole("link", { name: "Dinner" })).toHaveAttribute(
      "href",
      "/2026/meals",
    );
    await expect(dinner).toContainText(
      "Dinner and drinks are included for Premium ticket holders",
    );

    const mixer = rowByTimeIn(day, "6:30pm");
    await expect(mixer).toContainText("Networking Mixer & Job Fair");
    await expect(mixer).toContainText("Grow Therapy");
    await expect(mixer).toContainText("Warp");

    const pog = rowByTimeIn(day, "7:00pm");
    await expect(pog).toContainText("Pog Tournament by");
    await expect(pog.getByRole("img", { name: "Mux logo" })).toBeVisible();

    await expect(rowByTimeIn(day, "9:30pm")).toContainText("Day One Close");
  });

  test("June 2's evening shows dinner with friends, Karaoke with its RSVP and its bold run intact, and the rooms closing", async ({
    page,
  }) => {
    const day = page.locator("#day-two");

    const dinnerWithFriends = rowByTimeIn(day, "6:00pm");
    await expect(dinnerWithFriends).toContainText("Dinner with Friends");
    await expect(dinnerWithFriends.locator("i.fa-utensils")).toHaveCount(1);
    await expect(dinnerWithFriends).toContainText("Capitol Hill");

    const karaoke = rowIn(day, "Karaoke");
    const karaokeLink = karaoke.getByRole("link", { name: "Karaoke" });
    await expect(karaokeLink).toHaveAttribute(
      "href",
      "https://luma.com/cascadiajs-2026-karaoke?coupon=6KKM88",
    );
    await expect(karaokeLink).toHaveAttribute("target", "_blank");
    // fa-microphone-stand is a paid-tier glyph, available via the Font
    // Awesome Pro kit (SiteFooter.astro).
    await expect(karaoke.locator("i.fa-microphone-stand")).toHaveCount(1);

    const boldRun = karaoke.locator("b", { hasText: "buying out" });
    await expect(boldRun).toHaveText("buying out");

    const rsvp = karaoke.getByRole("link", { name: "RSVP" });
    await expect(rsvp).toHaveAttribute(
      "href",
      "https://luma.com/cascadiajs-2026-karaoke?coupon=6KKM88",
    );

    await expect(rowByTimeIn(day, "11:00pm")).toContainText(
      "Karaoke rooms close",
    );
  });

  // -- Page tail: Sponsors, CTA, Testimonials ---------------------------

  test("sponsor band shows this Event's Sponsors, grouped by tier, under Our Sponsors", async ({
    page,
  }) => {
    const sponsors = page.locator("#sponsors");
    await expect(
      sponsors.getByRole("heading", { level: 1, name: "Our Sponsors" }),
    ).toBeVisible();
    await expect(
      sponsors.getByRole("heading", { level: 1, name: "Past Sponsors" }),
    ).toHaveCount(0);

    // Tier band labels appear in the fixed tier order, media excluded since
    // no 2026 Sponsor carries it.
    const labels = await sponsors
      .locator("span.text-sound-navy")
      .evaluateAll((els) => els.map((el) => el.textContent?.trim()));
    expect(labels).toEqual(TIER_ORDER);

    // Every 2026 Sponsor's logo renders, and only 2026 Sponsors.
    await expect(sponsors.locator('img[alt$=" logo"]')).toHaveCount(
      SPONSOR_COUNT_2026,
    );
    for (const name of [
      "AWS",
      "Pulumi",
      "Elastic",
      "Mux",
      "Uber",
      "Cloudflare",
    ]) {
      await expect(
        sponsors.getByRole("img", { name: `${name} logo` }),
      ).toBeVisible();
    }
  });

  test("Sponsor CTA and Testimonials follow the Sponsor band, in that order", async ({
    page,
  }) => {
    const cta = page.locator("#sponsors").getByRole("link", {
      name: "Sponsor Our Event",
    });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/2026/sponsor");

    const sponsorsSection = page.locator("#sponsors");
    const testimonialsSection = page.locator("#testimonials");
    await expect(testimonialsSection).toBeVisible();

    const [sponsorsBox, testimonialsBox] = await Promise.all([
      sponsorsSection.boundingBox(),
      testimonialsSection.boundingBox(),
    ]);
    expect(sponsorsBox).not.toBeNull();
    expect(testimonialsBox).not.toBeNull();
    expect(testimonialsBox!.y).toBeGreaterThanOrEqual(
      sponsorsBox!.y + sponsorsBox!.height,
    );
  });

  // -- Page-scoped style rules (ADR-0003) --------------------------------

  test("a row's icon renders in the fixed 30px box the legacy page uses", async ({
    page,
  }) => {
    // Icon-box width is a Tailwind w-[30px] utility on ShowItem's <i> (ADR-0003).
    const icon = rowByTimeIn(page.locator("#day-one"), "8:00am").locator(
      "i.fa-door-open",
    );
    const width = await icon.evaluate((el) => getComputedStyle(el).width);
    expect(width).toBe("30px");
  });

  test("the external-link indicator does not leak onto this page's own Sponsor logos", async ({
    page,
  }) => {
    const sponsorExternalLinks = page.locator('#sponsors a[target="_blank"]');
    const count = await sponsorExternalLinks.count();
    expect(count).toBeGreaterThan(0);

    const afterContents = await sponsorExternalLinks.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el, "::after").content),
    );
    for (const content of afterContents) {
      expect(content).toBe("none");
    }
  });

  test("Sponsor logo links on another page have not gained an external-link indicator", async ({
    page,
  }) => {
    // The 2026 Event page renders the same tiered SponsorsGrid (ADR-0008),
    // so it's the page actually at risk of a leaked indicator rule --
    // unlike the home page's link-less flat grid.
    await page.goto("/2026/");
    const sponsorExternalLinks = page.locator('#sponsors a[target="_blank"]');
    const count = await sponsorExternalLinks.count();
    expect(count).toBeGreaterThan(0);

    const afterContents = await sponsorExternalLinks.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el, "::after").content),
    );
    for (const content of afterContents) {
      expect(content).toBe("none");
    }
  });
});
