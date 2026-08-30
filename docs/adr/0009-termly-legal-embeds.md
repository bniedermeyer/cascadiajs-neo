# Termly Legal Pages Keep a Non-Standard `name` Mount

Privacy, Terms of Service, and Cookie Policy are Termly embeds, not authored markdown. Termly's `embed-policy.min.js` looks up `div[name="termly-embed"]` plus a `data-id` for the policy document. `name` is not a valid HTML attribute on `<div>`, so Astro's typed templates correctly reject it — but the attribute still has to appear in the DOM or the embed never mounts.

`TermlyEmbed` emits that mount as raw HTML (`set:html`) and loads Termly's snippet with `is:inline`, so the type checker is not asked to bless invalid markup and the classic script-insertion pattern Termly ships is left intact. Policy IDs stay on the three page routes (`/privacy`, `/tos`, `/cookies`) as in the legacy site.

**Alternatives considered.** Casting a typed `<div name>` silences the error by lying to TypeScript. Renaming to `id` or `data-name` would be valid HTML but would not match Termly's selector. Hosting the policy copy ourselves would drop the third-party dependency; that is out of scope for the port.
