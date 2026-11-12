# Portfolio Site Spec

**Status: Redesign built on 2026-11-10; repo restructured on 2026-11-11.** The redesign described below is live in `mysite/`. The old template site survives only on the `dev` branch. Keep this file as the design and process reference for future changes.

## Repository layout

- `mysite/` — the static site. Dependency-free HTML, CSS and JS; synced as-is to S3 on every push to `master`, so nothing goes in here that should not be public (no screenshots, originals, scratch files or notes).
- `infra/` — the AWS CDK app (`bin/`, `lib/`, `test/`, `cdk.json`, `cdk.context.json`, `package.json`, `tsconfig.json`, `jest.config.js`, `.npmignore`) plus the architecture diagram (`myportfoliosite.png`, `.excalidraw`). `npm install`, `npm test` and `cdk` all run from inside `infra/`. `infra/.env` holds local secrets and is git-ignored; `infra/.env.example` is the committed template.
- `.github/workflows/master.yaml` — the pipelines. Must stay at the repo root; its CDK steps use `working-directory: infra`. PRs synth and deploy the stack; pushes to `master` sync `mysite/` to S3.
- Root — `README.md`, `.gitignore`, `CLAUDE.md`, `.claude/` and `.vscode/` (ignored) only.

## Scope guard

- Site work is confined to `mysite/`. Repo housekeeping (`README.md`, `.gitignore`, `.claude/`, `CLAUDE.md`) is allowed when asked.
- Never edit anything under `infra/` or `.github/`. These are the infrastructure and are enforced as deny rules in `.claude/settings.json`.
- Never run `cdk`, `npx cdk` or `aws` commands. Deployment happens automatically when `master` is pushed (`aws s3 sync ./mysite/ s3://akinwumisamuel.com --delete --exclude "scss/*"`), so every change under `mysite/` is a production change once merged.
- Never read, print or commit `infra/.env`.

## Goal (user's brief, verbatim)

> Improve UI/UX, visuals and design for this website, better than Opus 5.5. Add some animations and update image quality.

## Current state (as built)

**Stack.** Hand-written HTML, one stylesheet (`mysite/css/site.css`) and one script (`mysite/js/site.js`). No frameworks, no build step, no npm. Fonts: Poppins (body) and Sora (headings) from the Google Fonts `css2` API with `display=swap`. Favicon is an inline SVG data URI ("SA" on an amber gradient).

**Files.**
- `mysite/index.html`, `mysite/error.html` (CloudFront serves `error.html` for 403 and 404)
- `mysite/css/site.css`, `mysite/js/site.js`
- `mysite/AKINWUMI+SamuelResume.pdf` (Download CV link)
- `mysite/images/` (see below)

**Sections in `index.html`, in order.**
1. `#site-nav` sticky glass navbar, "SA" brand, mobile drawer
2. `#home` hero: portrait `<picture>`, rotating role text, two CTAs
3. `#about`
4. `#experience` (resume)
5. `#services`
6. `#skills` (animated meters)
7. `#projects` (six cards)
8. `#certifications`
9. "Hire me" banner on `banner-*.webp`
10. `#contact`, footer

**Images in `mysite/images/`.** Naming scheme is `<name>-<width>.webp` with the original JPG/PNG kept as the `<img src>` fallback inside `<picture>`.

| Asset | WebP widths | Fallback | Used for |
|---|---|---|---|
| portrait-a | 500, 800, 1000 | asternsam-black.jpg (1000×1194) | hero, About |
| portrait-b | 500, 800, 1000 | asmilesam-black.jpg (1000×1194) | hero rotation |
| banner | 1280, 2000 | bg_1.jpg (2000×1155) | "Hire me" banner |
| project-1 | 640, 960 | project-1.png (1345×779) | project card |
| project-2 | 640, 960 | project-2.jpg (1000×750) | project card |
| project-3 | 640, 960 | project-3.jpg (1000×667) | project card |
| project-4 | 640, 960 | project-4.png (1313×776) | project card |
| project-5 | 640, 960 | project-5.jpg (1000×667) | project card |
| project-6 | 640, 960, 1280 | none (original 2988×1454 PNG was dropped; `src` is the 1280 WebP) | project card |

Known exception: project-6 has no JPG/PNG fallback. Acceptable because every supported browser renders WebP, but add one if the original is ever recovered.

Removed during the redesign: Bootstrap, jQuery, Owl, AOS, animate.css, waypoints, `scss/`, `css/style.css`, `js/main.js`, `js/google-map.js`, `prepros-6.config`, the certification JPGs and all template images.

