// Auto-update for the Windows app, using only Node built-ins (the packaged app
// ships without node_modules). The update server hosts what `npm run dist`
// produces: latest.yml + HN-Enterprises-Setup-<version>.exe.
//
//   1. read <feed>/latest.yml (version, file name, sha512)
//   2. if newer than this app: download the installer to the temp folder and
//      verify its sha512 (a corrupt or tampered file is discarded)
//   3. ask "Restart now / Later"; the installer runs silently either now
//      (and reopens the app) or when the app is closed.
const { app, dialog } = require("electron");
const { spawn } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const FEED_URL = (process.env.HN_UPDATE_URL || "https://api.hnenterprises.org/desktop-updates/").replace(/\/?$/, "/");
const FIRST_CHECK_MS = 15_000;
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

let downloadedInstaller = null;
let checking = false;
let prompted = false;

function get(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    const request = client.get(url, { headers: { "Cache-Control": "no-cache" }, timeout: 30_000 }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location && redirects > 0) {
        response.resume();
        resolve(get(new URL(response.headers.location, url).toString(), redirects - 1));
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      resolve(response);
    });
    request.on("timeout", () => request.destroy(new Error("Update server timed out")));
    request.on("error", reject);
  });
}

async function getText(url) {
  const response = await get(url);
  const chunks = [];
  for await (const chunk of response) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

/** The few fields we need from electron-builder's latest.yml. */
function parseLatestYml(text) {
  const field = (name) => (text.match(new RegExp(`^${name}:\\s*['"]?([^'"\\r\\n]+)`, "m")) || [])[1]?.trim();
  return { version: field("version"), file: field("path"), sha512: field("sha512") };
}

function isNewer(candidate, current) {
  const a = String(candidate).split(/[.-]/).map((part) => Number.parseInt(part, 10) || 0);
  const b = String(current).split(/[.-]/).map((part) => Number.parseInt(part, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return false;
}

async function download(url, destination, expectedSha512) {
  const partial = `${destination}.part`;
  const response = await get(url);
  const hash = crypto.createHash("sha512");
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(partial);
    response.on("data", (chunk) => hash.update(chunk));
    response.on("error", reject);
    out.on("error", reject);
    out.on("finish", resolve);
    response.pipe(out);
  });
  if (hash.digest("base64") !== expectedSha512) {
    fs.rmSync(partial, { force: true });
    throw new Error("Downloaded update failed its checksum and was discarded");
  }
  fs.renameSync(partial, destination);
}

function runInstaller(reopen) {
  if (!downloadedInstaller) return;
  const args = ["--updated", "/S"];
  if (reopen) args.push("--force-run");
  spawn(downloadedInstaller, args, { detached: true, stdio: "ignore" }).unref();
  downloadedInstaller = null;
}

async function checkForUpdates(getWindow) {
  if (checking || downloadedInstaller) return;
  checking = true;
  try {
    const latest = parseLatestYml(await getText(`${FEED_URL}latest.yml`));
    if (!latest.version || !latest.file || !latest.sha512) return;
    if (!isNewer(latest.version, app.getVersion())) return;

    const destination = path.join(app.getPath("temp"), `hn-enterprises-update-${latest.version}.exe`);
    await download(`${FEED_URL}${encodeURIComponent(latest.file)}`, destination, latest.sha512);
    downloadedInstaller = destination;
    console.log(`[updater] ${latest.version} downloaded`);

    if (prompted) return;
    prompted = true;
    const win = getWindow();
    const { response } = await dialog.showMessageBox(win && !win.isDestroyed() ? win : undefined, {
      type: "info",
      buttons: ["Restart now", "Later"],
      defaultId: 0,
      cancelId: 1,
      title: "Update ready",
      message: `HN Enterprises ${latest.version} is ready to install`,
      detail: "Restart now to update, or choose Later and it will be installed when you close the app.",
    });
    if (response === 0) {
      runInstaller(true);
      app.quit();
    }
  } catch (error) {
    // Offline or no update server yet: try again at the next interval.
    console.warn("[updater]", error && error.message ? error.message : error);
  } finally {
    checking = false;
  }
}

/** Start checking for updates (packaged Windows builds only). */
function startAutoUpdates(getWindow) {
  if (!app.isPackaged || process.platform !== "win32") return;
  setTimeout(() => void checkForUpdates(getWindow), FIRST_CHECK_MS);
  setInterval(() => void checkForUpdates(getWindow), CHECK_EVERY_MS);
  // "Later": install silently when the app closes; it opens updated next time.
  app.on("will-quit", () => runInstaller(false));
}

module.exports = { startAutoUpdates, parseLatestYml, isNewer };
