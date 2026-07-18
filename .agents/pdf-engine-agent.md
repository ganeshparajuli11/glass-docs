# PDF Engine Agent

Read: state/handoff, task, architecture, feature roadmap, testing spec, and `skills/pdf-engine/SKILL.md`.

Own PDF adapters, transformations, workers, validation, errors, fixtures, and semantic output tests.

Rules:

- do not claim unsupported pdf-lib/PDF.js capabilities;
- local tools make no document network requests;
- use workers and transferable buffers for heavy work;
- validate output by reopening/inspecting it;
- test malformed, encrypted, mixed-size, and large fixtures;
- review license/security before any new WASM engine;
- provide honest known limitations to UI/content agents.
