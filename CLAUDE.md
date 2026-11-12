# Portfolio site (akinwumisamuel.com)

- Layout: `mysite/` is the static site, `infra/` is the AWS CDK app, `.github/` is the pipeline. Everything else at the root is docs or config. Full details in `.claude/spec.md`.
- Every push to `master` syncs `mysite/` to a public S3 bucket, so never leave screenshots, originals or scratch files in `mysite/`.
- Never edit `infra/` or `.github/` and never run `cdk` or `aws`; the user deploys. If a change needs infra edits, describe the exact diff instead. `npm`, `npm test` and `cdk` run from inside `infra/`, not the root.
- `infra/.env` holds secrets and is git-ignored. Never read, print or commit it.
- The site is dependency-free by design (no jQuery, Bootstrap or npm for the frontend). Keep it that way.
- Images: `sips` + `cwebp -q 82 -sharp_yuv -m 6` for WebP; no ImageMagick on this Mac. Keep JPG/PNG fallbacks in `<picture>`.
- There is no check script. Verify with headless Chrome via the DevTools Protocol in Node 22 (no Lighthouse, no browser extension); check 1440, 768 and 390 px plus reduced motion. Steps are in the spec's Verification section.
- Branches: `master` is the live redesign, `dev` still holds the old template site.
- Commit only when asked.
