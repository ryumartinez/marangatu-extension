// injected-logic.js
import { html, render } from 'https://esm.sh/htm/preact/standalone';
import { Sidebar } from './sidebar.js'; // adjust path as needed

function tryInject() {
    const scope = window.angular?.element(document.querySelector('.menu-sistema'))?.scope();
    if (scope?.vm?.datos?.completo?.length) {
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

// Start the injection
tryInject();
