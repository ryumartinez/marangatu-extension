// inject.js — runs in extension content_script context
(function injectRealScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected-logic.js');
    script.onload = function () {
        this.remove(); // cleanup
    };
    (document.head || document.documentElement).appendChild(script);
})();
