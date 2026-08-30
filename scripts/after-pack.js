const fs = require("fs");
const path = require("path");

exports.default = async function afterPack(context) {
  const resourcesDir =
    context.electronPlatformName === "darwin"
      ? path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`, "Contents", "Resources")
      : path.join(context.appOutDir, "resources");

  const standaloneSrc = path.join(__dirname, "..", ".next", "standalone");
  const standaloneDest = path.join(resourcesDir, "standalone");

  fs.cpSync(standaloneSrc, standaloneDest, { recursive: true });
  console.log(`[after-pack] Copied .next/standalone -> ${standaloneDest}`);
};
