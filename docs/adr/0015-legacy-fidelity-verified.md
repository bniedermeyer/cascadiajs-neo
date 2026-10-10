# Legacy Fidelity Verified; the Legacy Site Is a Historical Record

Fidelity to the Legacy Site was verified during the port, by the computed-style comparison ADR-0004 prescribed. That work is done, so this **supersedes ADR-0004** entirely and **ADR-0001's clause that the reference codebase is the visual specification**. The rest of ADR-0001 stands: Tailwind and brand tokens (ADR-0003) remain the way to build, and the acceptance bar is still that a visitor cannot tell the difference.

From here on the only ongoing verification is the committed Playwright suite, which asserts structure and behavior. The live-site compare tool and the sponsors-fidelity script are retired, and the reference submodule is being removed. The Legacy Site is preserved on the [`cascadiajs-legacy-pre-migration` branch](../../tree/cascadiajs-legacy-pre-migration) of cascadiajs/cascadiajs, for history only. This repo will move into cascadiajs/cascadiajs; until it does, that link 404s, which is accepted.
