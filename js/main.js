/* ==========================================================
   RIOT MERCH — Shared JS for the static multi-page site
   ========================================================== */

const PRODUCTS = [
  // Remeras
  { id:"p1", name:"Skull Drip Tee",         band:"Iron Maiden",        category:"Remeras",   price:12500, image:"images/product-tshirt-skull.jpg",   isNew:true,  tag:"BESTSELLER" },
  { id:"p7", name:"Heavy Metal Tour Tee",   band:"Judas Priest",       category:"Remeras",   price:13500, image:"images/product-tshirt-tour.jpg",                  tag:"TOUR" },
  { id:"p8", name:"Rock Bend Classic",      band:"The Rolling Stones", category:"Remeras",   price:11900, image:"images/product-tshirt-white.jpg" },
  { id:"p9", name:"Long Sleeve Skulls",     band:"Misfits",            category:"Remeras",   price:16900, image:"images/product-longsleeve.jpg",     isNew:true },

  // Hoodies
  { id:"p2", name:"Lightning Hoodie",       band:"AC/DC",              category:"Hoodies",   price:24900, image:"images/product-hoodie.jpg",         isNew:true },
  { id:"p10",name:"Punk Zip Hoodie",        band:"Green Day",          category:"Hoodies",   price:27900, image:"images/product-hoodie-zip.jpg",                   tag:"DROP 24" },

  // Vinilos
  { id:"p3", name:"Vinilo Ed. Limitada",    band:"Pink Floyd",         category:"Vinilos",   price:18900, image:"images/product-vinyl.jpg",                        tag:"LIMITED" },
  { id:"p11",name:"Red Splatter LP",        band:"Black Sabbath",      category:"Vinilos",   price:21900, image:"images/product-vinyl-red.jpg",      isNew:true,  tag:"LIMITED" },

  // Gorras
  { id:"p4", name:"Tour Cap Black",         band:"Metallica",          category:"Gorras",    price:8900,  image:"images/product-cap.jpg" },
  { id:"p12",name:"Metaller Beanie",        band:"Slayer",             category:"Gorras",    price:7500,  image:"images/product-beanie.jpg" },

  // Camperas
  { id:"p5", name:"Patched Denim Jacket",   band:"Ramones",            category:"Camperas",  price:39900, image:"images/product-jacket.jpg",         isNew:true,  tag:"DROP 24" },
  { id:"p13",name:"Studded Leather Jacket", band:"Motörhead",          category:"Camperas",  price:89900, image:"images/product-leather-jacket.jpg",              tag:"PREMIUM" },

  // Posters
  { id:"p6", name:"Tour Poster 70x50",      band:"Nirvana",            category:"Posters",   price:4900,  image:"images/product-poster.jpg" },
  { id:"p14",name:"Vintage Concert Poster", band:"Led Zeppelin",       category:"Posters",   price:5900,  image:"images/product-poster-vintage.jpg",              tag:"VINTAGE" },

  // Accesorios
  { id:"p15",name:"Enamel Pin Set",         band:"Multi Bands",        category:"Accesorios",price:3900,  image:"images/product-pins.jpg",           isNew:true },
  { id:"p16",name:"Band Tote Bag",          band:"Queen",              category:"Accesorios",price:6900,  image:"images/product-tote.jpg" },
  { id:"p17",name:"Skull Mug 350ml",        band:"Megadeth",           category:"Accesorios",price:4500,  image:"images/product-mug.jpg" },
  { id:"p18",name:"Skull Bandana",          band:"Guns N' Roses",      category:"Accesorios",price:3500,  image:"images/product-bandana.jpg",        isNew:true },
];

const CATEGORIES = ["Todos","Remeras","Hoodies","Vinilos","Gorras","Camperas","Posters","Accesorios"];

/* ----- Cart ----- */
const Cart = {
  key: "riot-cart",
  read() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  write(items) { localStorage.setItem(this.key, JSON.stringify(items)); this.updateBadge(); },
  add(id) {
    const items = this.read(); const p = PRODUCTS.find(x => x.id === id); if (!p) return;
    const f = items.find(i => i.id === id);
    if (f) f.qty++; else items.push({ ...p, qty: 1 });
    this.write(items); toast(`Agregado: ${p.name}`);
  },
  remove(id) { this.write(this.read().filter(i => i.id !== id)); },
  setQty(id, qty) { const items = this.read(); const it = items.find(i=>i.id===id); if(it){ it.qty = Math.max(1, qty); this.write(items); } },
  clear() { this.write([]); },
  count() { return this.read().reduce((s,i)=>s+i.qty, 0); },
  total() { return this.read().reduce((s,i)=>s+i.qty*i.price, 0); },
  updateBadge() {
    const b = document.getElementById("cart-badge"); if (!b) return;
    const c = this.count();
    b.textContent = c; b.style.display = c > 0 ? "inline-flex" : "none";
  }
};

/* ----- Format ----- */
const money = n => "$" + n.toLocaleString("es-AR");

/* ----- Toast ----- */
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
  el.innerHTML = `<strong>RIOT</strong>${msg}`;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ----- Card render ----- */
function productCard(p) {
  return `
    <article class="card fade-up">
      ${p.tag ? `<span class="stamp tag-stamp">${p.tag}</span>` : ""}
      ${p.isNew ? `<span class="tag-new">NEW</span>` : ""}
      <div class="card-img"><img src="${p.image}" alt="${p.name} — ${p.band}" loading="lazy" width="800" height="800"></div>
      <div class="card-body">
        <p class="card-band">${p.band}</p>
        <h3 class="card-name">${p.name}</h3>
        <div class="card-foot">
          <span class="price">${money(p.price)}</span>
          <button class="btn btn-blood" onclick="Cart.add('${p.id}')">Comprar</button>
        </div>
      </div>
    </article>`;
}

/* ----- Nav active link ----- */
function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(a => {
    if (a.dataset.page === path) a.classList.add("active");
  });
}

/* ----- Init on every page ----- */
document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  Cart.updateBadge();
});
