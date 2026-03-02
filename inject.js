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

// --- Chrome Storage Bridge ---
window.addEventListener('message', (event) => {
    // Only accept messages from our own window
    if (event.source !== window) return;

    // Save to Chrome Storage
    if (event.data.type === 'SAVE_FAVORITES') {
        console.log('[Content Script] Saving favorites to Chrome Storage:', event.data.favorites);
        chrome.storage.local.set({ marangatuSidebarFavorites: event.data.favorites });
    }

    // Load from Chrome Storage and send back
    if (event.data.type === 'LOAD_FAVORITES') {
        console.log('[Content Script] Sidebar requested favorites. Fetching...');
        chrome.storage.local.get(['marangatuSidebarFavorites'], (result) => {
            const favs = result.marangatuSidebarFavorites || [];
            console.log('[Content Script] Sending favorites back to Sidebar:', favs);
            window.postMessage({
                type: 'FAVORITES_LOADED',
                favorites: favs
            }, '*');
        });
    }
}, false);
