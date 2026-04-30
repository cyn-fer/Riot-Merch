/* Productos page: filters + search */
let currentCat = "Todos";
let currentQ = "";

function renderProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  const filtered = PRODUCTS.filter(p => {
    const okCat = currentCat === "Todos" || p.category === currentCat;
    const okQ = !currentQ || (p.name + " " + p.band).toLowerCase().includes(currentQ.toLowerCase());
    return okCat && okQ;
  });
  grid.innerHTML = filtered.length
    ? filtered.map(productCard).join("")
    : `<p style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--muted)" class="stencil">SIN RESULTADOS</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const chips = document.getElementById("chips");
  if (chips) {
    chips.innerHTML = CATEGORIES.map(c =>
      `<button class="chip ${c==='Todos'?'active':''}" data-cat="${c}">${c}</button>`
    ).join("");
    chips.addEventListener("click", e => {
      const btn = e.target.closest(".chip"); if (!btn) return;
      currentCat = btn.dataset.cat;
      chips.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === btn));
      renderProducts();
    });
  }
  const search = document.getElementById("search");
  if (search) search.addEventListener("input", e => { currentQ = e.target.value; renderProducts(); });
  renderProducts();
});
