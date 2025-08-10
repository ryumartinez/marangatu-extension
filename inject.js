// inject.js
(function injectRealScript() {
    const script = document.createElement('script');
    script.type = 'module'; // IMPORTANT: allows ES module imports
    script.src = chrome.runtime.getURL('injected-logic.js');
    script.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
})();

