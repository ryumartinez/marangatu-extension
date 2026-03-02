// inject.js
(function injectSidebarAssets() {
    // 1. Inject sidebar.css from styles/ folder
    if (!document.getElementById('custom-sidebar-styles')) {
        const link = document.createElement('link');
        link.id = 'custom-sidebar-styles';
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('styles/sidebar.css');
        document.head.appendChild(link);
    }

    // 2. Inject the main sidebar logic module
    const script = document.createElement('script');
    script.type = 'module';
    script.src = chrome.runtime.getURL('injected-logic.js');
    script.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
})();

// --- NEW: Chrome Storage Bridge ---
// Listens for messages from your injected Preact app
window.addEventListener('message', (event) => {
    // Only accept messages from our own window
    if (event.source !== window) return;

    // Save to Chrome Storage
    if (event.data.type === 'SAVE_FAVORITES') {
        chrome.storage.local.set({ marangatuSidebarFavorites: event.data.favorites });
    }

    // Load from Chrome Storage and send back
    if (event.data.type === 'LOAD_FAVORITES') {
        chrome.storage.local.get(['marangatuSidebarFavorites'], (result) => {
            window.postMessage({
                type: 'FAVORITES_LOADED',
                favorites: result.marangatuSidebarFavorites || []
            }, '*');
        });
    }
}, false);
