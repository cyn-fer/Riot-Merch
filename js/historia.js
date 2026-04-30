// Historia del Rock — usa CSV embebido en la versión estática y deja Google Sheets como respaldo
(function () {
  const SHEET_PUB_ID = "2PACX-1vQtKdeAmKfKCYZ8VUG4VEf3gI3YDrko3OoHEKy0uwGPEwWJ5FmnXxdnNF_JpYeELZ6XjknkhRRsU8B9";
  const CSV_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_PUB_ID}/pub?output=csv`;
  const PAGE_SIZE = 30;
  const DECADES = ["Todas","1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s"];

  const state = { songs: [], filtered: [], q: "", decade: "Todas", page: 1, currentKey: null, playing: false };
  const previewCache = new Map();

  function parseCSV(text) {
    const rows = []; let row = [], cur = "", inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"' && text[i+1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ',') { row.push(cur); cur = ""; }
        else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ""; }
        else if (c === '\r') {}
        else cur += c;
      }
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  const num = v => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  const yearOf = s => { const m = (s||"").match(/\d{4}/); return m ? +m[0] : 0; };
  const decadeOf = y => y ? `${Math.floor(y/10)*10}s` : "?";
  function escapeHtml(s){return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

  // ============ iTunes preview via JSONP ============
  function jsonp(url, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const cb = "__itunes_cb_" + Date.now() + "_" + Math.random().toString(36).slice(2);
      const s = document.createElement("script");
      const to = setTimeout(() => { cleanup(); reject(new Error("timeout")); }, timeoutMs);
      function cleanup(){ clearTimeout(to); try{ delete window[cb]; }catch(e){} if (s.parentNode) s.parentNode.removeChild(s); }
      window[cb] = function(data){ cleanup(); resolve(data); };
      s.src = url + "&callback=" + cb;
      s.onerror = () => { cleanup(); reject(new Error("network")); };
      document.head.appendChild(s);
    });
  }
  function findPreview(name, artist) {
    const key = (artist + "::" + name).toLowerCase();
    if (previewCache.has(key)) return Promise.resolve(previewCache.get(key));
    const term = encodeURIComponent(artist + " " + name);
    const url = "https://itunes.apple.com/search?term=" + term + "&media=music&entity=song&limit=5";
    return jsonp(url).then(data => {
      const hit = (data && data.results || []).find(r => r.previewUrl) || null;
      const result = hit ? { url: hit.previewUrl, artwork: hit.artworkUrl100 } : { url: null };
      previewCache.set(key, result);
      return result;
    }).catch(() => {
      const result = { url: null };
      previewCache.set(key, result);
      return result;
    });
  }

  function ensurePlayer() {
    let el = document.getElementById("hist-player");
    if (el) return el;
    el = document.createElement("div");
    el.id = "hist-player";
    el.style.cssText = "position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);z-index:1000;width:min(560px,calc(100vw - 2rem));background:var(--bg-2);border:2px solid var(--blood);box-shadow:0 0 24px rgba(220,38,38,.4);padding:.75rem;display:none;align-items:center;gap:.75rem";
    el.innerHTML = `
      <img id="hp-art" alt="" style="width:56px;height:56px;object-fit:cover;border:1px solid var(--border);display:none">
      <div style="flex:1;min-width:0">
        <p id="hp-artist" class="eyebrow" style="margin:0;font-size:.7rem"></p>
        <p id="hp-name" style="margin:0;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></p>
        <audio id="hp-audio" controls style="width:100%;margin-top:.25rem;height:32px;color-scheme:dark"></audio>
      </div>
      <button id="hp-close" aria-label="Cerrar" style="background:transparent;border:0;color:inherit;cursor:pointer;font-size:1.25rem;padding:.25rem .5rem">✕</button>
    `;
    document.body.appendChild(el);
    el.querySelector("#hp-close").addEventListener("click", () => {
      const a = el.querySelector("#hp-audio"); a.pause(); a.removeAttribute("src"); a.load();
      el.style.display = "none";
      state.currentKey = null; state.playing = false;
      renderTable(); renderFeatured();
    });
    const audio = el.querySelector("#hp-audio");
    audio.addEventListener("play", () => { state.playing = true; renderTable(); renderFeatured(); });
    audio.addEventListener("pause", () => { state.playing = false; renderTable(); renderFeatured(); });
    audio.addEventListener("ended", () => { state.playing = false; renderTable(); renderFeatured(); });
    return el;
  }

  function playSong(name, artist) {
    const key = artist + "::" + name;
    const player = ensurePlayer();
    const audio = player.querySelector("#hp-audio");
    if (state.currentKey === key) {
      if (audio.paused) audio.play(); else audio.pause();
      return;
    }
    // marca loading
    state.currentKey = key; state.loadingKey = key; state.playing = false;
    renderTable(); renderFeatured();
    findPreview(name, artist).then(res => {
      state.loadingKey = null;
      if (!res.url) {
        state.notFoundKey = key;
        state.currentKey = null;
        renderTable(); renderFeatured();
        setTimeout(() => { if (state.notFoundKey === key) { state.notFoundKey = null; renderTable(); renderFeatured(); } }, 2500);
        return;
      }
      player.querySelector("#hp-artist").textContent = artist;
      player.querySelector("#hp-name").textContent = name;
      const art = player.querySelector("#hp-art");
      if (res.artwork) { art.src = res.artwork; art.style.display = "block"; } else { art.style.display = "none"; }
      audio.src = res.url;
      player.style.display = "flex";
      audio.play().catch(() => {});
    });
  }

  function btnIcon(key) {
    if (state.loadingKey === key) return '<span class="hp-spin"></span>';
    if (state.currentKey === key && state.playing) return "❚❚";
    return "▶";
  }
  // ============ end iTunes ============

  function applyFilters() {
    const ql = state.q.toLowerCase().trim();
    state.filtered = state.songs.filter(s => {
      const y = yearOf(s.release_date);
      const okDec = state.decade === "Todas" || decadeOf(y) === state.decade;
      const okQ = !ql || s.name.toLowerCase().includes(ql) || s.artist.toLowerCase().includes(ql);
      return okDec && okQ;
    });
    state.page = 1;
    render();
  }

  function bar(label, val) {
    const pct = Math.max(0, Math.min(100, val * 100));
    return `<div class="bar-row"><span class="lbl">${label}</span><div class="bar"><i style="width:${pct}%"></i></div><span class="pct">${pct.toFixed(0)}%</span></div>`;
  }

  function renderFeatured() {
    const top = [...state.filtered].sort((a,b) => b.popularity - a.popularity).slice(0,3);
    const norm = v => v > 1 ? v / 1000 : v;
    const html = top.map(s => {
      const key = s.artist + "::" + s.name;
      const notFound = state.notFoundKey === key;
      return `
      <article class="feat-card">
        <p class="eyebrow" style="margin:0">${escapeHtml(s.artist)}</p>
        <button class="play-title" data-name="${escapeHtml(s.name)}" data-artist="${escapeHtml(s.artist)}" style="background:transparent;border:0;color:inherit;cursor:pointer;text-align:left;padding:0;margin:.25rem 0;display:flex;align-items:flex-start;gap:.5rem;width:100%">
          <span style="font-family:'Metal Mania', 'Bebas Neue', sans-serif;font-size:1.5rem;line-height:1.1">${escapeHtml(s.name)}</span>
          <span style="color:var(--blood);margin-top:.35rem;font-size:.9rem">${btnIcon(key)}</span>
        </button>
        ${notFound ? '<p style="color:var(--muted);font-size:.7rem;margin:0">Preview no disponible</p>' : ''}
        <div style="display:flex;justify-content:space-between;color:var(--muted);font-size:.75rem">
          <span>${yearOf(s.release_date) || "—"}</span><span>★ ${s.popularity}</span>
        </div>
        <div style="margin-top:.75rem">
          ${bar("Energy", norm(s.energy))}
          ${bar("Dance", norm(s.danceability))}
          ${bar("Valence", norm(s.valence))}
        </div>
      </article>`;
    }).join("");
    const wrap = document.getElementById("hist-featured");
    wrap.innerHTML = html;
    wrap.querySelectorAll(".play-title").forEach(b => b.addEventListener("click", () => playSong(b.dataset.name, b.dataset.artist)));
  }

  function renderTable() {
    const start = (state.page - 1) * PAGE_SIZE;
    const slice = state.filtered.slice(start, start + PAGE_SIZE);
    const tbody = document.getElementById("hist-tbody");
    tbody.innerHTML = slice.map((s,i) => {
      const key = s.artist + "::" + s.name;
      const notFound = state.notFoundKey === key;
      return `
      <tr>
        <td style="color:var(--muted)" class="num">${start + i + 1}</td>
        <td style="font-weight:500">
          <button class="play-title" data-name="${escapeHtml(s.name)}" data-artist="${escapeHtml(s.artist)}" style="background:transparent;border:0;color:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;padding:0;font:inherit">
            <span style="color:var(--blood);font-size:.8rem">${btnIcon(key)}</span>
            <span>${escapeHtml(s.name)}</span>
            ${notFound ? '<span style="color:var(--muted);font-size:.7rem">(sin preview)</span>' : ''}
          </button>
        </td>
        <td class="artist">${escapeHtml(s.artist)}</td>
        <td class="num">${yearOf(s.release_date) || "—"}</td>
        <td class="num">${s.popularity}</td>
        <td class="num">${s.tempo ? s.tempo.toFixed(0) : "—"}</td>
      </tr>`;
    }).join("");
    tbody.querySelectorAll(".play-title").forEach(b => b.addEventListener("click", () => playSong(b.dataset.name, b.dataset.artist)));
  }

  function render() {
    const pageCount = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
    if (state.page > pageCount) state.page = pageCount;
    document.getElementById("hist-stats").innerHTML =
      `<span>${state.filtered.length.toLocaleString("es-AR")} CANCIONES</span><span>PÁGINA ${state.page} / ${pageCount}</span>`;
    document.getElementById("hist-pageinfo").textContent = `${state.page} / ${pageCount}`;
    document.getElementById("hist-prev").disabled = state.page <= 1;
    document.getElementById("hist-next").disabled = state.page >= pageCount;
    renderFeatured();
    renderTable();
  }

  function buildDecadeChips() {
    const wrap = document.getElementById("hist-decades");
    wrap.innerHTML = DECADES.map(d => `<button class="chip${d===state.decade?' active':''}" data-dec="${d}">${d}</button>`).join("");
    wrap.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      state.decade = b.dataset.dec;
      wrap.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
      applyFilters();
    }));
  }

  function onLoaded() {
    document.getElementById("hist-status").style.display = "none";
    document.getElementById("hist-content").style.display = "block";
    buildDecadeChips();
    applyFilters();
    document.getElementById("hist-search").addEventListener("input", e => { state.q = e.target.value; applyFilters(); });
    document.getElementById("hist-prev").addEventListener("click", () => { state.page--; render(); window.scrollTo({top:0,behavior:"smooth"}); });
    document.getElementById("hist-next").addEventListener("click", () => { state.page++; render(); window.scrollTo({top:0,behavior:"smooth"}); });
  }

  function showError(msg, hint) {
    document.getElementById("hist-status").innerHTML =
      `<div style="border:1px solid var(--blood);padding:1.5rem;text-align:center">
        <p class="eyebrow">ERROR DE CARGA</p>
        <p style="color:var(--muted);font-size:.85rem;margin-top:.5rem">${escapeHtml(msg)}</p>
        ${hint ? `<p style="color:var(--muted);font-size:.8rem;margin-top:.75rem;line-height:1.5">${hint}</p>` : ""}
      </div>`;
  }

  function loadFromRows(rows) {
    if (!rows || rows.length < 2) { showError("CSV vacío"); return; }
    const header = rows[0].map(h => (h||"").trim());
    const idx = k => header.indexOf(k);
    if (idx("name") === -1) { showError("Encabezados no encontrados (name/artist)."); return; }
    state.songs = rows.slice(1).filter(r => r.length >= header.length - 2 && r[idx("name")]).map(r => ({
      name: r[idx("name")], artist: r[idx("artist")], release_date: r[idx("release_date")],
      popularity: num(r[idx("popularity")]), danceability: num(r[idx("danceability")]),
      energy: num(r[idx("energy")]), valence: num(r[idx("valence")]), tempo: num(r[idx("tempo")]),
    }));
    onLoaded();
  }

  function tryEmbeddedCSV() {
    if (window.ROCK_SONGS_CSV) { loadFromRows(parseCSV(window.ROCK_SONGS_CSV)); return Promise.resolve(); }
    return Promise.reject(new Error("CSV embebido no encontrado"));
  }
  function tryFetchCSV() {
    return fetch(CSV_URL).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }).then(text => loadFromRows(parseCSV(text)));
  }
  function tryGvizJSONP() {
    return new Promise((resolve, reject) => {
      const cbName = "__gviz_cb_" + Date.now();
      const timeout = setTimeout(() => { cleanup(); reject(new Error("Timeout cargando gviz")); }, 15000);
      function cleanup(){ clearTimeout(timeout); delete window[cbName]; if (s.parentNode) s.parentNode.removeChild(s); }
      window[cbName] = function (data) {
        try {
          const cols = data.table.cols.map(c => (c.label || c.id || "").trim());
          const rows = [cols].concat(data.table.rows.map(r => r.c.map(cell => !cell ? "" : (cell.f != null ? String(cell.f) : (cell.v != null ? String(cell.v) : "")))));
          loadFromRows(rows); cleanup(); resolve();
        } catch (e) { cleanup(); reject(e); }
      };
      const url = `https://docs.google.com/spreadsheets/d/e/${SHEET_PUB_ID}/gviz/tq?tqx=out:json;responseHandler:${cbName}`;
      const s = document.createElement("script");
      s.src = url;
      s.onerror = () => { cleanup(); reject(new Error("No se pudo cargar gviz (sin internet o sheet no publicado).")); };
      document.head.appendChild(s);
    });
  }

  tryEmbeddedCSV().catch(() => tryFetchCSV()).catch(() => tryGvizJSONP()).catch(err => {
    const isFile = location.protocol === "file:";
    showError(err.message || "Failed to fetch",
      isFile
        ? "No se encontró el CSV embebido. Volvé a descargar el ZIP actualizado y abrí <b>historia.html</b> desde esa carpeta."
        : "Verificá tu conexión a internet o que el Google Sheet siga publicado."
    );
  });
})();
