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

    function tryInject() {
        const STORAGE_KEY = 'marangatuSidebarItems';
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

    function injectSidebar(items) {
        const baseUrl = 'https://marangatu.set.gov.py/eset/';
        const initialUrl = location.href;

        if (document.querySelector('#custom-sidebar')) return;

        // Create sidebar
        const sidebar = document.createElement('div');
        sidebar.id = 'custom-sidebar';
        sidebar.style = `
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
    `;

        // Create iframe container
        const iframe = document.createElement('iframe');
        iframe.id = 'custom-iframe';
        iframe.style = `
        position:fixed;
        top:0;
        left:260px;
        width:calc(100vw - 260px);
        height:100vh;
        border:none;
        z-index:9998;
        background:white;
    `;
        iframe.src = initialUrl;
        document.body.appendChild(iframe);

        // Build menu HTML
        const homeLink = `
        <li style="margin-bottom:8px;">
            <a href="${baseUrl}" data-url="${baseUrl}" style="color:#9cf; text-decoration:none;">
                🏠 Inicio
            </a>
        </li>
    `;

        const menuLinks = items
            .filter(item => item.url)
            .map(item => `
            <li style="margin-bottom:8px;">
                <a href="${baseUrl + item.url}" data-url="${baseUrl + item.url}" style="color:#9cf; text-decoration:none;">
                    ${item.nombre}
                </a>
            </li>
        `).join('');

        sidebar.innerHTML = `
        <h3 style="color:white; margin-top:0; font-size:18px;">Menú Accesible</h3>
        <ul style="list-style:none; padding-left:0; margin:0;">
            ${homeLink}
            ${menuLinks}
        </ul>
    `;

        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'iframe-loading';
        loadingOverlay.style = `
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
    `;
        loadingOverlay.textContent = 'Cargando...';
        loadingOverlay.style.display = 'none';
        document.body.appendChild(loadingOverlay);

        // Handle clicks to update iframe source
        sidebar.addEventListener('click', function (e) {
            const link = e.target.closest('a[data-url]');
            if (link) {
                e.preventDefault();
                const targetUrl = link.dataset.url;
                loadingOverlay.style.display = 'flex';
                iframe.src = targetUrl;
            }
        });

        // Append sidebar to document
        document.body.appendChild(sidebar);

        // Hide loader after iframe loads
        iframe.addEventListener('load', () => {
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 100);
        });
    }

    tryInject();
})();