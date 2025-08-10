// inject.js
(function injectSidebarAssets() {
    // 1. Inject sidebar.css from styles/ folder
    if (!document.getElementById('custom-sidebar-styles')) {
        const link = document.createElement('link');
        link.id = 'custom-sidebar-styles';
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('styles/sidebar.css'); // path inside extension
        document.head.appendChild(link);
    }

    // 2. Inject the main sidebar logic module
    const script = document.createElement('script');
    script.type = 'module'; // IMPORTANT: allows ES module imports
    script.src = chrome.runtime.getURL('injected-logic.js');
    script.onload = function () {
        this.remove(); // cleanup after execution
    };
    (document.head || document.documentElement).appendChild(script);
})();
