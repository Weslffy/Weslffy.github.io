/* =========================================================
 * Weslffy.github.io · Blog index page
 *  - Loads all posts, renders cards
 *  - Live search across title / excerpt / tags
 *  - Multi-select tag filter
 * ======================================================= */

(async () => {
  const list   = document.getElementById('blogList');
  const empty  = document.getElementById('blogEmpty');
  const search = document.getElementById('blogSearch');
  const tagBox = document.getElementById('tagFilter');
  if (!list || !window.Posts) return;

  let posts = [];
  let activeTags = new Set();
  let query = '';

  try {
    posts = await window.Posts.getAllPostMeta();
    document.getElementById('loader')?.classList.add('hide');
  } catch (err) {
    console.error('[blog.js]', err);
    list.innerHTML = `
      <div class="post-error glass" style="grid-column:1/-1">
        <h3>Couldn't load posts</h3>
        <p class="muted">Check <code>posts/manifest.json</code> and try again.</p>
        <p class="muted small">If you opened this file via <code>file://</code>, run a local server first.</p>
      </div>`;
    return;
  }

  /* ---------- tag chips ---------- */
  const tags = Array.from(new Set(posts.flatMap(p => p.meta.tags))).sort();
  tagBox.innerHTML = tags.map(t =>
    `<button type="button" class="chip tag" data-tag="${escapeAttr(t)}">${escapeHtml(t)}</button>`
  ).join('');

  tagBox.addEventListener('click', e => {
    const btn = e.target.closest('button.tag');
    if (!btn) return;
    const t = btn.dataset.tag;
    if (activeTags.has(t)) { activeTags.delete(t); btn.classList.remove('active'); }
    else                   { activeTags.add(t);    btn.classList.add('active'); }
    render();
  });

  /* ---------- search ---------- */
  search?.addEventListener('input', e => {
    query = e.target.value.trim().toLowerCase();
    render();
  });

  /* ---------- render ---------- */
  function render() {
    const filtered = posts.filter(p => {
      if (activeTags.size > 0 && !p.meta.tags.some(t => activeTags.has(t))) return false;
      if (!query) return true;
      const blob = [
        p.meta.title, p.meta.excerpt, ...(p.meta.tags || []),
      ].join(' ').toLowerCase();
      return blob.includes(query);
    });

    if (filtered.length === 0) {
      list.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    list.innerHTML = filtered.map((p, i) => `
      <a class="blog-card glass reveal" style="--i:${i}"
         href="post.html?slug=${encodeURIComponent(p.slug)}">
        <div class="blog-card-meta">
          <time>${window.Posts.formatDate(p.meta.date)}</time>
          <span class="dot-sep">·</span>
          <span>${p.readTime}</span>
        </div>
        <h2>${escapeHtml(p.meta.title)}</h2>
        <p class="muted">${escapeHtml(p.meta.excerpt)}</p>
        <div class="chip-row small">
          ${p.meta.tags.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}
        </div>
        <span class="blog-card-cta">Read post <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></span>
      </a>
    `).join('');

    // Wire the reveal animation for the freshly-rendered cards.
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.08 });
      list.querySelectorAll('.reveal').forEach(el => io.observe(el));
    } else {
      list.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }
  }

  render();

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }
})();
