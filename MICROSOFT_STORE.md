# Microsoft Store (MSIX) Build

HN Enterprises ships to the Microsoft Store as an MSIX package, built via
electron-builder's `msix` target, alongside (not replacing) the existing
NSIS `.exe` installer produced by `npm run dist`.

## 1. Partner Center values you must paste in

`package.json` → `"build"` → `"msix"` currently contains **placeholder**
values. They must be replaced with the real values from your app's listing
in [Partner Center](https://partner.microsoft.com/dashboard) before the
final Store submission build:

| Config key | Placeholder | Replace with |
|---|---|---|
| `identityName` | `PlaceholderPartnerCenterIdentityName` | Partner Center → App identity → **Package/Identity/Name** |
| `publisher` | `CN=PlaceholderPartnerCenterPublisherId` | Partner Center → App identity → **Package/Identity/Publisher** (a full `CN=...` distinguished name — copy it exactly, do not retype) |
| `publisherDisplayName` | `Placeholder Partner Center Publisher Display Name` | Partner Center → App identity → **Publisher display name** |

`displayName` is already set to `"HN Enterprises"` and does not need to
change. Do not invent or guess the two identity values above — they must
come from your Partner Center reservation for this exact app, or the
Store will reject the upload.

## 2. Build command

```bash
npm run build:win:store
```

This runs `next build` + the standalone-assets copy (same as the existing
`dist` script), then invokes electron-builder scoped to only the `msix`
target — it does **not** touch or remove the NSIS build. The two targets
are independent:

- `npm run dist` → NSIS `.exe` installer (unchanged, still works)
- `npm run build:win:store` → MSIX Store package

## 3. Generated artifact

```
dist-electron/HN Enterprises <version>.msixupload
```

This `.msixupload` file (a zipped `.msix`) is the one to upload to Partner
Center. A standalone `dist-electron/HN Enterprises <version>.msix` is also
produced alongside it (useful for local sideload-testing on a dev machine
with Developer Mode enabled), and neither package is code-signed — the
Store signs the package itself at publish time, so no Authenticode
certificate is required or configured here.

## 4. Version bump process

Store submissions require the version to increase on every upload.
Bump the `"version"` field in `package.json` (semver, e.g. `0.1.0` →
`0.1.1` or `0.2.0`) before each Store build — electron-builder converts it
automatically into the four-part Windows version format the MSIX manifest
requires. Do not edit the manifest version directly; there is no manifest
checked into source, it's generated fresh from `package.json` on every
build.

## 5. Partner Center upload steps

1. Run `npm run build:win:store` with the real identity values filled in
   (§1).
2. Sign in to [Partner Center](https://partner.microsoft.com/dashboard) →
   your app → **Packages**.
3. Upload `dist-electron/HN Enterprises <version>.msixupload`.
4. Fill in/confirm store listing metadata (description, screenshots,
   age rating, etc. — unchanged from any prior submission).
5. Submit for certification.

This project does not perform Store certification or installation testing
on your behalf — that happens in Partner Center and on a real Windows
machine after submission.

## 6. Updates

Once installed from the Store, HN Enterprises receives updates through
**Microsoft Store's own update mechanism** — there is no in-app
auto-updater involved for this build (the app currently has no
electron-updater/autoUpdater wiring at all, for either build target).
Simply publishing a new, higher-versioned `.msixupload` to Partner Center
is enough; Windows will update installed copies automatically. This is
separate from and does not affect the NSIS `.exe` build, which remains
manually distributed with no auto-update either.

## Capabilities

The MSIX manifest declares only the capabilities the app actually needs:
`runFullTrust` (mandatory for any Electron/Win32 app packaged as MSIX,
auto-added by electron-builder). No additional device, network, or broad
capabilities are declared — the app only spawns a local Next.js server on
loopback and shows a window, which requires nothing beyond full trust.

## Assets

The four required Store tile images live at `build/appx/` (shared by both
the legacy `appx` and current `msix` targets) and were generated from the
existing brand icon (`electron-assets/icon.png`) with no visual changes:

- `build/appx/StoreLogo.png` — 50×50
- `build/appx/Square44x44Logo.png` — 44×44
- `build/appx/Square150x150Logo.png` — 150×150
- `build/appx/Wide310x150Logo.png` — 310×150
