const { app, BrowserWindow, clipboard, ipcMain, Menu, screen, shell } = require("electron");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { startAutoUpdates } = require("./updater");

app.setName("HN Enterprises");
// Taskbar grouping/pinning identity (matches build.appId).
if (process.platform === "win32") app.setAppUserModelId("org.hnenterprises.desktop");

const PORT = process.env.ELECTRON_NEXT_PORT || 4488;
const APP_URL = `http://localhost:${PORT}`;
const STANDALONE_DIR = app.isPackaged
  ? path.join(process.resourcesPath, "standalone")
  : path.join(__dirname, "..", ".next", "standalone");
const SERVER_ENTRY = path.join(STANDALONE_DIR, "server.js");
const ICON_PATH = app.isPackaged
  ? path.join(process.resourcesPath, "icon.png")
  : path.join(__dirname, "..", "public", "logo.png");

// App canvas / top-bar colours (globals.css --background / --card / --foreground).
const BACKGROUND = "#f7f6f4";
const TITLE_BAR = { color: "#ffffff", symbolColor: "#1c2a3a", height: 56 };

let serverProcess = null;
let mainWindow = null;
let splashWindow = null;

// ---------------------------------------------------------------------------
// Startup timing: how long each launch step took, written to
// %APPDATA%/HN Enterprises/startup-timing.log (last 20 launches) so slow
// starts can be diagnosed on a user's PC.
// ---------------------------------------------------------------------------
const launchStartedAt = Date.now();
const timings = [];
function mark(step) {
  timings.push(`${step}=${Date.now() - launchStartedAt}ms`);
}
function writeTimings() {
  try {
    const file = path.join(app.getPath("userData"), "startup-timing.log");
    const previous = fs.existsSync(file) ? fs.readFileSync(file, "utf8").split("\n").filter(Boolean).slice(-19) : [];
    fs.writeFileSync(file, [...previous, `${new Date().toISOString()} v${app.getVersion()} ${timings.join(" ")}`].join("\n") + "\n");
  } catch {
    // Timing is best-effort only.
  }
}

// ---------------------------------------------------------------------------
// Single instance: a second launch focuses the running window.
// ---------------------------------------------------------------------------
const hasInstanceLock = app.requestSingleInstanceLock();
if (!hasInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const win = mainWindow ?? splashWindow;
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });
}

// ---------------------------------------------------------------------------
// Window size/position memory.
// ---------------------------------------------------------------------------
const STATE_FILE = path.join(app.getPath("userData"), "window-state.json");

// ---------------------------------------------------------------------------
// Display size (page zoom), chosen in the app's top bar or with Ctrl +/-/0.
// Kept in its own file and re-applied on every load so it survives restarts.
// ---------------------------------------------------------------------------
const SCALE_FILE = path.join(app.getPath("userData"), "display-scale.json");
const SCALE_STEPS = [0.9, 1, 1.1, 1.25, 1.4];

function readDisplayScale() {
  try {
    const { scale } = JSON.parse(fs.readFileSync(SCALE_FILE, "utf8"));
    return SCALE_STEPS.includes(scale) ? scale : 1;
  } catch {
    return 1;
  }
}

function setDisplayScale(contents, scale) {
  const next = SCALE_STEPS.includes(scale) ? scale : 1;
  contents.setZoomFactor(next);
  try {
    fs.writeFileSync(SCALE_FILE, JSON.stringify({ scale: next }));
  } catch {
    // Not critical: the app just opens at 100% next time.
  }
  contents.send("display-scale:changed", next);
  return next;
}

function stepDisplayScale(contents, direction) {
  const current = SCALE_STEPS.indexOf(readDisplayScale());
  const index = Math.min(Math.max(current + direction, 0), SCALE_STEPS.length - 1);
  return setDisplayScale(contents, SCALE_STEPS[index]);
}

ipcMain.handle("display-scale:get", () => readDisplayScale());
ipcMain.handle("display-scale:set", (event, scale) => setDisplayScale(event.sender, Number(scale)));

function readWindowState() {
  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    // Ignore saved bounds that are no longer on any connected display.
    const visible = screen.getAllDisplays().some(({ workArea: area }) =>
      state.x >= area.x - 50 && state.y >= area.y - 50 && state.x < area.x + area.width && state.y < area.y + area.height,
    );
    return visible ? state : { width: state.width, height: state.height, maximized: state.maximized };
  } catch {
    return { width: 1440, height: 900, maximized: false };
  }
}

function trackWindowState(win) {
  let timer = null;
  const save = () => {
    if (win.isDestroyed() || win.isMinimized()) return;
    const bounds = win.isMaximized() ? win.getNormalBounds() : win.getBounds();
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify({ ...bounds, maximized: win.isMaximized() }));
    } catch {
      // Not critical — the window just opens at the default size next time.
    }
  };
  const debounced = () => {
    clearTimeout(timer);
    timer = setTimeout(save, 400);
  };
  win.on("resize", debounced);
  win.on("move", debounced);
  win.on("close", save);
}

