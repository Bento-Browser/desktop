# Project: Bento Browser (Firefox Fork Using Surfer)

## 1. Goals and Constraints

- Create a **Firefox-based browser** named **Bento Browser** with major UI customisations (Arc/Vivaldi/Zen-style) while remaining a **true fork** that closely tracks upstream Firefox releases.
- Use **Zen Browser’s Surfer tool** (or a fork of it) as the build orchestrator that downloads Firefox and applies changes.
- Maintain a **clean separation** between:
  - Upstream tools (Surfer)
  - Firefox source (fetched at build time)
  - Bento Browser’s custom UI and patches
- Use the domain **`bentobrowser.app`** as the primary product domain (website, docs, downloads) once acquired.

---

## 2. Repository Layout and Responsibilities

### 2.1 Repositories

1. `surfer-upstream` (fork of `zen-browser/surfer`)
   - Pure mirror of upstream Surfer; **no local modifications**.
   - Used as a dependency (via git submodule, subtree, or npm package).
   - Only operations: pull upstream changes, tag versions, publish internal packages if desired.

2. `bento-browser` (main browser repo)
   - Contains:
     - Surfer integration (config, scripts)
     - Branding + configuration for **Bento Browser**
     - Bundled privileged extensions
     - Source patches for Firefox UI where absolutely necessary
     - CI/build pipeline
   - This is the primary dev repo for Bento Browser.

3. Optional: `bento-browser-infra`
   - Docker images, build farm config, release pipelines, update server, telemetry replacement, etc.

### 2.2 Branching Model (in `bento-browser`)

- `main`: always buildable, tracks latest stable Firefox version Bento supports.
- `ff-X.Y` branches: per-major Firefox version (e.g. `ff-150`, `ff-151`) for rebasing and patch maintenance.
- `feature/*`: UI experiments and new features, merged into `main` once stable.

---

## 3. Surfer Integration Strategy

### 3.1 Surfer as a Stable Dependency

- Treat Surfer as **build tooling**, not as Bento Browser code.
- Integration options:
  - **npm dependency** on `@zen-browser/surfer` with shrinkwrap/lockfile to pin version.
  - Or **git submodule** under `tools/surfer` pointing at `surfer-upstream`.
- Define a minimal, well-documented wrapper script, e.g. `scripts/build-bento.ts`, which:
  - Loads Surfer
  - Reads Bento’s config
  - Invokes the Surfer pipeline

### 3.2 Surfer Configuration (High-Level)

Configuration file in `bento-browser` (e.g. `surfer.config.{ts,js}`):

- `firefoxVersion`: upstream version/tag to build (e.g. `150.0.1`).
- `brandingPath`: path to Bento Browser’s branding directory in `bento-browser`.
- `extensions`: list of extensions (local paths or remote URLs) to bundle.
- `patches`: ordered list of patch directories/files to apply.

Pipeline behaviour (conceptual):

1. Fetch a specific Firefox source snapshot.
2. Copy Bento Browser branding and bundled extensions into the source tree.
3. Apply automated/boilerplate patches.
4. Apply Bento-specific manual patches.

---

## 4. Firefox Customisation Strategy

Follow a “minimal intrusion” strategy:

1. **Use build config and prefs first**.
2. **Bundle privileged extensions for major features**.
3. **Use targeted source patches only when unavoidable**.

### 4.1 Customising via Build Flags and `mozconfig`

Use `mozconfig` (and related build flags) to adjust branding and basic browser behavior.

Tasks:

- Define a `mozconfig` template in `bento-browser/config/mozconfig`:
  - Change app/binary names (e.g. `BENTO_BROWSER`, `bento-browser`).
  - Disable/enable core features (e.g. crash reporter, telemetry).
- Hook Surfer so that, after Firefox source is fetched, it:
  - Writes or copies `mozconfig` into the tree.
  - Ensures it’s used for the build.

### 4.2 Branding and Default Prefs

Use Firefox’s branding system to override icons, name, colours, and default prefs.

Plan:

