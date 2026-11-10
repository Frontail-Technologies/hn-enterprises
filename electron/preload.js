// Runs in the page before its scripts. Marks the document as the desktop app so
// CSS can enable window-chrome behaviour (drag regions, title-bar padding) that
// must not apply in a normal browser.
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("hnDesktop", { isDesktop: true, platform: process.platform });

function markDesktop() {
  document.documentElement.dataset.desktop = process.platform;
}

if (document.documentElement) markDesktop();
else window.addEventListener("DOMContentLoaded", markDesktop, { once: true });
