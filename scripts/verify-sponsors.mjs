/**
 * Sponsors data fidelity check (issue #15).
 *
 * Verifies that `src/shared/data/sponsors.json` is a faithful, deterministic
 * transform of the legacy `reference/cascadiajs/shared/data/sponsors.mjs`.
 * Re-derives the expected dedup/merge/order rules independently from the
 * source rather than trusting the generated file, so it stays correct if the
 * source ever changes upstream.
 *
 * Rules under test:
 *  - Dedup key is `id`; 90 source rows collapse to 78 unique sponsors.
 *  - Each output object is the winning record's fields spread verbatim, plus
 *    an added `events: string[]`.
 *  - Most-recent bucket wins content: 2026 > 2025 > previous.
 *  - `events` lists the buckets a sponsor appeared in, chronologically
 *    ascending (previous -> 2025 -> 2026).
 *  - Top-level array order matches first-appearance order across buckets.
 *
 * Usage: node scripts/verify-sponsors.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { sponsors } from "../reference/cascadiajs/shared/data/sponsors.mjs";

const OUTPUT_PATH = fileURLToPath(
  new URL("../src/shared/data/sponsors.json", import.meta.url),
);

const PRECEDENCE = ["previous", "2025", "2026"];

function deriveExpected() {
  const byId = new Map();
  const order = [];

  for (const bucket of PRECEDENCE) {
    for (const record of sponsors[bucket]) {
      const { id } = record;
      if (!byId.has(id)) {
        byId.set(id, { content: record, events: [bucket] });
        order.push(id);
      } else {
        const entry = byId.get(id);
        entry.events.push(bucket);
        entry.content = record;
      }
    }
  }

  return { byId, order };
}

function main() {
  const { byId, order } = deriveExpected();
  const output = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));

  // Output length === 78.
  assert.equal(
    output.length,
    78,
    `expected 78 sponsors in output, got ${output.length}`,
  );
  assert.equal(
    byId.size,
    78,
    `expected 78 unique ids derived from source, got ${byId.size}`,
  );

  // Every source id appears exactly once; no extras.
  const seenIds = new Set();
  for (const sponsor of output) {
    assert.ok(
      typeof sponsor.id === "string" && sponsor.id.length > 0,
      `output object missing a valid id: ${JSON.stringify(sponsor)}`,
    );
    assert.ok(
      !seenIds.has(sponsor.id),
      `id "${sponsor.id}" appears more than once in output`,
    );
    seenIds.add(sponsor.id);
    assert.ok(
      byId.has(sponsor.id),
      `output id "${sponsor.id}" is not present in the source`,
    );
  }
  for (const id of byId.keys()) {
    assert.ok(seenIds.has(id), `source id "${id}" is missing from output`);
  }

  // Per-id content equals the winning source record, field-for-field, with
  // no fields added or dropped beyond `events`.
  for (const sponsor of output) {
    const expected = byId.get(sponsor.id);
    const { events, ...content } = sponsor;

    assert.deepEqual(
      content,
      expected.content,
      `content for "${sponsor.id}" does not match its winning source record`,
    );

    assert.deepEqual(
      Object.keys(sponsor).sort(),
      [...Object.keys(expected.content), "events"].sort(),
      `"${sponsor.id}" has unexpected fields added or dropped`,
    );

    // events: subset of the three labels, chronologically ascending, exactly
    // matching the buckets that id appeared in.
    assert.deepEqual(
      events,
      expected.events,
      `events for "${sponsor.id}" expected ${JSON.stringify(expected.events)}, got ${JSON.stringify(events)}`,
    );
    for (const label of events) {
      assert.ok(
        PRECEDENCE.includes(label),
        `"${sponsor.id}" has unrecognized event label "${label}"`,
      );
    }
    const ascendingIndexes = events.map((label) => PRECEDENCE.indexOf(label));
    for (let i = 1; i < ascendingIndexes.length; i++) {
      assert.ok(
        ascendingIndexes[i] > ascendingIndexes[i - 1],
        `events for "${sponsor.id}" are not chronologically ascending: ${JSON.stringify(events)}`,
      );
    }
  }

  // netlify edge case: 2025 content, events === ["previous", "2025"].
  const netlify = output.find((s) => s.id === "netlify");
  assert.ok(netlify, "netlify is missing from output");
  assert.deepEqual(netlify.events, ["previous", "2025"]);
  assert.equal(netlify.tier, "community");
  assert.equal(netlify.url, "https://www.netlify.com");
  assert.ok(
    !("description" in netlify),
    "netlify's 2025 record has no description field; output must not invent one",
  );

  // 2025+2026 sponsors take 2026 content.
  const twentyTwentySixWinners = [
    "cloudflare",
    "elastic",
    "arcjet",
    "seattlejs",
    "vanjs",
    "ai-portland",
    "codeandcoffee",
    "mux",
    "onebrief",
    "copilotkit",
    "render",
  ];
  for (const id of twentyTwentySixWinners) {
    const sponsor = output.find((s) => s.id === id);
    assert.ok(sponsor, `${id} is missing from output`);
    assert.deepEqual(sponsor.events, ["2025", "2026"]);
    const source2026 = sponsors["2026"].find((s) => s.id === id);
    assert.deepEqual(
      { ...sponsor, events: undefined },
      { ...source2026, events: undefined },
      `${id} should take its 2026 content wholesale`,
    );
  }

  // Newer spellings win.
  assert.equal(output.find((s) => s.id === "arcjet").name, "Arcjet");
  assert.equal(
    output.find((s) => s.id === "codeandcoffee").name,
    "Seattle Code and Coffee",
  );

  // Top-level order matches first-appearance order across previous -> 2025 -> 2026.
  assert.deepEqual(
    output.map((s) => s.id),
    order,
    "top-level array order does not match first-appearance order",
  );

  console.log(
    `OK: src/shared/data/sponsors.json has ${output.length} sponsors, ` +
      "faithfully derived from reference/cascadiajs/shared/data/sponsors.mjs.",
  );
}

main();
