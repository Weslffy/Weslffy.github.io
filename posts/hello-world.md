---
title: Hello, World — Why I Started This Blog
date: 2026-05-12
tags: [meta, intro]
excerpt: First post. A short note on why I'm finally writing things down, and what to expect from this little corner of the internet.
cover: ""
---

# Hello, World

Welcome. This is the first post on my brand new blog — so I figured I should
write about why it exists in the first place.

For years I've kept notes in scattered places: a folder of half-finished
Markdown files, snippets in [Obsidian](https://obsidian.md), even a few
plain text files named `idea-final-v3-actually-final.txt`. None of that
ever made it past my own laptop.

**This is my attempt at fixing that.**

## What you'll find here

I write about whatever I'm currently nerd-sniped by. Recent themes:

- **Web platform** — CSS tricks, weird browser quirks, performance.
- **Tooling & DX** — making the keyboard feel like an extension of the brain.
- **Tiny experiments** — Canvas, WebGL, audio, AI side-projects.
- **Postmortems** — honest write-ups of things that broke and what I learned.

I'll try to keep posts focused, hands-on and full of code you can copy.

## The format

Every post is just a Markdown file in [`posts/`](https://github.com/Weslffy/Weslffy.github.io/tree/main/posts).
The frontmatter at the top looks like this:

```yaml
---
title: My Post Title
date: 2026-05-14
tags: [css, performance]
excerpt: A one-line summary that appears on the listing page.
---
```

That's all you need. No build step, no static-site generator — the page
fetches and renders Markdown on the fly with [marked](https://marked.js.org)
and [highlight.js](https://highlightjs.org).

## Comments

Each post has its own discussion thread, powered by
[Giscus](https://giscus.app). Sign in with GitHub at the bottom of the page
to leave a comment — no other account needed, no tracking, no ads.

## Roadmap

A few things I'd like to add later:

- [ ] RSS feed (`/feed.xml`)
- [ ] Tag pages
- [ ] Dark / light syntax highlighting that follows the site theme
- [ ] Migration to a real SSG (Astro?) once post count crosses ~30

That's it for now. Thanks for stopping by — see you in the next post.

— *Weslffy*
