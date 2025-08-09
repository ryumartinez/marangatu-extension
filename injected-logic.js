/**
 * @typedef {Object} MenuItem
 * @property {string} aplicacion
 * @property {string} descripcion
 * @property {'S'|'N'} modifica
 * @property {string} nombre
 * @property {string|null} padre
 * @property {string|null} rutaArbol
 * @property {string} servicio
 * @property {string|null} tipo
 * @property {string|null} url
 * @property {'S'|'N'} visible
 * @property {string|null} estado
 * @property {number} nivel
 */

(function () {
    const STORAGE_KEY = 'marangatuSidebarItems';
    const FAVORITES_KEY = 'marangatuSidebarFavorites';
    const baseUrl = 'https://marangatu.set.gov.py/eset/';

    // ========== 1. Styles ==========
    function injectCustomStyles() {
        if (document.getElementById('custom-sidebar-styles')) return;
        const style = document.createElement('style');
        style.id = 'custom-sidebar-styles';
        style.textContent = `
            #custom-sidebar {
                position:fixed;
                top:0;
                left:0;
                width:260px;
                height:100vh;
                background:#1e1e1e;
                color:#fff;
                overflow:auto;
                z-index:9999;
                padding:15px;
                font-family:sans-serif;
                box-shadow:2px 0 6px rgba(0,0,0,0.4);
            }
            #custom-sidebar h3 {
                color:white;
                margin-top:0;
                font-size:18px;
            }
            #custom-sidebar ul {
                list-style:none;
                padding-left:0;
                margin:0 0 20px 0;
            }
            #custom-sidebar li {
                margin-bottom:8px;
                display:flex;
                align-items:center;
                justify-content:space-between;
            }
            #custom-sidebar a {
                color:#9cf;
                text-decoration:none;
                flex:1;
            }
            #custom-sidebar button.favorite-btn {
                background:none;
                border:none;
                color:#ff0;
                cursor:pointer;
                font-size:16px;
                padding:0 4px;
            }
            #custom-iframe {
                position:fixed;
                top:0;
                left:260px;
                width:calc(100vw - 260px);
                height:100vh;
                border:none;
                z-index:9998;
                background:white;
            }
            #iframe-loading {
                position: fixed;
                top: 0;
                left: 260px;
                width: calc(100vw - 260px);
                height: 100vh;
                background: white;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: sans-serif;
                font-size: 18px;
                color: #333;
            }
        `;
        document.head.appendChild(style);
    }

    // ========== 2. Favorites helpers ==========
    function getFavorites() {
        const saved = localStorage.getItem(FAVORITES_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    function saveFavorites(favs) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    }

    // ========== 3. Menu item builder ==========
    function menuItemHTML(text, url, isFavorite) {
        const star = isFavorite ? '★' : '☆';
        return `
            <li>
                <a href="${url}" data-url="${url}">
                    ${text}
                </a>
                <button class="favorite-btn" data-url="${url}" aria-label="Toggle favorite">${star}</button>
            </li>
        `;
    }

    // ========== 4. Menu fetcher ==========
    function tryInject() {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            console.log("✅ Using cached menu from localStorage");
            injectSidebar(JSON.parse(saved));
            return;
        }

        const scope = window.angular?.element(document.querySelector('.menu-sistema'))?.scope();

        if (scope?.vm?.datos?.completo?.length) {
            console.log("✅ Menu found via Angular, injecting and caching...");
            /** @type {MenuItem[]} */
            const items = scope.vm.datos.completo.filter(item => item.url);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            injectSidebar(items);
        } else {
            console.log("⏳ Menu not found, retrying...");
            setTimeout(tryInject, 500);
        }
    }

    // ========== 5. Sidebar renderer ==========
    function injectSidebar(items) {
        injectCustomStyles();

        // Remove old sidebar if exists (important for re-render on favorite change)
        document.querySelector('#custom-sidebar')?.remove();

        const initialUrl = location.href;
        const favorites = getFavorites();

        // Sidebar
        const sidebar = document.createElement('div');
        sidebar.id = 'custom-sidebar';

        // Iframe (create once only)
        let iframe = document.querySelector('#custom-iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'custom-iframe';
            iframe.src = initialUrl;
            document.body.appendChild(iframe);
        }

        // Build HTML
        let html = '';

        // Favorites section
        html += '<h3>Favoritos</h3><ul>';
        const favoriteItems = items.filter(item => favorites.includes(baseUrl + item.url));
        for (const fav of favoriteItems) {
            html += menuItemHTML(fav.nombre, baseUrl + fav.url, true);
        }
        html += '</ul>';

        // Main menu
        html += '<h3>Menú Accesible</h3><ul>';
        html += menuItemHTML('🏠 Inicio', baseUrl, favorites.includes(baseUrl));
        for (const item of items) {
            const fullUrl = baseUrl + item.url;
            if (item.url && !favorites.includes(fullUrl)) {
                html += menuItemHTML(item.nombre, fullUrl, false);
            }
        }
        html += '</ul>';

        sidebar.innerHTML = html;

        // Loading overlay (create once)
        let loadingOverlay = document.querySelector('#iframe-loading');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'iframe-loading';
            loadingOverlay.textContent = 'Cargando...';
            loadingOverlay.style.display = 'none';
            document.body.appendChild(loadingOverlay);
        }

        // Event handling
        sidebar.addEventListener('click', function (e) {
            // Toggle favorite
            if (e.target.classList.contains('favorite-btn')) {
                e.preventDefault();
                const url = e.target.dataset.url;
                let favs = getFavorites();
                if (favs.includes(url)) {
                    favs = favs.filter(f => f !== url);
                } else {
                    favs.push(url);
                }
                saveFavorites(favs);
                injectSidebar(items); // re-render
                return;
            }

            // Click on link
            const link = e.target.closest('a[data-url]');
            if (link) {
                e.preventDefault();
                loadingOverlay.style.display = 'flex';
                iframe.src = link.dataset.url;
            }
        });

        // Append new sidebar
        document.body.appendChild(sidebar);

        // Hide loader on iframe load
        iframe.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 100);
        });
    }

    // Start
    tryInject();
})();

