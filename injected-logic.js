import { html, render, useState, useEffect } from 'https://esm.sh/htm/preact/standalone';


const STORAGE_KEY = 'marangatuSidebarItems';
const FAVORITES_KEY = 'marangatuSidebarFavorites';
const baseUrl = 'https://marangatu.set.gov.py/eset/';

// Helpers for favorites
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

// Sidebar Component
function Sidebar({ items }) {
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

    const favoriteItems = items.filter(it => favorites.includes(baseUrl + it.url));

    return html`
        <div id="custom-sidebar" style="
            position:fixed;top:0;left:0;width:260px;height:100vh;
            background:#1e1e1e;color:#fff;overflow:auto;z-index:9999;
            padding:15px;font-family:sans-serif;box-shadow:2px 0 6px rgba(0,0,0,0.4);
        ">
            <h3>Favoritos</h3>
            <ul style="list-style:none;padding:0;margin:0 0 20px 0;">
                ${favoriteItems.map(item => html`
                    <li style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <a href=${baseUrl + item.url} 
                           style="color:#9cf;text-decoration:none;flex:1"
                           onClick=${e => { e.preventDefault(); setLoading(true); setIframeUrl(baseUrl + item.url); }}>
                            ${item.nombre}
                        </a>
                        <button 
                            onClick=${() => toggleFavorite(baseUrl + item.url)}
                            style="background:none;border:none;color:#ff0;cursor:pointer;font-size:16px;">
                            ★
                        </button>
                    </li>
                `)}
            </ul>

            <h3>Menú Accesible</h3>
            <ul style="list-style:none;padding:0;margin:0;">
                ${[...items]
        .filter(it => !favorites.includes(baseUrl + it.url))
        .map(item => html`
                        <li style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <a href=${baseUrl + item.url} 
                               style="color:#9cf;text-decoration:none;flex:1"
                               onClick=${e => { e.preventDefault(); setLoading(true); setIframeUrl(baseUrl + item.url); }}>
                                ${item.nombre}
                            </a>
                            <button 
                                onClick=${() => toggleFavorite(baseUrl + item.url)}
                                style="background:none;border:none;color:#ff0;cursor:pointer;font-size:16px;">
                                ☆
                            </button>
                        </li>
                    `)}
            </ul>
        </div>

        <iframe id="custom-iframe"
            src=${iframeUrl}
            style="position:fixed;top:0;left:260px;width:calc(100vw - 260px);height:100vh;border:none;z-index:9998;background:white;"
            onLoad=${() => setLoading(false)}
        ></iframe>

        ${loading && html`
            <div id="iframe-loading"
                style="position: fixed;top: 0;left: 260px;width: calc(100vw - 260px);
                       height: 100vh;background: white;z-index: 9999;
                       display: flex;align-items: center;justify-content: center;
                       font-family: sans-serif;font-size: 18px;color: #333;">
                Cargando...
            </div>
        `}
    `;
}

// Bootstrapping menu fetch and render
function tryInject() {
    const scope = window.angular?.element(document.querySelector('.menu-sistema'))?.scope();
    if (scope?.vm?.datos?.completo?.length) {
        // Get the live AngularJS menu (no localStorage involved)
        const items = scope.vm.datos.completo.filter(item => item.url);
        renderSidebar(items);
    } else {
        setTimeout(tryInject, 500);
    }
}

function renderSidebar(items) {
    const root = document.createElement('div');
    root.id = 'custom-sidebar-root';
    document.body.appendChild(root);
    render(html`<${Sidebar} items=${items} />`, root);
}

// start
tryInject();


