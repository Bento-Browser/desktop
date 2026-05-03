# bento-shell

Privileged extension implementing Bento Browser's UI shell — the "bento"
layout, vertical tabs, workspace switching, panel arrangement, command palette.

Implemented in **Phase 3** of the project plan. Will use
`browser.experiments.*` and other privileged APIs where standard WebExtension
APIs are insufficient.

Skeleton (to be added):
- `manifest.json`
- `background.js`
- `ui/` (HTML/CSS/JS for sidebar, command palette, etc.)
- `experiments/` (privileged API definitions)
