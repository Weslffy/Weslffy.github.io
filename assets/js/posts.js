/* =========================================================
 * Weslffy.github.io · Shared post helpers
 *  - Manifest loader (posts/manifest.json)
 *  - Tiny YAML frontmatter parser (no deps)
 *  - Post fetcher with in-memory cache
 *  - Reading-time + date formatter
 * Exposed as window.Posts so other scripts can use it.
 * ======================================================= */

(() => {
  const MANIFEST_URL = 'posts/manifest.json';
  const POST_URL     = slug => `posts/${slug}.md`;

  const cache = new Map();          // slug -> { meta, body, html? }
  let manifestPromise = null;

  /* ---------- manifest ---------- */
  async function getManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch(MANIFEST_URL, { cache: 'no-cache' })
        .then(r => {
          if (!r.ok) throw new Error(`manifest fetch failed: ${r.status}`);
          return r.json();
        })
        .then(j => Array.isArray(j.slugs) ? j.slugs : []);
    }
    return manifestPromise;
  }

  /* ---------- frontmatter parser ----------
   * Supports:
   *   key: value
   *   key: "quoted value"
   *   key: [a, b, "c d"]
   * That's enough for typical blog frontmatter.
   * ----------------------------------------*/
  function parseFrontMatter(md) {
    const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (!m) return { meta: {}, body: md };

    const meta = {};
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (!kv) continue;
      let v = kv[2].trim();

      if (v === '') { meta[kv[1]] = ''; continue; }

      // bracket arrays  [a, b, "c"]
      if (/^\[.*\]$/.test(v)) {
        meta[kv[1]] = v.slice(1, -1)
          .split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        continue;
      }
      // quoted strings
      if ((v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      meta[kv[1]] = v;
    }
    return { meta, body: m[2] };
  }

  /* ---------- post fetcher ---------- */
  async function getPost(slug) {
    if (cache.has(slug)) return cache.get(slug);
    const res = await fetch(POST_URL(slug), { cache: 'no-cache' });
    if (!res.ok) throw new Error(`post fetch failed: ${slug} (${res.status})`);
    const text = await res.text();
    const { meta, body } = parseFrontMatter(text);
    const post = {
      slug,
      meta: {
        title:   meta.title   || slug,
        date:    meta.date    || '',
        tags:    Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
        excerpt: meta.excerpt || '',
        cover:   meta.cover   || '',
      },
      body,
      readTime: estimateReadTime(body),
    };
    cache.set(slug, post);
    return post;
  }

  /* ---------- helpers ---------- */
  function estimateReadTime(text) {
    // ~225 wpm for English, ~450 cpm for CJK — average between them.
    const words = text.trim().split(/\s+/).length;
    const min = Math.max(1, Math.round(words / 225));
    return `${min} min read`;
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /* ---------- batch ---------- */
  async function getAllPostMeta() {
    const slugs = await getManifest();
    const posts = await Promise.all(slugs.map(s => getPost(s).catch(() => null)));
    return posts.filter(Boolean);
  }

  window.Posts = {
    getManifest,
    getPost,
    getAllPostMeta,
    parseFrontMatter,
    formatDate,
  };
})();
