/* Cart page logic */
function renderCart() {
  const items = Cart.read();
  const wrap = document.getElementById("cart-wrap");
  if (!wrap) return;

  if (items.length === 0) {
    wrap.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🛒</div>
        <h1 style="font-size:clamp(2.5rem,6vw,5rem)">Carrito vacío</h1>
        <p style="color:var(--muted);max-width:420px;margin:1rem auto">Todavía no agregaste merch. Date una vuelta por la tienda y armá tu uniforme.</p>
        <a href="productos.html" class="btn btn-blood" style="margin-top:1.5rem">EXPLORAR PRODUCTOS</a>
      </div>`;
    return;
  }

  const sub = Cart.total();
  const ship = sub > 30000 ? 0 : 2500;
  const total = sub + ship;

  wrap.innerHTML = `
    <header style="margin-bottom:2rem">
      <p class="eyebrow">TU BOTÍN</p>
      <h1 style="font-size:clamp(2.5rem,6vw,5rem)">Carrito (${Cart.count()})</h1>
    </header>
    <div class="cart-grid">
      <div>
        ${items.map(i => `
          <article class="cart-item">
            <img src="${i.image}" alt="${i.name}" loading="lazy">
            <div class="cart-item-info">
              <p class="card-band">${i.band}</p>
              <h3 class="card-name">${i.name}</h3>
              <p style="color:var(--muted);font-size:.85rem;margin-top:.25rem">${i.category}</p>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.75rem">
                <div class="qty">
                  <button onclick="changeQty('${i.id}', ${i.qty - 1})">−</button>
                  <span>${i.qty}</span>
                  <button onclick="changeQty('${i.id}', ${i.qty + 1})">+</button>
                </div>
                <span class="price">${money(i.price * i.qty)}</span>
              </div>
            </div>
            <button class="icon-btn" aria-label="Eliminar" onclick="removeItem('${i.id}')">✕</button>
          </article>
        `).join("")}
      </div>
      <aside class="summary">
        <h2>Resumen</h2>
        <div class="row"><span>Subtotal</span><span>${money(sub)}</span></div>
        <div class="row"><span>Envío</span><span>${ship === 0 ? "GRATIS" : money(ship)}</span></div>
        <div class="row total"><span>Total</span><span class="price">${money(total)}</span></div>
        <button class="btn btn-blood btn-block" onclick="checkout()">FINALIZAR COMPRA</button>
        <button onclick="clearCart()" style="display:block;margin:.75rem auto 0;color:var(--muted);font-size:.85rem">Vaciar carrito</button>
      </aside>
    </div>`;
}

function changeQty(id, qty) { Cart.setQty(id, qty); renderCart(); }
function removeItem(id) { Cart.remove(id); renderCart(); }
function clearCart() { Cart.clear(); renderCart(); }
function checkout() { toast("Pedido enviado al checkout (demo)"); }

document.addEventListener("DOMContentLoaded", renderCart);
