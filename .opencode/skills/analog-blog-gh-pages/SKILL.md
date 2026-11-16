---
name: analog-blog-gh-pages
description: Scaffold a markdown blog on latest AnalogJS (Angular) with GitHub Pages deploy, Sveltia CMS admin, prerendered content routes, raw .md output for GEO/llms.txt, and Pico.css styling with a no-JS popover hamburger menu. Use when asked to set up or port this blog setup to another AnalogJS project.
---

# AnalogJS Blog on GitHub Pages

Reference implementation: `periwinkle32/ice-dream` (live: `https://periwinkle32.github.io/ice-dream/`, custom domain optional).

## 1. Bootstrap

```bash
npx @analogjs/create@latest my-app   # or scaffold manually
cd my-app && npm i
```

Deps beyond default: `@analogjs/content @analogjs/router front-matter marked marked-gfm-heading-id marked-highlight marked-mangle prismjs`, dev: `@picocss/pico`.

`vite.config.ts` essentials:

```ts
import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

export default defineConfig({
  base: '/<repo-name>/',               // GitHub Pages project site; '/' for user/org site
  plugins: [
    analog({
      content: { highlighter: 'prism' },
      prerender: {
        routes: async () => [
          '/',
          '/about',
          {
            contentDir: 'src/content/blog',
            transform: (file) =>
              file.attributes.draft ? false : `/blog/${file.attributes.slug || file.name}`,
            outputSourceFile: (file) => (file.attributes.draft ? false : file.content), // .md per route
          },
          {
            contentDir: 'src/content/pages',
            transform: (file) => `/page/${file.attributes.slug || file.name}`,
            outputSourceFile: (file) => file.content,
          },
        ],
        sitemap: { host: 'https://<user>.github.io/<repo-name>' },
      },
    }),
  ],
});
```

`index.html`: `<base href="/<repo-name>/" />`, relative favicon (`href="favicon.ico"`). Add empty `public/.nojekyll`.

## 2. App code

- `src/app/app.config.ts`: `provideFileRouter()`, `provideContent(withMarkdownRenderer(), withPrismHighlighter())`, `provideClientHydration(withEventReplay())`, `provideHttpClient(withInterceptors([requestContextInterceptor]))`.
- `src/app/post.model.ts` / `page.model.ts`: frontmatter interfaces (blog: title, slug, description, coverImage, publishedAt, tags, draft).
- `src/content/settings.md`: singleton site settings (title, tagline, logo, socialLinks) — read via helper `injectSiteSettings()` using `injectContentFiles(f => f.filename.includes('/settings.md'))`.
- Pages: `src/app/pages/index.page.ts` (post list + pages list from `injectContentFiles`), `blog.[slug].page.ts`, `page.[slug].page.ts`, `about.page.ts`.
- **Gotcha:** `injectContent<T>()` looks in `/src/content/<slug>.md` — always pass `{ subdirectory: 'blog', param: 'slug' }`.
- Nav in `app.ts`: brand from settings + dynamic page links via `injectContentFiles(f => f.filename.includes('src/content/pages/'))`.

## 3. GitHub Pages deploy

`.github/workflows/deploy.yml`: on push to `main` → `npm ci` → `npm run build` → `actions/upload-pages-artifact@v3` (path `dist/analog/public`) → `actions/deploy-pages@v4`, with `permissions: { pages: write, id-token: write }` and `concurrency: group: pages`.

After creating the repo, Pages source must be **GitHub Actions**, not branch:

```bash
gh api --method PUT /repos/<owner>/<repo>/pages -f build_type=workflow
```

(If the repo previously had legacy Pages with a CNAME, `build_type=workflow` keeps the custom domain.)

## 4. Sveltia CMS

- `public/admin/index.html`: plain `<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>` (no `type="module"`, no CSS link, unversioned URL).
- `public/admin/config.yml`: backend `github` / `repo: <owner>/<repo>` / `branch: main`, `local_backend: true` (localhost dev), `media_folder: public/images/uploads`, `public_folder: /<repo-name>/images/uploads`, collections `blog` (folder `src/content/blog`, `slug: '{{slug}}'`, fields matching frontmatter) and `pages`, plus a `files` collection for `src/content/settings.md`.
- Auth (simple): collaborators invited with write access (Settings → Collaborators) sign in at `/admin/` via **Sign in with Token** (PAT with repo access). OAuth via Sveltia Authenticator on Cloudflare is the multi-user option (overkill for 1–2 authors).

## 5. GEO / LLM-friendly output

- `outputSourceFile` (above) emits `/blog/<slug>.md` and `/page/<slug>.md` as raw markdown files — served as `text/markdown` on Pages. Note: `npm run dev` and the Nitro preview do NOT serve these (SSR fallback); only static hosting does.
- `public/llms.txt`: static llms.txt convention file linking all `.md` routes (update manually on new content).
- Prerender transform must return a **string**, not an array.

## 6. Styling: Pico.css + no-JS hamburger

`src/styles.css` starts with:

```css
@import '@picocss/pico/css/pico.min.css';
@import 'prismjs/themes/prism.css';
```

Keep custom CSS minimal (Pico classless does typography/colors/dark mode/forms); override Pico vars under `@media (prefers-color-scheme: dark)` if needed.

Hamburger menu, zero JS logic: button with `popovertarget="mobile-nav" popovertargetaction="show"`, drawer `<nav id="mobile-nav" popover>` with links carrying `popovertargetaction="hide"` plus Angular `(click)="closeMenu()"` calling `hidePopover?.()` as fallback. Required CSS:

```css
#mobile-nav:not(:popover-open) { display: none; }  /* without this it shows by default */
@media (max-width: 768px) { .nav-links { display: none } .menu-btn { display: inline-block } }
.menu-btn { display: none; ... }
```

## 7. Code-block fixes (dark mode)

- Prism default adds `text-shadow: 0 1px #fff` to code → override `pre, pre code, pre .token { text-shadow: none }`.
- Pico gives inline `code` a background → `pre code { background: transparent; padding: 0 }`.

## Gotchas learned

- Repo rename → update `base` in `vite.config.ts`, `<base href>` in `index.html`, sitemap host.
- `deploy-pages` 404 = Pages source still `legacy` → set `build_type=workflow` via API.
- New content files require dev-server restart (content list is generated at startup).
- GitHub Pages serves `/path/` via `path/index.html`; prerendered routes work out of the box.
