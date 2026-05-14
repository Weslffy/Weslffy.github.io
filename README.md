# Weslffy.github.io

> A neon, dark-mode personal site & Markdown blog — pure static, zero build step, hosted on GitHub Pages.

🌐 **Live**: <https://weslffy.github.io/>

## Features

- 🎨 **Showy homepage** — animated gradient, glitch hero, particle background, 3D-tilt cards, glassmorphism
- 📓 **Markdown blog** — drop a `.md` file in `posts/`, push, done
- 💬 **Comments** — GitHub-native via [Giscus](https://giscus.app)
- 🌓 **Dark / light** — one-click theme toggle (persisted)
- 🚀 **Zero dependencies to install** — uses CDN scripts only at runtime
- 🪶 **Lightweight** — three small CSS/JS files for the chrome, lazy-loaded extras for posts
- ♿ **A11y aware** — respects `prefers-reduced-motion`, semantic HTML, keyboard friendly

## Project layout

```
.
├── index.html              # Homepage (Hero, About, Skills, Projects, Latest, Stats, Contact, Guestbook)
├── blog.html               # Blog index — searchable post list with tag filter
├── post.html               # Single post viewer (?slug=...)
├── posts/
│   ├── manifest.json       # ordered list of slugs (newest first)
│   ├── *.md                # one post per file, with YAML frontmatter
│   └── img/                # post images (referenced as `img/foo.png` in posts)
├── assets/
│   ├── css/style.css       # All styles (theme variables, animations, prose)
│   └── js/
│       ├── main.js         # Global UI: cursor, loader, theme, particles, nav, tilt
│       ├── posts.js        # Shared: manifest loader, frontmatter parser, fetcher
│       ├── latest.js       # Homepage "Latest Posts" preview
│       ├── blog.js         # Blog index — search & tag filter
│       └── post.js         # Markdown rendering + reading bar + prev/next + Giscus
├── .nojekyll               # Disable Jekyll — pure static hosting
└── README.md
```

## Writing a new post

1. Create a Markdown file at `posts/<your-slug>.md` with this header:

   ```yaml
   ---
   title: My new post
   date: 2026-05-14
   tags: [css, performance]
   excerpt: One-line summary shown on the blog listing.
   ---

   # My new post

   Your content here. Supports **bold**, _italics_, lists, tables,
   blockquotes, fenced code with syntax highlighting, images, and so on.
   ```

2. Add the slug to the **top** of `posts/manifest.json` (newest first):

   ```json
   {
     "slugs": [
       "your-slug",
       "building-this-site",
       "hello-world"
     ]
   }
   ```

3. Commit and push. GitHub Pages picks it up within ~30 seconds.

### Frontmatter fields

| Field | Required | Example | Notes |
| --- | --- | --- | --- |
| `title`   | yes | `Hello World` | Plain string. Quotes optional. |
| `date`    | yes | `2026-05-14`  | ISO format. |
| `tags`    | no  | `[css, web]`  | Array in brackets, comma-separated. |
| `excerpt` | no  | `My summary…` | Shown on listing & previews. |
| `cover`   | no  | `img/hero.png`| Reserved for future hero images. |

### Tips for post content

- **Code blocks** support fenced syntax (` ```js `, ` ```rust `, etc.). They get a hover "copy" button automatically.
- **Images** can use relative paths like `img/foo.png` — they're auto-resolved to `posts/img/foo.png`.
- **Internal links** to other posts: `[link text](post.html?slug=hello-world)`.
- **Headings** (`##`, `###`) get auto-generated anchor links on hover.

## Enabling comments (Giscus)

The site ships with Giscus wired up but with placeholder IDs. To turn it on:

1. **Enable Discussions** on your repo:
   `https://github.com/Weslffy/Weslffy.github.io/settings` → *Features* → check **Discussions**
2. **Install the Giscus app** on the repo: <https://github.com/apps/giscus>
3. Visit <https://giscus.app/> and fill in `Weslffy/Weslffy.github.io`. It will print:
   - `data-repo-id="…"`
   - `data-category-id="…"`
4. Replace both `REPLACE_ME` placeholders in:
   - `index.html` → the `<script>` inside `<section id="guestbook">`
   - `assets/js/post.js` → inside `injectGiscus()`
5. Push. Each blog post will get its own thread (mapping = `pathname`).

## Customization quick map

| Want to change | Edit |
| --- | --- |
| Name & tagline       | `index.html` Hero section |
| Typewriter lines     | `assets/js/main.js` → `words` array |
| Brand colors         | `assets/css/style.css` → `:root` `--c1/--c2/--c3` |
| Tech stack chips     | `index.html` `#skills` |
| Featured projects    | `index.html` `#projects` |
| GitHub username      | Search & replace `Weslffy` across the repo |
| Contact links        | `index.html` `#contact` |
| Avatar               | Auto-pulled from `github.com/<user>.png` — update there |

## Local preview

GitHub Pages serves `.md` files via HTTP, but `file://` won't trigger `fetch()`.
Run any static server in the repo root:

```bash
# Python
python3 -m http.server 8080

# or Node
npx serve .
```

Then open <http://localhost:8080>.

## Deployment

The repo is named `Weslffy.github.io` (a "user site"), so GitHub Pages
auto-deploys the `main` branch from the root. Push and wait ~30 seconds.

```bash
git add .
git commit -m "feat: new post / tweak / etc."
git push
```

## Roadmap (ideas)

- [ ] RSS feed generated from `posts/manifest.json` at runtime
- [ ] Per-tag landing pages (`/blog.html?tag=css`)
- [ ] Prefetch the next post on hover
- [ ] Migrate to Astro if the post count crosses ~30 (Markdown files would carry over unchanged)

---

Built with ❤ by **Weslffy**.
