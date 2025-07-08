<<<<<<< Updated upstream
function renderData(data, container, depth = 0) {
    const skipFields = new Set(["Source", "Category"]);

    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;
        const value = data[key];

        if (skipFields.has(key)) continue;

        if (typeof value === "object" && value !== null) {
            if (!Array.isArray(value)) {
                // Choose heading size based on depth (h5, h6, small)
                const label = document.createElement(depth < 2 ? `h${5 + depth}` : "div");
                label.className = `text-muted mb-2 ${depth >= 2 ? "small fs-6" : ""}`;
                label.textContent = key;
                container.appendChild(label);
            }
            renderData(value, container, depth + 1);
        } else {
            const p = document.createElement("p");
            p.innerHTML = `<strong>${key}:</strong> ${value.replaceAll("\n", "<br>")}`;
            container.appendChild(p);
        }
    }
}

// en haut de ton script
let sidebarData = {};      // contiendra les features
let activeSources = new Set();
let linkContainer = null;  // on le créera dans buildSidebar
let fullData = {};
let currentActiveLink = null;
let activeCategories = new Set();

function loadFeatures(file) {
    fetch(file)
        .then(response => response.json())
        .then(jsonData => {
            fullData = jsonData;

            buildSidebar(jsonData);
            // Render first visible section
            // Trouver la première classe dont la source ET la catégorie sont visibles
            const firstVisibleClass = Object.entries(jsonData).find(([className, cls]) =>
                activeSources.has(cls.Source ?? "Unknown") &&
                activeCategories.has(cls.Category ?? "Other")
            );

            const firstKey = firstVisibleClass?.[0];
            if (firstKey) {
                renderSection(firstKey);
                const sidebarLink = document.querySelector(`[data-section="${firstKey}"]:not([data-subsection])`);
                if (sidebarLink) setActiveLink(sidebarLink);
            }

        })
        .catch(err => console.error("Error loading JSON:", err));
}


function buildSidebar(data) {
    // on « globalise » data
    sidebarData = data;

    const sidebar = document.getElementById("sidebar");
    sidebar.innerHTML = "";

    // === CHAMP DE RECHERCHE ===
    const searchWrapper = document.createElement("div");
    searchWrapper.className = "mb-3";
    searchWrapper.innerHTML = `
      <input
        type="text"
        id="sidebar-search"
        class="form-control"
        placeholder="Rechercher..."
      >
    `;
    sidebar.appendChild(searchWrapper);

    const searchInput = document.getElementById("sidebar-search");
    // on rafraîchit à chaque frappe
    searchInput.addEventListener("input", renderSidebarLinks);

    // === SOURCE FILTERS ===
    const sources = Array.from(
        new Set(Object.values(sidebarData).map(e => e.Source || "Unknown"))
    ).sort();
    activeSources = new Set(sources);

    const srcTitle = document.createElement("label");
    srcTitle.className = "form-label mt-2";
    srcTitle.textContent = "Filter by Source:";
    sidebar.appendChild(srcTitle);

    const srcFilterGroup = document.createElement("div");
    srcFilterGroup.className = "mb-3 d-flex flex-column gap-1";
    sidebar.appendChild(srcFilterGroup);

    sources.forEach(src => {
        const id = `filter-source-${src}`;
        srcFilterGroup.innerHTML += `
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="${id}" checked>
              <label class="form-check-label" for="${id}">${src}</label>
            </div>`;
    });

    // Re-bind des filtres source
    sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb =>
        cb.addEventListener("change", () => {
          // 1) met à jour la sidebar
          renderSidebarLinks();
          // 2) si on a déjà une section active, on la rerender
          if (currentActiveLink) {
            const sec = currentActiveLink.dataset.section;
            const sub = currentActiveLink.dataset.subsection || null;
            renderSection(sec, sub);
          }
        })
      );

    // création du conteneur de liens
    linkContainer = document.createElement("div");
    sidebar.appendChild(linkContainer);

    // première passe
    renderSidebarLinks();
}

