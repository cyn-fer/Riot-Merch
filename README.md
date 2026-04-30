# RIOT MERCH — Sitio estático (HTML/CSS/JS)

Tienda online de merchandising de bandas de rock. SPA estático multi-página.

## Estructura

```
riot-merch-static/
├── index.html         # Home: hero, novedades, Spotify, reseñas, CTA
├── productos.html     # Catálogo con filtros y búsqueda
├── carrito.html       # Carrito con cantidades, totales y envío
├── css/
│   └── styles.css     # Sistema de diseño completo (rock/grunge)
├── js/
│   ├── main.js        # Productos, carrito (localStorage), nav, toast
│   ├── home.js        # Render de novedades
│   ├── productos.js   # Filtros + búsqueda
│   └── carrito.js     # Render del carrito + checkout demo
└── images/            # Imágenes de hero, productos y logo
```

## Cómo usar

1. Abrí `index.html` en tu navegador, o
2. Servilo con cualquier server estático:
   ```bash
   npx serve .
   # o
   python3 -m http.server 8080
   ```

## Personalización rápida

- **Colores**: editá las variables CSS en `:root` dentro de `css/styles.css` (`--blood`, `--bg`, etc.)
- **Productos**: array `PRODUCTS` al inicio de `js/main.js`
- **Playlist Spotify**: cambiá la `src` del iframe en `index.html`
- **WhatsApp**: cambiá el número en los enlaces `wa.me/...`
- **Redes sociales**: enlaces en el `<footer>` de cada página

## Características

- ✅ Diseño rock/grunge oscuro con tipografías display
- ✅ Carrito persistente con `localStorage`
- ✅ Reproductor de Spotify embebido
- ✅ Reseñas, novedades, marquee animado
- ✅ Botón flotante de WhatsApp
- ✅ Responsive
- ✅ SEO básico (titles, descriptions, alt)

© RIOT MERCH
