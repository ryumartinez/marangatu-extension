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
    const baseUrl = 'https://marangatu.set.gov.py/eset/';

    // ----- 1. Inject styles -----
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
                margin:0;
            }
            #custom-sidebar li {
                margin-bottom:8px;
            }
            #custom-sidebar a {
                color:#9cf;
                text-decoration:none;
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

    // ----- 2. Helper to create a menu link -----
    function menuItemHTML(text, url) {
        return `
            <li>
                <a href="${url}" data-url="${url}">
                    ${text}
                </a>
            </li>
        `;
    }

    // ----- 3. Wrapper for fetching menu -----
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

    // ----- 4. Main sidebar injection -----
    function injectSidebar(items) {
        injectCustomStyles();

        if (document.querySelector('#custom-sidebar')) return;
        const initialUrl = location.href;

        // Sidebar
        const sidebar = document.createElement('div');
        sidebar.id = 'custom-sidebar';

        // Iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'custom-iframe';
        iframe.src = initialUrl;
        document.body.appendChild(iframe);

        // Menu HTML
        let menuHtml = '<h3>Menú Accesible</h3><ul>';
        menuHtml += menuItemHTML('🏠 Inicio', baseUrl);
        for (const item of items) {
            if (item.url) {
                menuHtml += menuItemHTML(item.nombre, baseUrl + item.url);
            }
        }
        menuHtml += '</ul>';
        sidebar.innerHTML = menuHtml;

        // Loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'iframe-loading';
        loadingOverlay.textContent = 'Cargando...';
        loadingOverlay.style.display = 'none';
        document.body.appendChild(loadingOverlay);

        // Handle menu clicks
        sidebar.addEventListener('click', function (e) {
            const link = e.target.closest('a[data-url]');
            if (link) {
                e.preventDefault();
                loadingOverlay.style.display = 'flex';
                iframe.src = link.dataset.url;
            }
        });

        // Add sidebar
        document.body.appendChild(sidebar);

        // Hide loader after iframe loads
        iframe.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 100);
        });
    }

    // ----- 5. Start -----
    tryInject();
})();
