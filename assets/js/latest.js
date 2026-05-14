/* Renders the 3 most recent posts on the homepage. */
(async () => {
  const grid = document.getElementById('latestGrid');
  if (!grid || !window.Posts) return;

  try {
    const posts = (await window.Posts.getAllPostMeta()).slice(0, 3);
    if (posts.length === 0) {
      grid.innerHTML =
        '<p class="muted center" style="grid-column:1/-1">No posts yet — soon!</p>';
      return;
    }

    grid.innerHTML = posts.map(p => `
      <a class="latest-card glass reveal" href="post.html?slug=${encodeURIComponent(p.slug)}">
        <div class="latest-meta">
          <time>${window.Posts.formatDate(p.meta.date)}</time>
          <span class="dot-sep">·</span>
          <span>${p.readTime}</span>
        </div>
        <h3>${escapeHtml(p.meta.title)}</h3>
        <p class="muted">${escapeHtml(p.meta.excerpt)}</p>
        <div class="chip-row small">
          ${p.meta.tags.slice(0, 3).map(t => `<span class="chip">${escapeHtml(t)}</span>`).join('')}
        </div>
        <span class="latest-arrow" aria-hidden="true">→</span>
      </a>
    `).join('');

    // Animate the freshly-inserted cards via the existing reveal observer.
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }
  } catch (err) {
    console.warn('[latest.js]', err);
    grid.innerHTML =
      '<p class="muted center" style="grid-column:1/-1">Couldn\'t load posts. Visit <a class="ulink" href="blog.html">/blog</a> directly.</p>';
  }

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
})();
