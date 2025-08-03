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
            const items = scope.vm.datos.completo.filter(item => item.url);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            injectSidebar(items);
        } else {
            console.log("⏳ Menu not found, retrying...");
            setTimeout(tryInject, 500);
        }
    }

    function injectSidebar(items) {
        if (document.querySelector('#custom-sidebar')) return;

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

        sidebar.innerHTML = `
            <h3 style="color:white; margin-top:0; font-size:18px;">Menú Accesible</h3>
            <ul style="list-style:none; padding-left:0; margin:0;">
                ${items.map(item => `
                    <li style="margin-bottom:8px;">
                        <a href="#" data-url="${baseUrl + item.url}" style="color:#9cf; text-decoration:none;">
                            ${item.nombre}
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;

        sidebar.addEventListener('click', function (e) {
            const link = e.target.closest('a[data-url]');
            if (link) {
                e.preventDefault();
                window.location.href = link.dataset.url;
            }
        });

        document.body.appendChild(sidebar);
    }

    tryInject();
})();