# branding/bento/

Bento Browser's generated Firefox branding folder.

This mirrors `engine/browser/branding/bento/` after Surfer imports the source
assets from `configs/branding/bento/`. It contains the Firefox-facing branding
files selected by `--with-branding=browser/branding/bento`:

- Application icons (`default16.png` through `default256.png`, `firefox.icns`,
  `firefox.ico`)
- About-dialog logo and background assets
- `configure.sh` for brand identifiers
- `pref/firefox-branding.js` for branding-specific default prefs
- `locales/en-US/brand.{ftl,dtd,properties}` for Bento Browser name strings

When changing the mark itself, update `configs/branding/bento/` and re-run
`npx surfer import`, then mirror the generated folder here.
