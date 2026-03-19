# 📜 Changelog - Isekai Character Generator

## [Build 1773933206] - 2026-03-19
### Added
- **R2 "Frozen" Storage:** Actual portrait images are now permanently saved to Cloudflare R2 upon publishing.
- **Global Gallery API:** Switched from local storage to Cloudflare KV for a synchronized global hero list.
- **Gender Integration:** Added weighted Gender rolls (including Bishoujo/Bishounen) to resolve male-leaning AI bias.
- **Rate-Limit Guard:** Implemented a 10-second countdown timer on the generation buttons to prevent HTTP 400 errors.
- **Build Indicator:** Added a version tracker in the top-right corner for deployment verification.

### Fixed
- **Deep-Linking:** Fixed issue where visitors would see a different image than the creator; R2 files are now locked via URL parameters.
- **Stability Pass:** Switched back to the stable `zimage` model with `safe=false` and optimized 1080x1920 resolution.
- **UX Onboarding:** Replaced cryptic "400/401" errors with a friendly "Connection Required" hub for non-authenticated visitors.
- **Syntax Cleanup:** Resolved JavaScript crashes caused by literal newline characters in the generation engine.