- Create `bento-browser/branding/bento/` mirroring Firefox branding layout:
  - Icons, logos, product name strings ("Bento Browser").
  - A prefs file (`bento-branding.js` or equivalent) where default prefs are overridden.
- In that prefs file:
  - Disable unwanted Mozilla services (Pocket, Firefox VPN, etc.).
  - Point privacy/security endpoints to Bento-controlled services (or neutral ones) where appropriate.
- Have Surfer:
  - Copy this branding folder into `browser/branding/bento/` in the Firefox tree.
  - Set `--with-branding=browser/branding/bento` in `mozconfig`.

### 4.3 Bundling Privileged Extensions for UI

Use **bundled extensions** as the primary mechanism for Bento’s custom UI and workflows.

Design:

- Create extensions under `bento-browser/extensions/*`:
  - `bento-shell`: manages top-level UX (sidebar, workspaces, split views, etc.).
  - `bento-tools`: tab management, command palette, session handling.
- For each extension:
  - Provide `manifest.json` with appropriate permissions.
  - Use `browser.experiments.*` and internal APIs where necessary (privileged extension model).

Bundling steps (to be automated by Surfer):

1. Place unpacked extensions into `browser/extensions/<id>/` inside the Firefox tree.
2. Auto-generate a `moz.build` in each extension folder listing files.
3. Patch `browser/extensions/moz.build` to add Bento extensions to `DIRS`.
4. Ensure these extensions are installed and active by default.

---

## 5. Targeted UI Patching Strategy

Where extensions + prefs aren’t enough, use **small, surgical patches** to Firefox UI code.

Principles:

- Keep patches **small and targeted**; avoid large refactors and mass reformatting.
- Group patches by feature, not by file, so features can be toggled or isolated during rebases.
- Expect to update patches for each Firefox version bump.

Implementation details:

- Directory layout in `bento-browser`:
  - `patches/core-ui/` (URL bar tweaks, toolbars, menu items).
  - `patches/chrome-layout/` (window structure, panes, new containers).
  - `patches/experiments/` (temporary or high-risk patches).
- Patch format:
  - Use `git format-patch` style files, or a patch DSL supported by Surfer.
- Surfer integration:
  - Apply patches in a known order after copying branding & extensions:
    - `core-ui` → `chrome-layout` → `experiments`.

---

## 6. Bento UI Architecture Plan

### 6.1 "Bento" Shell Concept

Treat Firefox as the platform and build a Bento-flavoured UI shell mostly in JS/TS + WebExtension APIs:

- A privileged extension (`bento-shell`) that:
  - Controls main window layout (vertical tabs, sidebar, panels, grid/bento layouts).
  - Manages "boxes" or "bento sections" for different work contexts (workspaces).
  - Provides split view and advanced tiling behaviours.
- Concentrate most innovation here so it’s **decoupled from Firefox internals** and more resilient to upstream changes.

### 6.2 UI Layer Boundaries

Define clear boundaries for Bento Browser:

- **Platform layer** (Firefox):
  - Navigation, networking, rendering, profiles, Sync, WebExtension engine.
- **Shell layer** (Bento extensions + minimal patches):
  - Arrangement of tabs, commands, shortcuts, panel layout, command palette, workspace logic.
- **Feature layer** (additional extensions):
  - Extra functionality (ad-blocking, AI tools, note-taking, session sync, etc.).

This separation makes it easier to upgrade Firefox while keeping Bento’s UX stable.

---

## 7. Upstream Tracking and Rebase Workflow

### 7.1 Tracking Firefox Versions

- Maintain a mapping in `bento-browser/config/firefox-versions.json`:
  - `{"channel": "release", "version": "150.0.1", "surferConfig": "..."}`.
- For each new Firefox release targeted by Bento Browser:
  1. Update version in Surfer config.
  2. Run Surfer to fetch and patch the new source.
  3. Fix any patch conflicts and update Bento-specific code.

### 7.2 Tracking Surfer Upstream

In `surfer-upstream`:

- `origin` = your fork, `upstream` = `zen-browser/surfer`.
- Periodically:
  - `git fetch upstream`.
  - `git merge upstream/main` or `git rebase upstream/main`.
