---
title: Building This Site — A Pure-Static Blog on GitHub Pages
date: 2026-05-14
tags: [web, css, javascript, github-pages]
excerpt: A behind-the-scenes tour of how this site renders Markdown posts in the browser, with zero build step and zero server.
---

# Building This Site

I wanted three things from my personal site:

1. **Look cool** — neon, glassmorphism, a touch of motion.
2. **Be a blog** — drop a `.md` file, push, done.
3. **No build step** — no `npm run build`, no CI to babysit.

Turns out you can have all three on free GitHub Pages. Here's how.

## The big picture

```
Weslffy.github.io/
├── index.html        # the showy homepage
├── blog.html         # post listing
├── post.html         # single-post viewer (?slug=...)
├── posts/
│   ├── manifest.json # ordered slug list
│   └── *.md          # one Markdown file per post
└── assets/
    ├── css/style.css
    └── js/{main,blog,post,latest}.js
```

The trick: `post.html` reads `?slug=hello-world` from the URL, fetches
`posts/hello-world.md`, parses the YAML frontmatter, and pipes the body
through [marked](https://marked.js.org) for HTML. Code blocks then get
syntax-highlighted by [highlight.js](https://highlightjs.org).

## Frontmatter, in 20 lines of JS

I didn't want a YAML library just for five fields. A tiny regex parser
is plenty:

```js
function parseFrontMatter(md) {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: md };

  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^['"].*['"]$/.test(v)) v = v.slice(1, -1);
    if (/^\[.*\]$/.test(v)) {
      v = v.slice(1, -1).split(',')
            .map(s => s.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
    }
    meta[kv[1]] = v;
  }
  return { meta, body: m[2] };
}
```

That's it. Supports strings, quoted strings, and bracket arrays — which
covers every blog frontmatter I've ever written.

## Why client-side render Markdown?

There are real trade-offs. Let me be honest about them:

| Aspect       | Client-side render | Static-site generator |
| ------------ | ------------------ | --------------------- |
| First paint  | One extra fetch    | Pre-rendered HTML     |
| SEO          | Decent (modern crawlers run JS) | Great |
| Author flow  | Edit `.md`, push   | Edit `.md`, push, wait for CI |
| Tooling      | None               | Node.js, build cache, etc. |
| Tweakability | Pure HTML/CSS/JS   | Theme system        |

For a personal site with <50 posts, the client-side approach wins on
**author flow** and **tweakability**. If this scales, I'll migrate to
Astro and keep the same Markdown files — that's the beauty of keeping
content in plain files.

## The fun part: the visuals

A few details I'm proud of:

- **Particle background** with mouse-attraction (Canvas 2D + dpr scaling).
- **Glitch effect** on the hero name via two `::before`/`::after` text
  copies clipped on different intervals.
- **Glassmorphism border glow** using a gradient mask with
  `mask-composite: exclude` — one extra rule, zero extra DOM.
- **Reading progress bar** at the very top of post pages, computed in
  one `scroll` listener.

## Comments without a backend

[Giscus](https://giscus.app) is genuinely magical. It maps each page's
`pathname` to a GitHub Discussion. Add the widget once, get one thread
per post forever — sign-in, moderation and notifications all live on
GitHub.

```html
<script src="https://giscus.app/client.js"
        data-repo="Weslffy/Weslffy.github.io"
        data-repo-id="…"
        data-category="General"
        data-category-id="…"
        data-mapping="pathname"
        data-theme="transparent_dark"
        data-loading="lazy"
        async crossorigin="anonymous"></script>
```

## What's next

- Add an RSS feed (just a JS that builds XML from `manifest.json`).
- Pre-fetch the next post's Markdown when the cursor enters its card.
- Maybe sprinkle in some MDX-style components — `<CodeSandbox>`-ish things.

If you've made it this far, thanks for reading. Comments below 👇

— *Weslffy*
