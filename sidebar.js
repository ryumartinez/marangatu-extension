import { html, useState } from 'https://esm.sh/htm/preact/standalone';
import { SidebarItem } from './sidebar-item.js';

const FAVORITES_KEY = 'marangatuSidebarFavorites';
const baseUrl = 'https://marangatu.set.gov.py/eset/';

// --- Helpers ---
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
        return [];
    }
}

function saveFavorites(favs) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function Sidebar({ items }) {
    const [favorites, setFavorites] = useState(getFavorites());
    const [iframeUrl, setIframeUrl] = useState(location.href);
    const [loading, setLoading] = useState(false);
    
    // 1. Add state for the search term
    const [searchTerm, setSearchTerm] = useState('');

    function toggleFavorite(url) {
        const newFavs = favorites.includes(url)
            ? favorites.filter(f => f !== url)
            : [...favorites, url];
        setFavorites(newFavs);
        saveFavorites(newFavs);
    }

    function navigateTo(url) {
        setLoading(true);
        setIframeUrl(url);
    }

    // 2. Filter the items based on the search term first
    const filteredItems = items.filter(it => 
        it.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 3. Then split the filtered items into favorites and others
    const favoriteItems = filteredItems.filter(it => favorites.includes(baseUrl + it.url));
    const otherItems = filteredItems.filter(it => !favorites.includes(baseUrl + it.url));

    return html`
      <div id="custom-sidebar" style="
      position:fixed;top:0;left:0;width:260px;height:100vh;
      background:#1e1e1e;color:#fff;overflow:auto;z-index:9999;
      padding:15px;font-family:sans-serif;box-shadow:2px 0 6px rgba(0,0,0,0.4);
      box-sizing: border-box;
    ">
        <input 
          type="text" 
          placeholder="Buscar menú..." 
          value=${searchTerm}
          onInput=${e => setSearchTerm(e.target.value)}
          style="
            width: 100%; 
            padding: 10px; 
            margin-bottom: 20px; 
            border-radius: 4px; 
            border: 1px solid #444; 
            background: #2a2a2a; 
            color: #fff; 
            box-sizing: border-box;
            font-size: 14px;
          "
        />

        ${favoriteItems.length > 0 && html`
          <h3>Favoritos</h3>
          <ul style="list-style:none;padding:0;margin:0 0 20px 0;">
            ${favoriteItems.map(item =>
              html`<${SidebarItem}
                item=${item}
                baseUrl=${baseUrl}
                isFavorite=${true}
                currentUrl=${iframeUrl} 
                onToggle=${toggleFavorite}
                onNavigate=${navigateTo}
              />`
            )}
          </ul>
        `}

        <h3>Menú Accesible</h3>
        <ul style="list-style:none;padding:0;margin:0;">
          ${otherItems.length > 0 
            ? otherItems.map(item =>
                html`<${SidebarItem}
                  item=${item}
                  baseUrl=${baseUrl}
                  isFavorite=${false}
                  currentUrl=${iframeUrl} 
                  onToggle=${toggleFavorite}
                  onNavigate=${navigateTo}
                />`
              )
            : html`<li style="color:#888;font-size:13px;">No se encontraron resultados</li>`
          }
        </ul>
      </div>

      <iframe
        id="custom-iframe"
        src=${iframeUrl}
        style="position:fixed;top:0;left:260px;width:calc(100vw - 260px);height:100vh;border:none;z-index:9998;background:white;"
        onLoad=${() => setLoading(false)}
      ></iframe>

      ${loading && html`
        <div
          id="iframe-loading"
          style="position: fixed;top: 0;left: 260px;width: calc(100vw - 260px);
              height: 100vh;background: white;z-index: 9999;
              display: flex;align-items: center;justify-content: center;
              font-family: sans-serif;font-size: 18px;color: #333;">
          Cargando...
        </div>
      `}
    `;
}
