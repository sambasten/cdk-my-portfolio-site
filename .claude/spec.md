# Portfolio Site Redesign Spec

**Status: Built on 2026-11-10.** The redesign described below has been implemented in `mysite/` (new `css/site.css`, `js/site.js`, rewritten `index.html` and `error.html`, WebP image variants, template assets removed). Keep this file as the design reference for future changes.

## Scope guard

- All changes are confined to `mysite/`.
- Never edit `bin/`, `lib/`, `test/`, `cdk.json`, `cdk.context.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `jest.config.js`, `.github/` or any other root-level CDK file. These are the infrastructure and are enforced as deny rules in `.claude/settings.json`.
- Never run `cdk`, `npx cdk` or `aws` commands. Deployment happens automatically when `master` is pushed (`aws s3 sync ./mysite/ s3://akinwumisamuel.com --delete --exclude "scss/*"`), so every change under `mysite/` is a production change once merged.

## Goal (user's brief, verbatim)

> Improve UI/UX, visuals and design for this website, better than Opus 5.5. Add some animations and update image quality.

## Current state

**Stack.** Static HTML, Bootstrap 4 (inlined in `css/style.css`, about 9.7k lines), jQuery 3.2.1, Owl carousel, AOS, animate.css, stellar/scrollax parallax, waypoints, animateNumber. SCSS source lives in `mysite/scss/` and was compiled with Prepros; the served file is `mysite/css/style.css`.

**Theme.** Dark. Body background `#000`, body text `#999`, primary `#ffbd39` (amber), secondary `#a0f669`, dark shade `#232931`. Font is Poppins (100–900) loaded through the legacy Google Fonts `css?family=` URL.

**Sections in `index.html`, in order.**
1. Navbar `#ftco-navbar`
2. Hero `#home-section`: Owl carousel, two slides ("I'm Sam / A Software & Cloud Engineer" and "I'm a cloud security engineer based in Toronto"), buttons "Hire me" and "My works"
3. About `#about-section`: portrait, info list, "30 web apps secured" counter, Download CV
4. Resume `#resume-section`
5. Services `#services-section`: six cards
6. Skills `#skills-section`: six progress bars
7. Projects `#projects-section`: six projects, all links `href="#"`
8. Certifications `#blog-section`: three cards
9. Counter strip `#section-counter`
10. "Hire me" banner on `bg_1.jpg`
11. Contact `#contact-section`: address, email, website, no form
12. Footer and full-page `#ftco-loader`

**Known defects to fix.**
- Navbar brand renders the literal text `&am`.
- All six project links are dead (`href="#"`).
- `js/google-map.js` is shipped but never referenced.
- `prepros-6.config` is deployed publicly.
- The full-page loader delays first paint.
- Images have no responsive variants. `project-6.png` is 2988×1454 (334 KB). Hero and About portraits are 1000×1194 JPGs used as CSS backgrounds, so they cannot have alt text or `srcset`.

**Images in `mysite/images/`.**

| File | Bytes | Dimensions | Used for |
|---|---|---|---|
| asternsam-black.jpg | 75,035 | 1000×1194 | hero slide 1, About |
| asmilesam-black.jpg | 106,275 | 1000×1194 | hero slide 2 |
| bg_1.jpg | 153,856 | 2000×1155 | "Hire me" background |
| aws-cert.jpg | 24,100 | 600×375 | certification |
| azure-ai.jpg | 100,162 | 1600×1000 | certification |
| project-1.png | 160,201 | 1345×779 | project |
| project-2.jpg | 101,536 | 1000×750 | project |
| project-3.jpg | 94,638 | 1000×667 | project |
| project-4.png | 146,156 | 1313×776 | project |
| project-5.jpg | 103,196 | 1000×667 | project |
| project-6.png | 333,525 | 2988×1454 | project |
| image_1.jpg, image_2.jpg, image_3.jpg, person_1.jpg, loc.png | | | template leftovers, check usage before deleting |

## Design direction

Keep the dark, amber-accent identity but modernize it.

