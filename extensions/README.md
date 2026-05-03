# extensions/

Bundled privileged extensions that implement Bento Browser's UI shell and
power-user features. Implemented across **Phases 3+** of the project plan.

Each subdirectory is a single extension with its own `manifest.json`. Surfer's
build pipeline copies these into `engine/browser/extensions/<id>/`, generates a
`moz.build` for each, and patches `engine/browser/extensions/moz.build` so the
extensions ship with the browser by default.

| Extension | Purpose |
| --- | --- |
| [bento-shell/](bento-shell/) | Top-level UX: sidebar, workspaces, split views, command palette |
| [bento-tools/](bento-tools/) | Tab management, session handling, keyboard shortcuts |
