// Runs in the page before its scripts. Marks the document as the desktop app so
// CSS can enable window-chrome behaviour (drag regions, title-bar padding) that
// must not apply in a normal browser.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("hnDesktop", {
  isDesktop: true,
  platform: process.platform,
  // Display size (page zoom factor, e.g. 1.1 = 110%). Saved by the main process.
  getDisplayScale: () => ipcRenderer.invoke("display-scale:get"),
  setDisplayScale: (scale) => ipcRenderer.invoke("display-scale:set", scale),
  onDisplayScaleChange: (callback) => {
    const listener = (_event, scale) => callback(scale);
    ipcRenderer.on("display-scale:changed", listener);
    return () => ipcRenderer.removeListener("display-scale:changed", listener);
  },
});

function markDesktop() {
  document.documentElement.dataset.desktop = process.platform;
}

if (document.documentElement) markDesktop();
else window.addEventListener("DOMContentLoaded", markDesktop, { once: true });