function renderSidebarLinks() {
    // 1) Mise à jour des sources cochées
    activeSources.clear();
    document.querySelectorAll('input[type="checkbox"][id^="filter-source-"]')
        .forEach(cb => {
            if (cb.checked) {
                activeSources.add(cb.id.replace("filter-source-", ""));
            }
        });

    // 2) Texte de recherche
    const searchQuery = document
        .getElementById("sidebar-search")
        .value
        .trim()
        .toLowerCase();

    // 3) Sauvegarde des panels ouverts
    const openCatIds = Array.from(
        document.querySelectorAll('.collapse.show')
    ).map(el => el.id);

    // 4) Vide le container de liens
    linkContainer.innerHTML = "";

    // 5) Regroupement & ordre (General + catégories)
    const classesByCategory = {};
    let generalEntry = null;
    const orderedEntries = Object.entries(sidebarData).sort(([a], [b]) => {
        if (a === "General") return -1;
        if (b === "General") return 1;
        return a.localeCompare(b);
    });

    orderedEntries.forEach(([className, cls]) => {
        const src = cls.Source || "Unknown";
        const cat = cls.Category || "Other";
        if (className === "General") {
            generalEntry = { className, cls, source: src };
        } else {
            if (!classesByCategory[cat]) classesByCategory[cat] = [];
            classesByCategory[cat].push({ className, cls, source: src });
        }
    });

    // 6) Afficher « General » si ok
    linkContainer.appendChild(
        createLinkItem(
            generalEntry.className,
            generalEntry.source,
            3,                          // indentation de niveau 3 (comme les autres)
            { section: generalEntry.className }  // <-- on passe bien section="General"
        )
    );


    // 7) Parcours des catégories
    Object.entries(classesByCategory).forEach(([category, list]) => {
        const collapseId = `collapse-cat-${category.replace(/\s+/g, "-")}`;
        const wrapper = document.createElement("div");
        wrapper.className = "mb-2";

        // bouton category
        const catBtn = document.createElement("button");
        catBtn.className = "btn btn-sm btn-light w-100 text-start collapse-toggle collapsed";
        catBtn.setAttribute("data-bs-toggle", "collapse");
        catBtn.setAttribute("data-bs-target", `#${collapseId}`);
        catBtn.setAttribute("aria-expanded", "false");
        catBtn.textContent = `📁 ${category}`;
        wrapper.appendChild(catBtn);

        const catCollapse = document.createElement("div");
        catCollapse.className = "collapse";
        catCollapse.id = collapseId;

        list.sort((a, b) => a.className.localeCompare(b.className))
            .forEach(({ className, cls, source }) => {

                const featureKeys = Object.keys(cls.Features);
                const hasBranches = featureKeys.some(k =>
                    typeof cls.Features[k] === "object" &&
                    cls.Features[k][className]
                );

                if (hasBranches) {
                    // parent + branches
                    const branchWrapper = document.createElement("div");
                    branchWrapper.className = "list-group";

                    // toggle parent
                    const parentToggle = document.createElement("a");
                    parentToggle.href = "#";
                    parentToggle.className = "list-group-item list-group-item-action ps-3 d-flex justify-content-between align-items-center";
                    parentToggle.dataset.bsToggle = "collapse";
                    parentToggle.dataset.bsTarget = `#collapse-${className.replace(/\s+/g, "-")}`;
                    parentToggle.setAttribute("aria-expanded", "false");

                    const labelSpan = document.createElement("span");
                    labelSpan.className = "d-flex justify-content-between align-items-center w-100";
                    labelSpan.innerHTML = `
                  <span>${className}</span>
                  <span class="badge bg-light text-muted ms-auto">${source}</span>
                `;
                    const triangleSpan = document.createElement("span");
                    triangleSpan.className = "triangle-toggle ms-auto";

                    parentToggle.append(labelSpan, triangleSpan);

                    const branchCollapse = document.createElement("div");
                    branchCollapse.className = "collapse";
                    branchCollapse.id = `collapse-${className.replace(/\s+/g, "-")}`;

                    let visibleBranches = 0;
                    featureKeys.forEach(branch => {
                        const branchObj = cls.Features[branch];
                        if (
                            typeof branchObj === "object" &&
                            branchObj[className]
                        ) {
                            const branchData = branchObj[className];
                            const branchSource = branchData.Source || source;
                            const txt = branch.toLowerCase();

                            if (
                                activeSources.has(branchSource) &&
                                (!searchQuery ||
                                    txt.includes(searchQuery) ||
                                    className.toLowerCase().includes(searchQuery))
                            ) {
                                visibleBranches++;
                                const link = createLinkItem(
                                    branch,
                                    branchSource,
                                    4,
                                    { section: className, subsection: branch }
                                );
                                branchCollapse.appendChild(link);
                            }
                        }
                    });

                    if (visibleBranches > 0) {
                        branchWrapper.append(parentToggle, branchCollapse);
                        catCollapse.appendChild(branchWrapper);
                    }

                } else {
                    // classe simple
                    const txt = className.toLowerCase();
                    if (
                        activeSources.has(source) &&
                        (!searchQuery || txt.includes(searchQuery))
                    ) {
                        const link = createLinkItem(
                            className,
                            source,
                            3,
                            { section: className }
                        );
                        catCollapse.appendChild(link);
                    }
                }
            });

        // **NOUVEAU** : n'appendre wrapper que si on a des liens à l’intérieur
        if (catCollapse.children.length > 0) {
            wrapper.appendChild(catCollapse);
            linkContainer.appendChild(wrapper);
        }
    });

    // 8) Sync Bootstrap et réouverture
    setTimeout(syncCollapses, 0);
}

