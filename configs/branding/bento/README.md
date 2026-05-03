# configs/branding/bento/

Source branding assets consumed by Surfer's branding importer.

Surfer looks under `configs/branding/<brand>/`, then generates the Firefox
layout in `engine/browser/branding/<brand>/`. The generated Bento folder is
mirrored back to `branding/bento/` for review and source control.

Required inputs:

- `logo16.png`, `logo22.png`, `logo24.png`, `logo32.png`, `logo48.png`,
  `logo64.png`, `logo128.png`, `logo256.png`, `logo512.png`
- `logo.png` and `logo-mac.png`
- `firefox.ico`, `firefox64.ico`, `firefox.icns`
- Optional `content/*.svg` wordmark and about-logo overrides
