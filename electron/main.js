const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

// Electron's runtime identity (app.getName(), Task Manager description,
// userData folder name, etc.) reads package.json's "name" field by default,
// not electron-builder's build.productName - which only affects the
// installer/shortcut names. Setting it explicitly here keeps them consistent
// regardless of that package.json field.
app.setName("HN Enterprises");

const PORT = process.env.ELECTRON_NEXT_PORT || 4488;
// In dev, the standalone build sits in the project tree at .next/standalone.
// In a packaged app, node_modules-heavy, non-asar-friendly output like this
// (it spawns as its own process and may contain native bindings) is placed
// under extraResources instead - see package.json's "build.extraResources" -
// so it has to be read from process.resourcesPath there instead of __dirname.
const STANDALONE_DIR = app.isPackaged
  ? path.join(process.resourcesPath, "standalone")
  : path.join(__dirname, "..", ".next", "standalone");
const SERVER_ENTRY = path.join(STANDALONE_DIR, "server.js");
const ICON_PATH = app.isPackaged
  ? path.join(process.resourcesPath, "icon.png")
  : path.join(__dirname, "..", "public", "logo.png");

let serverProcess = null;
let mainWindow = null;

function waitForServer(url, timeoutMs = 20000) {
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
          setTimeout(attempt, 200);
        });
    };
    attempt();
  });
}

function startServer() {
  serverProcess = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: STANDALONE_DIR,
    // process.execPath is Electron's own binary here, not plain Node -
    // without ELECTRON_RUN_AS_NODE it would try to launch a second full
    // Electron/Chromium instance instead of just running server.js as a
    // lean Node script.
    //
    // HOSTNAME is "localhost", not "127.0.0.1": the backend's auth cookies
    // are SameSite=Lax, and SameSite's "site" boundary is by hostname, not
    // IP - "127.0.0.1" and "localhost" are different sites even though both
    // are loopback, so a cookie set by a "localhost" backend would silently
    // never be attached to fetches from a "127.0.0.1" page. Matching the
    // hostname here keeps them same-site (port differences don't matter for
    // SameSite) so the post-login session cookie actually gets sent back.
    env: { ...process.env, PORT: String(PORT), HOSTNAME: "localhost", ELECTRON_RUN_AS_NODE: "1" },
    stdio: "inherit",
  });

  serverProcess.on("exit", (code) => {
    serverProcess = null;
    // The server dying while the app is still open means the window can
    // never recover (there's nothing left serving http://127.0.0.1:PORT) -
    // quitting instead of leaving a permanently blank window makes the
    // failure obvious rather than silently stuck.
    if (code !== 0 && mainWindow) {
      app.quit();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    icon: ICON_PATH,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Forwarded to this process's own stdout since the renderer's DevTools
  // aren't easy to inspect remotely - this is the diagnostic path when the
  // window shows but stays blank.
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

app.whenReady().then(async () => {
  startServer();
  try {
    await waitForServer(`http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});
