// Lista de videos de fans. Editá para sumar más.
// type: 'youtube' (usa el ID después de v=) o 'instagram' (URL completa del Reel)
window.RIOT_FAN_VIDEOS = [
  { id:'v1', type:'youtube', src:'JR-Qwd-Sv-8', fan:'Lucía M.',  location:'Estadio River, Buenos Aires', band:"Guns N' Roses", product:'Remera Appetite for Destruction' },
  { id:'v2', type:'youtube', src:'hPVBx763Wio', fan:'Javier R.', location:'Hipódromo de Palermo',         band:'Metallica',      product:'Hoodie Master of Puppets' },
  { id:'v3', type:'youtube', src:'BxlZoyfHoN0', fan:'Mara P.',   location:'Vélez Sarsfield',              band:'Iron Maiden',    product:'Remera The Trooper' },
  { id:'v4', type:'youtube', src:'9AtKwu07z_M', fan:'Diego F.',  location:'Estadio Único, La Plata',       band:'AC/DC',          product:'Campera de jean con parches' },
  { id:'v5', type:'youtube', src:'hK7Ktn_Oy5Q', fan:'Sofía T.',  location:'Movistar Arena',                band:'Queen',          product:'Remera Bohemian Rhapsody' },
  { id:'v6', type:'youtube', src:'6sVcEWCs9U0', fan:'Tomás A.',  location:'Niceto Club',                   band:'Nirvana',        product:'Hoodie Smiley' },
];

(function(){
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function thumbFor(v){
    if (v.type === 'youtube') return `https://i.ytimg.com/vi/${v.src}/hqdefault.jpg`;
    return '';
  }
  function embedFor(v){
    if (v.type === 'youtube') return `https://www.youtube.com/embed/${v.src}?autoplay=1&rel=0`;
    return v.src.replace(/\/\?$/,'/') + '?autoplay=1&referrerpolicy=strict-origin-when-cross-origin' + embed;
  }

  function cardHTML(v){
    const tag = v.type === 'youtube' ? 'YOUTUBE' : 'INSTAGRAM';
    return `
      <article class="fan-card" data-id="${v.id}">
        <div class="fan-media" data-embed="${escapeHtml(embedFor(v))}" data-label="Reproducir video de ${escapeHtml(v.fan)}">
          <img class="fan-thumb" src="${thumbFor(v)}" alt="${escapeHtml(v.fan)} en concierto de ${escapeHtml(v.band)}" loading="lazy">
          <div class="fan-overlay">
            <span class="fan-play" aria-hidden="true">▶</span>
          </div>
          <span class="fan-tag">${tag}</span>
        </div>
        <div class="fan-body">
          <p class="fan-band">${escapeHtml(v.band)}</p>
          <p class="fan-name">${escapeHtml(v.fan)}</p>
          <p class="fan-loc">${escapeHtml(v.location)}</p>
          <p class="fan-prod">Luciendo: <span>${escapeHtml(v.product)}</span></p>
        </div>
      </article>`;
  }

  function bindCards(root){
    root.querySelectorAll('.fan-media').forEach(el => {
      el.addEventListener('click', () => {
        const url = el.dataset.embed;
        if (!url) return;
        el.innerHTML = `<iframe src="${url}" title="Video de fan" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen frameborder="0" style="position:absolute;inset:0;width:100%;height:100%"></iframe>`;
        el.classList.add('fan-active');
      });
    });
  }

  window.renderFanVideos = function(selector, limit){
    const container = document.querySelector(selector);
    if (!container) return;
    const list = (limit ? window.RIOT_FAN_VIDEOS.slice(0, limit) : window.RIOT_FAN_VIDEOS);
    container.innerHTML = list.map(cardHTML).join('');
    bindCards(container);
  };
})();
