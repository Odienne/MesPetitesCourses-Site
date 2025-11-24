// Simple client-side HTML includes for static sites
// Usage: <div data-include="components/navbar.html"></div>
// This will fetch the file and inline its HTML. Nested includes are supported.

(async function () {
  async function includeOnce(root) {
    const nodes = Array.from(root.querySelectorAll('[data-include]'));
    if (nodes.length === 0) return 0;

    await Promise.all(
      nodes.map(async (el) => {
        const src = el.getAttribute('data-include');
        if (!src) return;
        try {
          const res = await fetch(src, { cache: 'no-cache' });
          if (!res.ok) throw new Error(`Failed to fetch ${src}: ${res.status}`);
          const html = await res.text();
          el.innerHTML = html;
          el.removeAttribute('data-include');
        } catch (err) {
          console.error(err);
          el.innerHTML = `<!-- include error: ${src} -->`;
          el.removeAttribute('data-include');
        }
      })
    );

    return nodes.length;
  }

  async function includeAll(root = document) {
    let count = await includeOnce(root);
    // Process nested includes until none remain
    while (count > 0) {
      count = await includeOnce(root);
    }
  }

  function applyCommonEnhancements() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    const updated = document.getElementById('last-updated');
    if (updated) updated.textContent = new Date().toLocaleDateString();
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(async () => {
    await includeAll();
    applyCommonEnhancements();
    document.dispatchEvent(new CustomEvent('includes:ready'));
  });
})();