function createLinkItem(label, src, psLevel = 3, data = {}) {
    // si on a oublié de fournir data.section, on le remplit avec le label
    if (!data.section) data.section = label;
    const link = document.createElement("a");
    link.href = "#";
    link.className = `list-group-item list-group-item-action ps-${psLevel} d-flex justify-content-between align-items-center`;
    link.innerHTML = `
      <span>${label}</span>
      <span class="badge bg-light text-muted ms-auto">${src}</span>
    `;
    Object.entries(data).forEach(([k, v]) => link.dataset[k] = v);
    link.addEventListener("click", e => {
        e.preventDefault();
        renderSection(data.section, data.subsection);
        setActiveLink(link);
    });
    return link;
}

function syncCollapses() {
    const openCatIds = Array.from(
        document.querySelectorAll('.collapse.show')
    ).map(el => el.id);
    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(toggle => {
        const target = document.querySelector(toggle.dataset.bsTarget);
        const triangle = toggle.querySelector(".triangle-toggle");
        if (!target || !triangle) return;
        const inst = bootstrap.Collapse.getOrCreateInstance(target, { toggle: false });
        triangle.classList.toggle("open", target.classList.contains("show"));
        target.addEventListener("show.bs.collapse", () => triangle.classList.add("open"));
        target.addEventListener("hide.bs.collapse", () => triangle.classList.remove("open"));
    });
    openCatIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) bootstrap.Collapse.getOrCreateInstance(el).show();
    });
}


