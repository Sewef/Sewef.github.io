
/* ==== pokedex.waitpatch.js — ultra-minimal override (no HTML injection) ====
 * - Adds a tiny waitForSelector() helper (browser-side), inspired by Puppeteer.
 * - Waits for #moveAbilityModal + internal nodes before writing.
 * - Overrides ONLY openMoveModalByName / openAbilityModalByName.
 * - To use: include AFTER json_pokedex.js (with defer).
 */

(function () {
  // tiny waitForSelector (returns the element once found or null after timeout)
  function waitForSelector(selector, { root = document, timeout = 4000, interval = 50 } = {}) {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = () => {
        const el = root.querySelector(selector);
        if (el) return resolve(el);
        if (performance.now() - start >= timeout) return resolve(null);
        setTimeout(tick, interval);
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", tick, { once: true });
      } else {
        tick();
      }
    });
  }

  async function waitModalEls() {
    const root = await waitForSelector("#moveAbilityModal");
    if (!root) return { root: null, label: null, body: null };
    const [label, body] = await Promise.all([
      waitForSelector("#moveAbilityModalLabel", { root }),
      waitForSelector("#moveAbilityModalBody", { root }),
    ]);
    return { root, label, body };
  }

  // Reuse helpers from the main script
  const escapeHtml = window.escapeHtml || ((s) => String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c])));

  const wrapTypes = window.wrapTypes || ((t) => {
    if (!t) return "";
    if (typeof t === "string") return `<span class="type-pill card-type-${t}">${t}</span>`;
    if (!Array.isArray(t)) t = [t];
    return t.map(x => `<span class="type-pill card-type-${x}">${x}</span>`).join("");
  });

  const formatDamageBase = window.formatDamageBase || (() => "");
  const renderMoveDetails = window.renderMoveDetails || ((mv) => {
    if (!mv) return '<p class="text-muted mb-0">Cannot find move.</p>';
    const row = (k, v) => v ? `<div><span class="text-muted">${k}:</span> ${escapeHtml(String(v))}</div>` : "";
    return `${row("Frequency", mv.Frequency)}${row("AC", mv.AC)}${formatDamageBase(mv)}`;
  });
  const renderAbilityDetails = window.renderAbilityDetails || ((ab) => {
    if (!ab) return '<p class="text-muted mb-0">Ability introuvable.</p>';
    const row = (k, v) => v ? `<div><span class="text-muted">${k}:</span> ${escapeHtml(String(v))}</div>` : "";
    return `${row("Frequency", ab.Frequency)}${row("Target", ab.Target)}${row("Trigger", ab.Trigger)}`;
  });

  const loadMoveIndex = window.loadMoveIndex;
  const loadAbilityIndex = window.loadAbilityIndex;

  function getOrCreateMoveAbilityModal(root) {
    if (!root) return null;
    return bootstrap.Modal.getOrCreateInstance(root, { backdrop: true });
  }

  // ---- Overrides (only these two) ----
  async function openMoveModalByName(moveName) {
    const name = String(moveName || "").trim().toLowerCase();
    if (!name) return;

    const { root, label, body } = await waitModalEls();
    if (!root || !label || !body) {
      console.warn("[waitpatch] move modal elements missing in DOM");
      return;
    }

    const idx = await (typeof loadMoveIndex === "function" ? loadMoveIndex() : Promise.resolve(new Map()));
    const mv = idx.get(name) || idx.get(name.replace(/[-–—]/g, " ")) || null;

    const display = mv?.Move || mv?.Name || mv?.__displayName || moveName;
    const typeHtml = mv?.Type ? wrapTypes([mv.Type]) : "";

    label.innerHTML = `<div><div class="fw-semibold">Move — ${escapeHtml(display)}</div><div class="mt-1">${typeHtml}</div></div>`;
    body.innerHTML = renderMoveDetails(mv);

    getOrCreateMoveAbilityModal(root)?.show();
  }

  async function openAbilityModalByName(abilityName) {
    const name = String(abilityName || "").trim().toLowerCase();
    if (!name) return;

    const { root, label, body } = await waitModalEls();
    if (!root || !label || !body) {
      console.warn("[waitpatch] ability modal elements missing in DOM");
      return;
    }

    const idx = await (typeof loadAbilityIndex === "function" ? loadAbilityIndex() : Promise.resolve(new Map()));
    const ab = idx.get(name) || null;
    const display = ab?.Name || ab?.__displayName || abilityName;

    label.textContent = `Ability — ${display}`;
    body.innerHTML = renderAbilityDetails(ab);

    getOrCreateMoveAbilityModal(root)?.show();
  }

  // Export overrides
  window.openMoveModalByName = openMoveModalByName;
  window.openAbilityModalByName = openAbilityModalByName;
})();
