document.querySelectorAll("[data-copy-manifest]").forEach((button) => {
  button.addEventListener("click", async () => {
    const originalLabel = button.textContent;
    try {
      await navigator.clipboard.writeText(button.dataset.copyManifest);
      button.textContent = "Copied!";
      button.dataset.copyState = "success";
    } catch {
      button.textContent = "Copy failed";
      button.dataset.copyState = "error";
    }
    window.setTimeout(() => {
      button.textContent = originalLabel;
      delete button.dataset.copyState;
    }, 1800);
  });
});

const sectionLinks = [...document.querySelectorAll("nav a[href^='#']:not([href='#'])")];
const linksById = new Map(
  sectionLinks.map((link) => [link.getAttribute("href").slice(1), link])
);

if ("IntersectionObserver" in window && linksById.size) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sectionLinks.forEach((link) => link.removeAttribute("aria-current"));
    linksById.get(visible.target.id)?.setAttribute("aria-current", "location");
  }, { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.2, 0.6] });

  linksById.forEach((link, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}