// ---------------------------------------------------------------------------
// Splash: shown instantly while the local Next.js server starts.
// ---------------------------------------------------------------------------
function iconDataUrl() {
  try {
    return `data:image/png;base64,${fs.readFileSync(ICON_PATH).toString("base64")}`;
  } catch {
    return "";
  }
}

function splashHtml(message, isError = false) {
  const icon = iconDataUrl();
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;height:100%;font-family:"Segoe UI",system-ui,sans-serif;background:#fff;color:#1c2a3a;-webkit-app-region:drag;user-select:none}
    body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;border:1px solid #e7e3dd;box-sizing:border-box}
    img{width:72px;height:72px;object-fit:contain;animation:in .5s ease-out both}
    h1{margin:0;font-size:17px;font-weight:600}
    p{margin:0;font-size:13px;color:${isError ? "#c0392b" : "#5f6b7a"};max-width:300px;text-align:center}
    .bar{width:140px;height:3px;border-radius:3px;background:#f1efeb;overflow:hidden}
    .bar i{display:block;width:40%;height:100%;border-radius:3px;background:#ef7b1f;animation:sweep 1.1s ease-in-out infinite}
    @keyframes sweep{from{transform:translateX(-100%)}to{transform:translateX(260%)}}
    @keyframes in{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
    @media (prefers-reduced-motion: reduce){*{animation:none!important}}
  </style></head><body>
    ${icon ? `<img src="${icon}" alt="">` : ""}
    <h1>HN Enterprises</h1>
    <p>${message}</p>
    ${isError ? "" : '<div class="bar"><i></i></div>'}
  </body></html>`;
}

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 380,
    height: 280,
    frame: false,
    resizable: false,
    movable: true,
    center: true,
    show: true,
    skipTaskbar: false,
    backgroundColor: "#ffffff",
    icon: ICON_PATH,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml("Starting…"))}`);
  splashWindow.on("closed", () => {
    splashWindow = null;
  });
}

function showSplashError(message) {
  if (!splashWindow) return;
  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml(message, true))}`);
}

// ---------------------------------------------------------------------------
// Local Next.js server.
// ---------------------------------------------------------------------------
function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http
        .get(url, (res) => {
          res.destroy();
          resolve();
        })
        .on("error", () => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`Next.js server did not respond within ${timeoutMs}ms`));
            return;
          }
          setTimeout(attempt, 50);
        });
    };
    attempt();
  });
}

function startServer() {
  serverProcess = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: STANDALONE_DIR,
    env: {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: "localhost",
      ELECTRON_RUN_AS_NODE: "1",
      // Cache the server's compiled JavaScript on disk so later launches
      // (especially cold ones after a restart) skip recompiling Next.js.
      NODE_COMPILE_CACHE: path.join(app.getPath("userData"), "compile-cache"),
    },
    stdio: "inherit",
  });

  serverProcess.on("exit", (code) => {
    serverProcess = null;
    if (code !== 0 && mainWindow) {
      app.quit();
    }
  });
}

// ---------------------------------------------------------------------------
// Main window behaviour.
// ---------------------------------------------------------------------------
const isAppUrl = (url) => url.startsWith(APP_URL);

function attachContextMenu(win) {
  win.webContents.on("context-menu", (_event, params) => {
    const template = [];
    if (params.misspelledWord) {
      for (const suggestion of params.dictionarySuggestions.slice(0, 5)) {
        template.push({ label: suggestion, click: () => win.webContents.replaceMisspelling(suggestion) });
      }
      if (template.length) template.push({ type: "separator" });
    }
    if (params.linkURL && !params.linkURL.startsWith("javascript:")) {
      template.push({ label: "Copy link", click: () => clipboard.writeText(params.linkURL) });
      if (!isAppUrl(params.linkURL)) template.push({ label: "Open in browser", click: () => shell.openExternal(params.linkURL) });
      template.push({ type: "separator" });
    }
    if (params.isEditable) {
      template.push(
        { role: "undo", enabled: params.editFlags.canUndo },
        { role: "redo", enabled: params.editFlags.canRedo },
        { type: "separator" },
        { role: "cut", enabled: params.editFlags.canCut },
        { role: "copy", enabled: params.editFlags.canCopy },
        { role: "paste", enabled: params.editFlags.canPaste },
        { type: "separator" },
        { role: "selectAll" },
      );
    } else if (params.selectionText.trim()) {
      template.push({ role: "copy" });
    }
    if (template.length && template[template.length - 1].type === "separator") template.pop();
    if (template.length) Menu.buildFromTemplate(template).popup({ window: win });
  });
}

function attachShortcuts(win) {
  const contents = win.webContents;
  contents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    const ctrl = input.control || input.meta;
    const key = input.key.toLowerCase();
    const handled = (() => {
      if ((ctrl && key === "r") || key === "f5") return contents.reload(), true;
      if (key === "f11") return win.setFullScreen(!win.isFullScreen()), true;
      if (ctrl && (key === "=" || key === "+")) return stepDisplayScale(contents, 1), true;
      if (ctrl && key === "-") return stepDisplayScale(contents, -1), true;
      if (ctrl && key === "0") return setDisplayScale(contents, 1), true;
      if (input.alt && key === "arrowleft" && contents.navigationHistory.canGoBack()) return contents.navigationHistory.goBack(), true;
      if (input.alt && key === "arrowright" && contents.navigationHistory.canGoForward()) return contents.navigationHistory.goForward(), true;
      if (!app.isPackaged && ctrl && input.shift && key === "i") return contents.toggleDevTools(), true;
      return false;
    })();
    if (handled) event.preventDefault();
  });
}

function attachExternalLinks(win) {
  // Links to other sites open in the user's browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAppUrl(url)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (isAppUrl(url)) return;
    event.preventDefault();
    // A file dropped outside an upload box "navigates" to file://...; never
    // open it in another program - just ignore the drop.
    if (url.startsWith("file:")) return;
    shell.openExternal(url);
  });
}

function attachDownloadProgress(win) {
  // Excel exports etc.: taskbar progress while saving, flash when done.
  win.webContents.session.on("will-download", (_event, item) => {
    item.on("updated", () => {
      const total = item.getTotalBytes();
      win.setProgressBar(total > 0 ? item.getReceivedBytes() / total : 2);
    });
    item.once("done", (_doneEvent, state) => {
      win.setProgressBar(-1);
      if (state === "completed" && !win.isFocused()) win.flashFrame(true);
    });
  });
}

function createWindow() {
  const state = readWindowState();
  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width ?? 1440,
    height: state.height ?? 900,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    icon: ICON_PATH,
    backgroundColor: BACKGROUND,
    // Native min/max/close drawn inside the app's own top bar (Windows/Linux);
    // the page marks its draggable areas via the `app-titlebar` class.
    titleBarStyle: "hidden",
    titleBarOverlay: process.platform === "darwin" ? undefined : TITLE_BAR,
    trafficLightPosition: { x: 16, y: 20 },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  trackWindowState(mainWindow);
  attachContextMenu(mainWindow);
  attachShortcuts(mainWindow);
  attachExternalLinks(mainWindow);
  attachDownloadProgress(mainWindow);

  // The window is created before the server is up and only navigates to the
  // app once it is, so show it on the app page's first paint - never on an
  // empty window.
  let shown = false;
  mainWindow.on("ready-to-show", () => {
    if (shown || !mainWindow || !isAppUrl(mainWindow.webContents.getURL())) return;
    shown = true;
    if (state.maximized) mainWindow.maximize();
    mainWindow.show();
    splashWindow?.close();
    mark("window-shown");
    writeTimings();
  });

  // Re-apply the saved display size on every page load (before first paint where possible).
  const applySavedScale = () => mainWindow?.webContents.setZoomFactor(readDisplayScale());
  mainWindow.webContents.on("did-navigate", applySavedScale);
  mainWindow.webContents.on("dom-ready", applySavedScale);


  mainWindow.webContents.on("console-message", (_event, _level, message, line, sourceId) => {
    console.log(`[renderer] ${message} (${sourceId}:${line})`);
  });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[did-fail-load] ${errorCode} ${errorDescription} @ ${validatedURL}`);
  });
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error("[render-process-gone]", details);
  });
  mainWindow.webContents.on("preload-error", (_event, preloadPath, error) => {
    console.error("[preload-error]", preloadPath, error);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// The local server needs nothing from Electron's window system, so start it
// right away - it boots while Electron itself is still getting ready.
if (hasInstanceLock) {
  startServer();
  mark("server-spawned");
}

app.whenReady().then(async () => {
  if (!hasInstanceLock) return;
  mark("electron-ready");
  // No File/Edit/View menu bar; the shortcuts above cover what users need.
  Menu.setApplicationMenu(null);
  createSplash();
  mark("splash");
  // Build the (hidden) main window while the server boots, then load the page
  // the moment the server answers. Readiness is probed with a static file so
  // no page has to be rendered just to find out the server is up.
  createWindow();
  try {
    await waitForServer(`${APP_URL}/logo.png`);
  } catch (error) {
    console.error(error);
    mainWindow?.destroy();
    showSplashError("HN Enterprises couldn't start. Close this window and open the app again. If it keeps happening, contact your administrator.");
    return;
  }
  mark("server-up");
  // Straight to the dashboard (it sends to /login when signed out): skips the
  // "/" redirect hop on every launch.
  mainWindow?.loadURL(`${APP_URL}/dashboard`);
  startAutoUpdates(() => mainWindow);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      mainWindow?.loadURL(APP_URL);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});
