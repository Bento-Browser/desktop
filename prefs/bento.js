// Bento Browser — default pref overrides.
// Copied into the Firefox tree by Surfer's branding/preferences pipeline.
// Use pref(...) for defaults; users can override at runtime via about:config.

// --- Identity ---
// pref("general.useragent.compatMode.firefox", true);

// --- Disable Mozilla services we don't ship ---
// pref("extensions.pocket.enabled", false);
// pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
// pref("browser.newtabpage.activity-stream.showSponsored", false);
// pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
// pref("browser.contentblocking.report.lockwise.enabled", false);
// pref("browser.contentblocking.report.monitor.enabled", false);
// pref("browser.contentblocking.report.vpn.enabled", false);

// --- Telemetry / data reporting off by default ---
// pref("toolkit.telemetry.enabled", false);
// pref("toolkit.telemetry.unified", false);
// pref("datareporting.healthreport.uploadEnabled", false);
// pref("datareporting.policy.dataSubmissionEnabled", false);

// TODO: populate as Phase 2 lands real branding + privacy defaults.