- Tag versions you’ve validated with Bento’s pipeline (e.g. `surfer-0.3.0-bento1`).
- In `bento-browser`, pin Surfer to a known-good tag.

---

## 8. Build and CI Plan

### 8.1 Local Dev Build

- Script: `npm run build-bento` in `bento-browser`:
  1. Installs Surfer dependency.
  2. Invokes Surfer with Bento’s config.
  3. Produces platform-specific artifacts (e.g. `dist/bento-browser-<platform>.tar.*`).

### 8.2 CI Pipeline

- Build matrix:
  - Linux, Windows, macOS.
- Steps:
  1. Checkout `bento-browser`.
  2. Install Node & dependencies.
  3. Ensure Surfer is the pinned version.
  4. Run build (with caching for toolchains if possible).
  5. Run smoke tests (basic UI checks via puppeteer/Playwright).
  6. Upload artifacts for QA and, eventually, for downloads at `bentobrowser.app`.

---

## 9. Web Presence: bentobrowser.app

- Use **`bentobrowser.app`** as the primary product domain:
  - Landing page for Bento Browser.
  - Download links (stable, beta, nightly channels).
  - Documentation (getting started, configuration, power-user features).
  - Privacy policy, security model, and update policy.
- Maintain a separate `bentobrowser.app` website repo (static site or small Next.js app) that:
  - Pulls release data from `bento-browser` GitHub releases or your own update API.
  - Hosts documentation generated from markdown (this plan could be a seed).

---

## 10. Legal and Licensing Checklist

- Surfer and its ancestors (Gluon/Melon) are under MPL 2.0; respect file-level copyleft requirements.
- Firefox itself is under MPL 2.0; follow their license when redistributing modified binaries.
- Maintain:
  - LICENSE files for Surfer-derived code and Bento Browser.
  - Attribution for Firefox, Surfer, Gluon, Melon where required.
- Track which files are Mozilla’s, which are Surfer’s, which are Bento’s original work.

---

## 11. Phased Implementation Roadmap for Bento Browser

### Phase 0 – Bootstrap

- [ ] Fork `zen-browser/surfer` into `surfer-upstream`.
- [ ] Create `bento-browser` repo (monorepo with `extensions/`, `branding/`, `patches/`, `config/`, `scripts/`).
- [ ] Add Surfer as a dependency (npm or git submodule).
- [ ] Add minimal `surfer.config` and `mozconfig` templates.
- [ ] Register and configure **`bentobrowser.app`**.

### Phase 1 – Vanilla Firefox Build

- [ ] Use Surfer to download a specific Firefox version and build an unmodified Firefox.
- [ ] Verify end-to-end build works on at least one platform.

### Phase 2 – Bento Branding and Prefs

- [ ] Implement Bento branding folder and prefs overrides.
- [ ] Wire `--with-branding` and name changes through `mozconfig`.
- [ ] Build and confirm the browser identifies as **Bento Browser** with distinct branding.

### Phase 3 – Bento Shell Extension

- [ ] Implement core privileged extension (`bento-shell`) for Bento’s UI shell (vertical tabs, bento/workspace layout skeleton).
- [ ] Automate bundling into `browser/extensions/` via Surfer.
- [ ] Ensure extension is installed and active by default.

### Phase 4 – Incremental UI Patches

- [ ] Identify UI areas that cannot be handled by extension alone.
- [ ] Add small, well-scoped patches to `patches/core-ui` and `patches/chrome-layout`.
- [ ] Rebuild, test, and document each patch.

### Phase 5 – Upstream Upgrade Drill

- [ ] Bump Firefox version in config.
- [ ] Run Surfer, resolve patch conflicts.
- [ ] Measure effort and adjust patch strategy to keep rebases cheap.

### Phase 6 – Hardening and Releases

- [ ] Stabilise Surfer version and lock it in CI.
- [ ] Add automated tests for core Bento UI flows.
- [ ] Set up release channels (stable, beta, nightly) and surface them on `bentobrowser.app`.
