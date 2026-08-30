const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

app.setName("HN Enterprises");

const PORT = process.env.ELECTRON_NEXT_PORT || 4488;
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
    env: { ...process.env, PORT: String(PORT), HOSTNAME: "localhost", ELECTRON_RUN_AS_NODE: "1" },
    stdio: "inherit",
  });

  serverProcess.on("exit", (code) => {
    serverProcess = null;
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