// ───── RENDER SECTION ─────
function renderSection(sectionTitle, subSection = null) {
    const container = document.getElementById("cards-container");
    container.innerHTML = "";

    const section = fullData[sectionTitle];
    if (!section || !section.Features) return;

    // Titre
    const heading = document.createElement("h2");
    heading.className = "mb-4 mt-3";
    heading.textContent = subSection || sectionTitle;
    container.appendChild(heading);

    // Search bar
    const searchDiv = document.createElement("div");
    searchDiv.className = "mb-3";
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search features…";
    searchInput.className = "form-control";
    searchDiv.appendChild(searchInput);
    container.appendChild(searchDiv);

    // Row container
    const row = document.createElement("div");
    row.className = "row g-3";
    container.appendChild(row);

    const alwaysBadges = sectionTitle === "General";
    let firstBadge = true;

    const features = subSection
        ? { [subSection]: section.Features[subSection] }
        : section.Features;

    Object.entries(features).forEach(([featKey, featVal]) => {
        // ------> récupération de la source effective de la feature
        const featSource = featVal.Source || section.Source;
        // si cette source n'est pas active dans la sidebar, on skip
        if (!activeSources.has(featSource)) return;

        // Cas « branché » : on a un objet dont la clé sectionTitle contient les sous-features
        if (featVal[sectionTitle] && typeof featVal[sectionTitle] === "object") {
            const branchData = featVal[sectionTitle];

            // *** On NE crée PLUS la carte principale pour les sections à une seule branche ***
            const isSingleBranchSection =
                Object.keys(section.Features).length === 1;

            // Parcours des sous-features
            Object.entries(branchData).forEach(([subKey, subVal]) => {
                const subSource = subVal.Source || featVal.Source || section.Source;
                if (!activeSources.has(subSource)) return;
                if (typeof subVal === "object") {
                    // injecte Source/Category si manquants
                    const data = { ...subVal };
                    if (!data.Source) data.Source = featVal.Source || section.Source;
                    if (!data.Category) data.Category = section.Category;

                    // badge uniquement sur la première ou toujours si General
                    const showBadge = alwaysBadges || firstBadge;
                    row.appendChild(createCard(subKey, data, section, showBadge));
                    firstBadge = false;
                }
            });
        } else {
            // feature simple (pas de branche)
            const showBadge = alwaysBadges || firstBadge;
            row.appendChild(createCard(featKey, featVal, section, showBadge));
            firstBadge = false;
        }
=======
// === Citronnades – Unified Classes Viewer =============================
// Affichage dynamique du JSON unifié :
//   Classe → { category, source, branches:[ { name, features:[…] } ] }
// ---------------------------------------------------------------------------
// EXIGENCES PARTICULIÈRES
//   • « General » : toujours lien direct en tête de sidebar. Chaque Feature
//     arbore un badge Source.
//   • Sidebar : Catégorie ▼ Classe ▼ Branche sauf si la classe n'a qu'une
//     unique branche nommée « Default » (dans ce cas, lien direct).
//   • Filtre Source appliqué AU NIVEAU DES BRANCHES (une classe reste visible
//     si ≥1 branche correspond). Le badge de chaque lien reprend la source de
//     la branche.
//   • **NOUVEAU** : dans le panneau central, **une carte = une Feature**.
//     Quand un objet contient des sous‑features, on ne rend PAS une « carte
//     mère » englobante. Toutes les leaves (features feuilles) sont rendues
//     au même niveau.
// ---------------------------------------------------------------------------
// Dépendances : Bootstrap 5 (collapse). Facultatif : CSS pour .triangle-toggle.
// ---------------------------------------------------------------------------

// ------------------------- VARIABLES GLOBALES ------------------------------
let classesData = {};
let activeSources = new Set();
let currentLink = null;

// ------------------------- CHARGEMENT JSON ---------------------------------
function loadClasses(path) {
  fetch(path)
    .then(r => r.json())
    .then(json => {
      classesData = json;
      buildSidebar();
      const firstCls = classesData.General ? "General" : Object.keys(classesData)[0];
      const firstBr = classesData[firstCls].branches[0].name;
      renderSection(firstCls, firstBr);
      const l = document.querySelector(`[data-section="${firstCls}"][data-branch="${firstBr}"]`);
      if (l) setActiveLink(l);
    })
    .catch(err => console.error("JSON load error:", err));
}

// ------------------------- SIDEBAR -----------------------------------------
function buildSidebar() {
  const sb = document.getElementById("sidebar");
  sb.innerHTML = `
    <div class="mb-3">
      <input type="text" id="sidebar-search" class="form-control" placeholder="Rechercher…">
    </div>`;
  document.getElementById("sidebar-search").addEventListener("input", renderSidebar);

  // -- filtres Source -------------------------------------------------------
  const sourcesSet = new Set();
  Object.values(classesData).forEach(cls => {
    if (cls.source) sourcesSet.add(cls.source);
    cls.branches.forEach(br => {
      const src = branchSource(br, cls.source);
      if (src) sourcesSet.add(src);
>>>>>>> Stashed changes
    });
  });

<<<<<<< Updated upstream
    // Recherche
    searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        row.childNodes.forEach(col => {
            const title = col.querySelector(".card-title")?.textContent.toLowerCase() || "";
            col.style.display = title.includes(q) ? "" : "none";
        });
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
=======
  const fWrap = document.createElement("div");
  fWrap.className = "mb-3";
  fWrap.innerHTML = `<label class="form-label">Filter by Source:</label>`;
  sb.appendChild(fWrap);
  [...sourcesSet].sort().forEach(src => {
    const id = `filter-src-${src}`;
    fWrap.insertAdjacentHTML("beforeend", `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="${id}" checked>
        <label class="form-check-label" for="${id}">${src}</label>
      </div>`);
  });
  fWrap.querySelectorAll("input").forEach(cb =>
    cb.addEventListener("change", () => {
      renderSidebar();                                   // ← sidebar mise à jour
      if (currentLink && currentLink.dataset.section === "General") {
        // on recharge la section General pour appliquer le nouveau filtre
        renderSection("General", "Default");
        // (l’appel conserve scrollTo et la recherche locale déjà en place)
      }
    })
  );


  sb.insertAdjacentHTML("beforeend", `<div id="sidebar-links"></div>`);
  renderSidebar();
>>>>>>> Stashed changes
}

// ------------- Source d'une branche ---------------------------------------
function branchSource(branch, fallback) {
  const featWithSrc = branch.features.find(f => f.Source || f.source);
  return featWithSrc ? (featWithSrc.Source || featWithSrc.source) : fallback || "Unknown";
}

// ------------- Rendu Sidebar ----------------------------------------------
function renderSidebar() {
  const box = document.getElementById("sidebar-links");
  box.innerHTML = "";

<<<<<<< Updated upstream
// ───── CREATE CARD ─────
function createCard(title, data, meta, showBadges = true) {
    const col = document.createElement("div");
    col.className = "col-md-12 mb-3";

    const card = document.createElement("div");
    card.className = "card h-100 bg-white border shadow-sm";

    const body = document.createElement("div");
    body.className = "card-body bg-light";

    // titre + badges
    const h4 = document.createElement("h4");
    h4.className = "card-title";
    let html = title;
    if (showBadges) {
        const cat = data.Category || meta.Category;
        const src = data.Source || meta.Source;
        if (cat && cat !== "Unknown") html += ` <span class="badge bg-secondary">${cat}</span>`;
        if (src) html += ` <span class="badge bg-info">${src}</span>`;
    }
    h4.innerHTML = html;
    body.appendChild(h4);

    // contenu
    renderData(data, body, 0);

    card.appendChild(body);
    col.appendChild(card);
    return col;
}

function setActiveLink(link) {
    if (currentActiveLink) {
        currentActiveLink.classList.remove("active");
    }
    link.classList.add("active");
    currentActiveLink = link;
}
=======
  activeSources.clear();
  document.querySelectorAll('[id^="filter-src-"]:checked').forEach(cb => activeSources.add(cb.id.replace("filter-src-", "")));

  const q = document.getElementById("sidebar-search").value.trim().toLowerCase();

  // ----- GENERAL -----------------------------------------------------------
  if (classesData.General) {
    const genVisible = classesData.General.branches[0].features.some(f => activeSources.has(f.Source || f.source || classesData.General.source));
    if (genVisible && (!q || "general".includes(q))) {
      box.appendChild(makeLink("General", classesData.General.source, { section: "General", branch: "Default" }, 3));
    }
  }

  // ----- CATÉGORIES --------------------------------------------------------
  const cats = {};
  Object.entries(classesData).forEach(([clsName, cls]) => {
    if (clsName === "General") return;
    if (q && !clsName.toLowerCase().includes(q)) return;

    const visibleBranches = cls.branches.filter(br => activeSources.has(branchSource(br, cls.source)));
    if (visibleBranches.length === 0) return;

    (cats[cls.category || "Other"] ??= []).push([clsName, cls, visibleBranches]);
  });

  Object.keys(cats).sort().forEach(cat => {
    const catId = `collapse-cat-${cat.replace(/\s+/g, "-")}`;
    box.insertAdjacentHTML("beforeend", `
      <button class="btn btn-sm btn-light w-100 text-start collapse-toggle mb-1" data-bs-toggle="collapse" data-bs-target="#${catId}">📁 ${cat}</button>`);
    const catCol = document.createElement("div");
    catCol.className = "collapse mb-2";
    catCol.id = catId;
    box.appendChild(catCol);

    cats[cat].sort(([a], [b]) => a.localeCompare(b)).forEach(([clsName, cls, branches]) => {
      const singleDefault = branches.length === 1 && branches[0].name === "Default";
      if (singleDefault) {
        catCol.appendChild(makeLink(clsName, branchSource(branches[0], cls.source), { section: clsName, branch: "Default" }, 4));
      } else {
        const clsId = `collapse-cls-${clsName.replace(/\s+/g, "-")}`;
        catCol.insertAdjacentHTML("beforeend", `
          <a href="#" class="list-group-item list-group-item-action ps-3 d-flex justify-content-between align-items-center collapse-toggle" data-bs-toggle="collapse" data-bs-target="#${clsId}">
            <span>${clsName}</span>
            <span class="badge bg-light text-muted ms-auto text-truncate" style="max-width:10rem" title="${cls.source}">${cls.source}</span>
            <span class="triangle-toggle ms-2"></span>
          </a>`);
        const brWrap = document.createElement("div");
        brWrap.className = "collapse";
        brWrap.id = clsId;
        catCol.appendChild(brWrap);
        branches.forEach(br => brWrap.appendChild(makeLink(br.name, branchSource(br, cls.source), { section: clsName, branch: br.name }, 5)));
      }
    });
  });
}

// ------------- Helper : Création de lien ----------------------------------
function makeLink(label, src, data = {}, pad = 3) {
  const a = document.createElement("a");
  a.href = "#";
  a.className = `list-group-item list-group-item-action ps-${pad} d-flex justify-content-between align-items-center`;
  a.innerHTML = `
    <span>${label}</span>
    <span class="badge bg-light text-muted ms-auto text-truncate" style="max-width:10rem" title="${src}">${src}</span>`;
  Object.entries(data).forEach(([k, v]) => a.dataset[k] = v);
  a.addEventListener("click", e => {
    e.preventDefault();
    renderSection(data.section, data.branch);
    setActiveLink(a);
  });
  return a;
}
function setActiveLink(el) {
  if (currentLink) currentLink.classList.remove("active");
  el.classList.add("active");
  currentLink = el;
}

function featureSource(feat, fallback) {
  return feat.Source || feat.source || fallback || "Unknown";
}


// ------------------------- SECTION MAIN -----------------------------------
function renderSection(clsName, branchName = "Default") {
  const pane = document.getElementById("cards-container");
  pane.innerHTML = "";
  const cls = classesData[clsName];
  if (!cls) return;

  const branches = cls.branches.filter(b => b.name === branchName);
  const title = (cls.branches.length === 1 && branchName === "Default")
    ? clsName
    : `${clsName} – ${branchName}`;
  pane.insertAdjacentHTML("afterbegin", `<h2 class="mt-3 mb-4">${title}</h2>`);
  pane.insertAdjacentHTML("beforeend",
    `<div class="mb-3"><input type="text" id="features-search" class="form-control" placeholder="Search features…"></div>`);

  const row = document.createElement("div");
  row.className = "row g-3";
  pane.appendChild(row);

  if (clsName === "General") {
    // --- FLUX PRINCIPAL ----------------------------------------------------
    let cardIndex = 0;                                   // pour 1ʳᵉ-carte badge
    branches.forEach(br => {
      br.features.forEach(feat => {
        // → si on est dans General ET la Source de la Feature n’est pas cochée,
        //   on saute entièrement cette Feature (et donc ses sous-features)
        if (clsName === "General" &&
          !activeSources.has(featureSource(feat, cls.source))) {
          return;                                        // on zappe
        }
        row.appendChild(createCard(
          feat,
          cls,
          cardIndex++ === 0,                            // 1ʳᵉ carte ?
          clsName === "General"
        ));
      });
    });
  } else {
    // ---- comportement précédent : flatten complet
    const leafs = [];
    branches.forEach(br => br.features.forEach(f => leafs.push(...collectLeafFeatures(f))));
    leafs.forEach((leaf, idx) =>
      row.appendChild(createCard(leaf, cls, idx === 0, false, /* embedSubs = */ false))
    );
  }

  document.getElementById("features-search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    row.querySelectorAll(".card").forEach(c =>
      c.closest(".col-md-12").style.display =
      c.dataset.title.toLowerCase().includes(q) ? "" : "none"
    );
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}


// --------- Collecte récursive des Features (carte-mère + feuilles) --------
const LEAF_KEYS = ["Effect", "Frequency", "Tags", "Trigger", "Target",
  "Prerequisites",            // ← utile pour vos données
  "effect", "frequency", "tags", "trigger", "target"];

function isLeaf(obj) {
  return LEAF_KEYS.some(k => k in obj);
}

/**
 * Retourne un tableau plat contenant :
 *   – la Feature courante si elle porte au moins un des LEAF_KEYS ;
 *   – toutes les sous-features profondes trouvées dans ses propriétés
 *     objet ou dans son éventuel tableau `children`.
 *
 * @param {Object} featObj    L’objet Feature à explorer
 * @param {string} [nameOverride] Nom forcé pour la carte (clé-propriété par ex.)
 * @returns {Object[]}        Tableau de Features prêtes pour `createCard`
 */
function collectLeafFeatures(featObj, nameOverride) {
  const list = [];
  const name = nameOverride || featObj.name || "(unnamed)";

  // 1) Si l’objet possède des champs « leaf », on pousse la carte-mère.
  if (isLeaf(featObj)) {
    list.push({ ...featObj, name });
  }

  // 2) Exploration des propriétés qui sont elles-mêmes des objets Feature.
  Object.entries(featObj).forEach(([k, v]) => {
    if (
      v && typeof v === "object" && !Array.isArray(v) &&
      // on ignore les simples métadonnées
      !["Source", "source"].includes(k)
    ) {
      list.push(...collectLeafFeatures(v, k));   // nom = clé-propriété
    }
  });

  // 3) Exploration d’un éventuel tableau children[].
  if (Array.isArray(featObj.children)) {
    featObj.children.forEach(ch => list.push(...collectLeafFeatures(ch)));
  }

  return list;
}



/* ------------------------------------------------------------------ *
 * 1. createCard() – rend une carte et, récursivement, ses sous-cartes
 * ------------------------------------------------------------------ */
function createCard(feat, clsMeta, firstInBranch, isGeneral, nested = false) {

  /* ----- conteneur colonne (pas de colonne Bootstrap quand imbriqué) */
  const col = document.createElement("div");
  if (!nested) col.className = "col-md-12";

  /* ----- carte ------------------------------------------------------ */
  const card = document.createElement("div");
  card.className = `card ${nested ? "mb-2" : "h-100"} bg-white border shadow-sm`;
  card.dataset.title = feat.name || "(unnamed)";

  const body = document.createElement("div");
  body.className = "card-body bg-light";

  /* ---------- badges ------------------------------------------------ */
  // Règle d’affichage :
  //   • Dans « General » : TOUS les badges, même imbriqués.
  //   • Ailleurs        : badges UNIQUEMENT sur la 1ʳᵉ carte racine (firstInBranch).
  const showBadges = isGeneral ? true : (!nested && firstInBranch);

  const catBadge = isGeneral
    ? (feat.Category || null)        // badge individuel
    : (showBadges ? clsMeta.category : null);   // badge de la classe

  const srcBadge = (isGeneral || showBadges)
    ? (feat.Source || feat.source || clsMeta.source)
    : null;

  let titleHTML = feat.name || "(unnamed)";
  if (catBadge) titleHTML += ` <span class="badge bg-secondary">${catBadge}</span>`;
  if (srcBadge) titleHTML += ` <span class="badge bg-info">${srcBadge}</span>`;

  body.insertAdjacentHTML("afterbegin", `<h5 class="card-title">${titleHTML}</h5>`);

  /* ---------- champs simples --------------------------------------- */
  Object.entries(feat).forEach(([k, v]) => {
    if (["name", "Category", "Source", "source"].includes(k)) return;
    if (v && typeof v === "object") return;                // géré plus bas
    body.insertAdjacentHTML(
      "beforeend",
      `<p><strong>${k}:</strong> ${v.toString().replaceAll("\n", "<br>")}</p>`
    );
  });

  /* ---------- sous-features imbriquées ----------------------------- */
  addSubFeatures(feat, clsMeta, body, isGeneral);

  card.appendChild(body);
  col.appendChild(card);
  return col;
}

/* ------------------------------------------------------------------ *
 * 2. addSubFeatures() – collecte et rend toutes les feuilles enfants
 * ------------------------------------------------------------------ */
function addSubFeatures(obj, clsMeta, container, isGeneral) {
  Object.entries(obj).forEach(([key, val]) => {
    if (!val || typeof val !== "object") return;

    // a) si c’est déjà une feuille -> carte enfant
    if (isLeaf(val)) {
      container.appendChild(
        createCard({ ...val, name: key }, clsMeta, false, isGeneral, true)
      );
      return;
    }

    // b) si c’est un tableau d’objets -> on descend
    if (Array.isArray(val)) {
      val.forEach(el => addSubFeatures(el, clsMeta, container, isGeneral));
      return;
    }

    // c) sinon, on continue la récursion (profondément imbriqué)
    addSubFeatures(val, clsMeta, container, isGeneral);
  });
}
>>>>>>> Stashed changes
