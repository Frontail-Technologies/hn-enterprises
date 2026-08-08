// `next build` with `output: "standalone"` produces a self-contained server
// at .next/standalone/server.js, but deliberately leaves out `public/` and
// `.next/static/` (they're meant to be served by a CDN/reverse proxy in a
// typical deployment) - the Electron shell has neither, so this copies both
// into the standalone output after every build.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.error('.next/standalone not found - run "next build" first.');
  process.exit(1);
}

fs.cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), { recursive: true });
fs.cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), { recursive: true });

console.log("Copied public/ and .next/static/ into .next/standalone/");
