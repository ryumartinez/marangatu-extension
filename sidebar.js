// sidebar.js
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

    const favoriteItems = items.filter(it => favorites.includes(baseUrl + it.url));
    const otherItems = items.filter(it => !favorites.includes(baseUrl + it.url));

    return html`
      <div id="custom-sidebar" style="
      position:fixed;top:0;left:0;width:260px;height:100vh;
      background:#1e1e1e;color:#fff;overflow:auto;z-index:9999;
      padding:15px;font-family:sans-serif;box-shadow:2px 0 6px rgba(0,0,0,0.4);
    ">
        <h3>Favoritos</h3>
        <ul style="list-style:none;padding:0;margin:0 0 20px 0;">
          ${favoriteItems.map(item =>
            html`<${SidebarItem}
              item=${item}
              baseUrl=${baseUrl}
              isFavorite=${true}
              onToggle=${toggleFavorite}
              onNavigate=${navigateTo}
            />`
          )}
        </ul>

        <h3>Menú Accesible</h3>
        <ul style="list-style:none;padding:0;margin:0;">
          ${otherItems.map(item =>
            html`<${SidebarItem}
              item=${item}
              baseUrl=${baseUrl}
              isFavorite=${false}
              onToggle=${toggleFavorite}
              onNavigate=${navigateTo}
            />`
          )}
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