- **Palette.** Near-black layered surfaces (`#0b0d10` base, `#13161b` and `#1b1f26` for elevation), amber gradient accent (`#ffbd39` to `#ff8c42`), body text lifted to `#c9ccd1` for WCAG AA contrast, muted text `#8b9099`. Subtle glass effect on cards (`backdrop-filter: blur`, 1px translucent border).
- **Type.** Fluid scale with `clamp()`. Variable Poppins via the Google Fonts `css2` API with `font-display: swap`, optionally paired with a display face (Sora or Space Grotesk) for headings.
- **Spacing.** 8-pt scale, consistent section padding, max content width around 1200px.
- **Hero.** Replace the Owl carousel with a single composed hero: portrait with a gradient mask, animated gradient blob or grain background, staggered text reveal, magnetic CTA buttons, scroll cue. Keep both taglines through a rotating word effect instead of slides.
- **Cards** (Services, Projects, Certifications). Hover lift, cursor-tracked border glow, image zoom on hover. Projects get real links or an explicit "coming soon" state.
- **Skills.** Replace flat progress bars with animated radial or segmented meters that fill on scroll.
- **Navigation.** Sticky glass navbar that shrinks on scroll, active-section highlight, mobile drawer with staggered item reveal. Brand becomes "SA" or "Samuel Akinwumi".
- **Micro-interactions.** Button shine, link underline slide, visible `:focus-visible` rings, smooth scroll, back-to-top button.
- **Loader.** Remove the blocking spinner; use a short page-load reveal.
- **Accessibility.** Semantic landmarks, alt text on every image, keyboard-reachable everything, `prefers-reduced-motion` disables non-essential motion.
- **Performance.** No new heavy libraries. Prefer CSS animations and IntersectionObserver. Drop unused assets (`google-map.js`, Owl carousel if the hero no longer needs it, template images not referenced). Target Lighthouse mobile ≥ 90 in all four categories.

## Animations

All gated behind `@media (prefers-reduced-motion: no-preference)`. Shared easing `cubic-bezier(0.22, 1, 0.36, 1)`, durations 200–600 ms.

1. Hero staggered fade-up for subheading, h1, h2 and CTAs (CSS keyframes, 80 ms stagger).
2. Rotating role text ("Software & Cloud Engineer" / "Cloud Security Engineer") with a soft blur transition.
3. Scroll-reveal for every section via IntersectionObserver, replacing waypoints and `.ftco-animate`.
4. Counter count-up on reveal (reuse `animateNumber` or a small vanilla function).
5. Skill meters fill on reveal.
6. Card hover lift plus cursor-tracked glow (CSS custom properties updated on `mousemove`).
7. Navbar shrink and blur on scroll.
8. Subtle animated gradient or noise in the hero and "Hire me" banner backgrounds.

## Image quality

- Resize to the sizes actually displayed and export WebP with JPG/PNG fallback via `<picture>`. Portraits at 800, 1200 and 1600 px wide. Project images at 640, 960 and 1280 px. `project-6.png` scaled down from 2988 px. `bg_1.jpg` as a compressed WebP at or under 150 KB.
- Add `srcset` and `sizes`, explicit `width` and `height`, `loading="lazy"` below the fold, and `fetchpriority="high"` on the hero portrait.
- Convert the CSS `background-image` portraits to real `<img>` elements with `object-fit: cover` so they get alt text and responsive sources.
- Apply light sharpening and denoise after resizing.
- Upscaling the existing JPGs does not count as higher quality. If higher-resolution originals are available, ask the user for them and use those.
- Tools: `sips` (built into macOS), `cwebp`, or ImageMagick `magick` if installed.

## Files expected to change when built

- `mysite/index.html`, `mysite/error.html`
- `mysite/scss/style.scss` recompiled to `mysite/css/style.css`, or a new `mysite/css/theme.css` loaded after `style.css` if Prepros is unavailable
- `mysite/js/main.js` (slimmed down, IntersectionObserver reveals added)
- `mysite/images/` (optimized variants added, unused template images removed)

## Quality bar

"Better than Opus 5.5" means:
- Every section has a deliberate visual hierarchy.
- No template leftovers: no `&am`, no dead links, no unused scripts or images.
- Zero console errors and no 404s.
- Lighthouse mobile ≥ 90 in Performance, Accessibility, Best Practices and SEO.
- A cohesive motion system (shared easing and durations) rather than scattered effects.

## Acceptance checklist

- [ ] Only files under `mysite/` changed; `git status` shows nothing outside it
- [ ] `cd mysite && python3 -m http.server 8000` renders correctly at 375, 768 and 1440 px
- [ ] Reduced-motion preference disables animations
- [ ] All images have alt text, dimensions and responsive sources
- [ ] Lighthouse mobile ≥ 90 ×4
- [ ] No references to removed assets, no console errors
