// electron-builder's `extraResources` file-matching silently drops nested
// node_modules folders regardless of an explicit `filter` override - a known
// gotcha when bundling a Next.js standalone server this way. Copying it here
// instead, after packaging, sidesteps that pattern-matching entirely.
const fs = require("fs");
const path = require("path");

exports.default = async function afterPack(context) {
  // Windows/Linux keep resources directly under <appOutDir>/resources; macOS
  // nests it inside the .app bundle - only Windows is built today, but this
  // keeps the packaged-app-relative path correct if that ever changes.
  const resourcesDir =
    context.electronPlatformName === "darwin"
      ? path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`, "Contents", "Resources")
      : path.join(context.appOutDir, "resources");

  const standaloneSrc = path.join(__dirname, "..", ".next", "standalone");
  const standaloneDest = path.join(resourcesDir, "standalone");

  fs.cpSync(standaloneSrc, standaloneDest, { recursive: true });
  console.log(`[after-pack] Copied .next/standalone -> ${standaloneDest}`);
};
