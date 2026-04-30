/* Home-only logic: render novedades grid */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("novedades-grid");
  if (grid) {
    const news = PRODUCTS.filter(p => p.isNew);
    grid.innerHTML = news.map(productCard).join("");
  }
});