## Design direction (implemented)

Dark, amber-accent identity, modernized.

- **Palette.** Near-black layered surfaces (`#0b0d10` base, `#13161b` and `#1b1f26` for elevation), amber gradient accent (`#ffbd39` to `#ff8c42`), body text `#c9ccd1` for WCAG AA contrast, muted text `#8b9099`. Subtle glass effect on cards (`backdrop-filter: blur`, 1px translucent border). All colours are CSS custom properties in `site.css`; change them there, not inline.
- **Type.** Fluid scale with `clamp()`. Poppins for body, Sora for headings.
- **Spacing.** 8-pt scale, consistent section padding, max content width around 1200px.
- **Hero.** Single composed hero: portrait with a gradient mask, animated gradient background, staggered text reveal, rotating role word, scroll cue.
- **Cards** (Services, Projects, Certifications). Hover lift, cursor-tracked border glow, image zoom on hover. Project links must be real URLs or an explicit "coming soon" state, never `href="#"`.
- **Skills.** Animated meters that fill on scroll.
- **Navigation.** Sticky glass navbar that shrinks on scroll, active-section highlight, mobile drawer with staggered item reveal.
- **Micro-interactions.** Button shine, link underline slide, visible `:focus-visible` rings, smooth scroll, back-to-top button.
- **Accessibility.** Semantic landmarks, alt text on every image, keyboard-reachable everything, `prefers-reduced-motion` disables non-essential motion.
- **Performance.** No libraries. CSS animations and IntersectionObserver only. No unused assets.

## Animations

All gated behind `@media (prefers-reduced-motion: no-preference)` in CSS and a matching `matchMedia` check in JS. Shared easing `cubic-bezier(0.22, 1, 0.36, 1)`, durations 200–600 ms. New motion must use the same tokens.

1. Hero staggered fade-up for subheading, h1, h2 and CTAs (80 ms stagger).
2. Rotating role text with a soft blur transition.
3. Scroll-reveal for every section via IntersectionObserver.
4. Counter count-up on reveal.
5. Skill meters fill on reveal.
6. Card hover lift plus cursor-tracked glow (CSS custom properties updated on `mousemove`).
7. Navbar shrink and blur on scroll.
8. Subtle animated gradient in the hero and "Hire me" banner backgrounds.

## Image workflow

- Resize to the sizes actually displayed and export WebP with the JPG/PNG original as fallback inside `<picture>`. Portraits at 500, 800 and 1000 px wide. Project images at 640, 960 and (if the source allows) 1280 px. Banner at 1280 and 2000 px.
- Every `<img>` has `srcset`/`sizes` via its `<source>`, explicit `width` and `height`, `loading="lazy"` below the fold, `decoding="async"`, and `fetchpriority="high"` on the hero portrait only.
- Tools on this Mac: `sips` for resizing, then `cwebp -q 82 -sharp_yuv -m 6`. ImageMagick is not installed.
- Upscaling does not count as higher quality. If a higher-resolution original is needed, ask the user for it.
- Originals and intermediates never land in `mysite/`; work in the scratchpad and copy only the final files in.

## Quality bar

- Every section has a deliberate visual hierarchy.
- No template leftovers, dead links, unused scripts or images.
- Zero console errors and no 404s.
- Lighthouse mobile ≥ 90 in Performance, Accessibility, Best Practices and SEO. This is the target; Claude cannot run Lighthouse here, so the user measures it in Chrome DevTools when it matters.
- A cohesive motion system (shared easing and durations) rather than scattered effects.

## Verification

There is no check script. Verify with headless Chrome driven over the DevTools Protocol from a Node 22 script kept in the scratchpad (never in the repo):

1. Serve the site: `cd mysite && python3 -m http.server 8000`.
2. Load `http://localhost:8000/` and `/error.html`; fail on any console error or non-200 network response.
3. Screenshot at 1440, 768 and 390 px wide, and once more at 390 px with `prefers-reduced-motion: reduce` emulated.
4. Review the screenshots by eye before reporting.

## Acceptance checklist

- [ ] Only files under `mysite/` changed (plus any root docs the user asked for); `git status` shows nothing else
- [ ] No scratch, screenshot or original files inside `mysite/`
- [ ] Renders correctly at 1440, 768 and 390 px
- [ ] Reduced-motion preference disables animations
- [ ] All images have alt text, dimensions and responsive sources
- [ ] No console errors, no 404s, no references to removed assets
- [ ] New motion uses the shared easing and duration tokens
