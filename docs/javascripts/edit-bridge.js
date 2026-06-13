// ──────────────────────────────────────────────────────────────────────────
//  Click-to-edit bridge — runs inside the mkdocs-rendered page
//
//  Only active when this page is loaded inside an iframe (the Decap editor's
//  live-preview pane). Makes every heading + paragraph clickable; on click,
//  postMessages a "jump-to-edit" event to the parent (the Decap admin), which
//  scrolls the WYSIWYG editor to the matching block.
//
//  Heading text is the key — we don't need MkDocs source line numbers because
//  WYSIWYG headings render as <h1>/<h2>/... elements with identical text.
// ──────────────────────────────────────────────────────────────────────────

(function () {
  // Skip if not embedded — this script is for the editor preview only.
  if (window.self === window.top) return;

  const STYLES = `
    [data-edit-jump] {
      cursor: pointer !important;
      position: relative;
      transition: background-color 0.12s ease, box-shadow 0.12s ease;
      border-radius: 4px;
    }
    /* Use inset box-shadow instead of outline+offset — keeps the hover
       area attached to the element so the cursor never crosses a "gap"
       that would end :hover and make the highlight flicker. */
    [data-edit-jump]:hover {
      background-color: rgba(110, 193, 255, 0.18) !important;
      box-shadow: inset 0 0 0 2px #6ec1ff !important;
    }
    /* Tooltip sits INSIDE the element (top-right corner) so moving the
       mouse toward it does NOT leave the hover area. */
    [data-edit-jump]:hover::after {
      content: "✎ click to edit";
      position: absolute;
      top: 2px;
      right: 4px;
      font-size: 10px;
      background: rgba(31, 41, 55, 0.95);
      color: white;
      padding: 1px 6px;
      border-radius: 3px;
      font-family: Inter, system-ui, sans-serif;
      font-weight: 500;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1000;
    }
    /* Small elements (tab labels, buttons) — shrink the tooltip */
    label[data-edit-jump]:hover::after,
    a.md-button[data-edit-jump]:hover::after {
      content: "✎";
      font-size: 11px;
      top: -2px;
      right: -2px;
      padding: 0 4px;
    }
  `;
  const s = document.createElement('style');
  s.textContent = STYLES;
  document.head.appendChild(s);

  function jumpTo(text, level) {
    try {
      // window.top jumps straight to the outermost window (the Decap admin),
      // skipping intermediate iframes like Decap's PreviewPaneFrame.
      window.top.postMessage(
        {
          type: 'mkdocs-edit-jump',
          text: text.trim(),
          level: level || 0,
        },
        '*'
      );
    } catch (e) {
      console.warn('edit-bridge postMessage failed', e);
    }
  }

  function wireClick(el, kind, getText, level) {
    el.setAttribute('data-edit-jump', kind);
    el.addEventListener('click', e => {
      // Don't hijack the permalink (¶) link or other interactive children
      if (e.target.closest('.headerlink, button, input, select, textarea')) return;
      e.preventDefault();
      e.stopPropagation();
      const text = (typeof getText === 'function' ? getText() : getText).trim();
      if (!text) return;
      jumpTo(text, level || 0);
    });
  }

  function wire() {
    // ── Headings — primary navigation anchors
    document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6').forEach(el => {
      const text = el.textContent.replace(/¶$/, '').trim();
      if (!text) return;
      const level = parseInt(el.tagName.slice(1), 10);
      wireClick(el, 'heading', text, level);
    });

    // ── Paragraphs — use first 60 chars as the match key
    document.querySelectorAll('article p').forEach(el => {
      const text = el.textContent.trim();
      if (text.length < 8) return;
      wireClick(el, 'paragraph', () => text.slice(0, 60), 0);
    });

    // ── List items
    document.querySelectorAll('article li').forEach(el => {
      // Get just the first line of text (skip nested list content)
      const firstNode = [...el.childNodes].find(n => n.nodeType === 3 || n.nodeType === 1);
      const text = el.textContent.trim();
      if (text.length < 4) return;
      wireClick(el, 'listitem', () => text.slice(0, 60), 0);
    });

    // ── Code blocks (pre > code)
    document.querySelectorAll('article pre').forEach(el => {
      const code = el.querySelector('code');
      const text = (code || el).textContent.trim();
      if (text.length < 2) return;
      wireClick(el, 'code', () => text.slice(0, 80), 0);
    });

    // ── Tables — anchor by first column of first body row (most-distinct key)
    document.querySelectorAll('article table').forEach(el => {
      // Use a fingerprint: first th + first td of first body row
      const headerCell = el.querySelector('thead th, tr th')?.textContent.trim() || '';
      const firstDataCell = el.querySelector('tbody tr td, tr td')?.textContent.trim() || '';
      const fingerprint = (firstDataCell || headerCell).slice(0, 50);
      if (!fingerprint) return;
      wireClick(el, 'table', () => fingerprint, 0);
    });

    // ── Tabbed groups — disambiguate by including the FIRST line of body content
    // (multiple `=== "vLLM"` tab groups can exist; pairing with body uniqueifies)
    document.querySelectorAll('article .tabbed-set').forEach(el => {
      el.querySelectorAll('label').forEach(label => {
        const tabName = label.textContent.trim();
        // Locate the body panel that the label controls — first ~30 chars of body
        const forId = label.getAttribute('for');
        const panel = forId ? el.querySelector(`#${forId} ~ .tabbed-content, .tabbed-content [data-tab="${forId}"]`) : null;
        const body = panel
          ? panel.textContent.trim().slice(0, 30)
          : (el.querySelector('.tabbed-content')?.textContent.trim().slice(0, 30) || '');
        // Markdown source is `=== "TabName"` — we send that PLUS the first body
        // chars so the listener can disambiguate.
        const sent = body ? `=== "${tabName}"\n    ${body}` : `=== "${tabName}"`;
        wireClick(label, 'tab', () => sent, 0);
      });
    });

    // ── Collapsibles (??? note details) — disambiguate with first ~30 chars of body
    document.querySelectorAll('article details').forEach(el => {
      const summary = el.querySelector('summary');
      if (!summary) return;
      const title = summary.textContent.trim();
      if (!title) return;
      // Get the body content (everything inside <details> except the <summary>)
      const bodyEl = el.cloneNode(true);
      bodyEl.querySelector('summary')?.remove();
      const body = bodyEl.textContent.trim().slice(0, 30);
      const sent = body ? `??? "${title}"\n    ${body}` : title;
      wireClick(el, 'details', () => sent, 0);
    });

    // ── Admonitions (!!! tip)
    document.querySelectorAll('article .admonition').forEach(el => {
      const title = el.querySelector('.admonition-title')?.textContent.trim();
      if (!title) return;
      const bodyEl = el.cloneNode(true);
      bodyEl.querySelector('.admonition-title')?.remove();
      const body = bodyEl.textContent.trim().slice(0, 30);
      const sent = body ? `!!! "${title}"\n    ${body}` : title;
      wireClick(el, 'admonition', () => sent, 0);
    });

    // ── Material buttons — send the link href so we can find the markdown URL
    document.querySelectorAll('article a.md-button').forEach(el => {
      const text = el.textContent.trim();
      const href = el.getAttribute('href') || '';
      if (!text) return;
      // Try to send something that matches `[text](href)` in the markdown source
      const sent = href ? `${text}](${href.split('/').pop()})` : text;
      wireClick(el, 'mdbutton', () => sent, 0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
