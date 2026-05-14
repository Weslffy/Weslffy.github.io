/* =========================================================
 * Weslffy.github.io · Single-post viewer
 *  - Reads ?slug=... from URL
 *  - Renders Markdown via `marked`
 *  - Syntax highlighting via highlight.js (loaded in page)
 *  - Reading progress bar
 *  - Prev / next navigation from manifest
 *  - Per-post Giscus thread (mapping=pathname includes ?slug=)
 * ======================================================= */

(async () => {
  const params = new URLSearchParams(location.search);
  const slug   = params.get('slug');

  const $ = (sel) => document.querySelector(sel);
  const headerEl  = $('#postHeader');
  const titleEl   = $('#postTitle');
  const dateEl    = $('#postDate');
  const rtEl      = $('#postReadTime');
  const excerptEl = $('#postExcerpt');
  const tagsEl    = $('#postTags');
  const contentEl = $('#postContent');
  const errorEl   = $('#postError');
  const footerEl  = $('#postFooter');
  const prevEl    = $('#prevPost');
  const nextEl    = $('#nextPost');

  if (!slug) {
    return showError('No slug provided in URL.');
  }
  if (!window.Posts || typeof window.marked === 'undefined') {
    return showError('Required scripts failed to load.');
  }

  /* ---------- configure marked ---------- */
  const renderer = new window.marked.Renderer();
  // External links open in a new tab; internal stay in-place.
  renderer.link = (href, title, text) => {
    const isExternal = /^https?:\/\//.test(href);
    const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    const t = title ? ` title="${title}"` : '';
    return `<a href="${href}"${t}${attrs}>${text}</a>`;
  };
  // Resolve image paths relative to /posts/ so authors can just write "img/foo.png".
  renderer.image = (href, title, text) => {
    let src = href;
    if (!/^(https?:)?\/\//.test(src) && !src.startsWith('/') && !src.startsWith('posts/')) {
      src = `posts/${src.replace(/^\.\//, '')}`;
    }
    const t = title ? ` title="${title}"` : '';
    return `<img src="${src}" alt="${text}"${t} loading="lazy" />`;
  };

  // NOTE: marked v12 dropped the built-in `highlight` option; we run
  // hljs.highlightElement on every <pre><code> after rendering instead.
  window.marked.setOptions({ renderer, gfm: true, breaks: false });

  /* ---------- load post & manifest in parallel ---------- */
  let post, slugs;
  try {
    [post, slugs] = await Promise.all([
      window.Posts.getPost(slug),
      window.Posts.getManifest(),
    ]);
  } catch (err) {
    console.error('[post.js]', err);
    return showError(err.message);
  }

  /* ---------- render header ---------- */
  document.title             = `${post.meta.title} · Weslffy`;
  document.getElementById('pageTitle').textContent = document.title;
  titleEl.textContent        = post.meta.title;
  dateEl.textContent         = window.Posts.formatDate(post.meta.date);
  dateEl.setAttribute('datetime', post.meta.date);
  rtEl.textContent           = post.readTime;
  excerptEl.textContent      = post.meta.excerpt;
  excerptEl.hidden           = !post.meta.excerpt;
  tagsEl.innerHTML           = (post.meta.tags || [])
    .map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('');
  headerEl.hidden            = false;

  /* ---------- render body ---------- */
  contentEl.innerHTML        = window.marked.parse(post.body);
  contentEl.hidden           = false;

  // Re-run hljs on already-rendered blocks (covers the case where marked's
  // built-in highlight option was a no-op for some reason).
  if (window.hljs) {
    contentEl.querySelectorAll('pre code').forEach(b => {
      if (!b.classList.contains('hljs')) window.hljs.highlightElement(b);
    });
  }

  // Add `id` anchors to headings + copy-link affordance.
  contentEl.querySelectorAll('h2, h3, h4').forEach(h => {
    if (!h.id) h.id = slugify(h.textContent);
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.className = 'heading-anchor';
    a.setAttribute('aria-label', 'Anchor link');
    a.textContent = '#';
    h.appendChild(a);
  });

  // "Copy" button on each code block.
  contentEl.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.textContent = 'copy';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        btn.textContent = 'copied!';
        setTimeout(() => (btn.textContent = 'copy'), 1400);
      } catch {
        btn.textContent = 'failed';
      }
    });
    pre.appendChild(btn);
  });

  /* ---------- prev / next ---------- */
  const idx = slugs.indexOf(slug);
  if (idx >= 0) {
    // Manifest is newest-first → idx-1 is newer, idx+1 is older.
    const newer = idx > 0                ? slugs[idx - 1] : null;
    const older = idx < slugs.length - 1 ? slugs[idx + 1] : null;
    if (newer) {
      const np = await window.Posts.getPost(newer).catch(() => null);
      if (np) {
        nextEl.href = `post.html?slug=${encodeURIComponent(newer)}`;
        nextEl.querySelector('strong').textContent = np.meta.title;
        nextEl.hidden = false;
      }
    }
    if (older) {
      const op = await window.Posts.getPost(older).catch(() => null);
      if (op) {
        prevEl.href = `post.html?slug=${encodeURIComponent(older)}`;
        prevEl.querySelector('strong').textContent = op.meta.title;
        prevEl.hidden = false;
      }
    }
    footerEl.hidden = newer === null && older === null;
  }

  /* ---------- reading progress bar ---------- */
  const bar = document.getElementById('readingBar');
  if (bar) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = `scaleX(${max ? Math.min(1, h.scrollTop / max) : 0})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- giscus (per-post) ---------- */
  injectGiscus();

  /* ---------- helpers ---------- */
  function showError(msg) {
    if (errorEl) {
      errorEl.hidden = false;
      document.getElementById('postErrorPath').textContent = `posts/${slug || '<slug>'}.md`;
    }
    console.warn('[post.js]', msg);
    document.getElementById('loader')?.classList.add('hide');
  }
  function slugify(s) {
    return String(s).toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  function injectGiscus() {
    const container = document.getElementById('giscus-container');
    if (!container) return;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    Object.entries({
      'data-repo':              'Weslffy/Weslffy.github.io',
      'data-repo-id':           'REPLACE_ME',
      'data-category':          'General',
      'data-category-id':       'REPLACE_ME',
      'data-mapping':           'pathname',
      'data-strict':            '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata':     '0',
      'data-input-position':    'top',
      'data-theme':             'transparent_dark',
      'data-lang':              'en',
      'data-loading':           'lazy',
    }).forEach(([k, v]) => s.setAttribute(k, v));
    container.appendChild(s);
  }
})();
