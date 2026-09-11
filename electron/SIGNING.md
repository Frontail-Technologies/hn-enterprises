# Windows code signing — not yet configured

The desktop build (`npm run dist`) currently produces an **unsigned** `.exe`
(both `dist-electron\win-unpacked\HN Enterprises.exe` and the NSIS installer
`HN Enterprises Setup *.exe`). That's why Microsoft SmartScreen flags it as
"isn't commonly downloaded" — there's no publisher identity attached at all.
See the signing audit for the full picture; this doc only tracks what's left
to do once a real certificate exists.

## Required later

- **Certificate/provider** — not chosen yet. Most CAs now issue OV and EV
  code-signing certs as hardware-token or cloud-HSM only (CA/Browser Forum
  baseline requirement change, June 2023), not a plain downloadable `.pfx` -
  confirm which applies before assuming file-based signing will work.
- **`win.publisherName`** (in `package.json`'s `build.win`) — must exactly
  match the certificate's Subject/CN. Do not set this until the certificate
  is issued; a mismatched value fails signing outright.
- **`win.rfc3161TimeStampServer`** — a timestamp authority URL (e.g.
  `http://timestamp.digicert.com`), chosen to match whichever CA issues the
  certificate. Add this alongside `publisherName` once known.
- **Signing credentials**, one of:
  - File-based: `CSC_LINK` (path/URL/base64 of the `.pfx`) and
    `CSC_KEY_PASSWORD` env vars - electron-builder picks these up
    automatically, no config changes needed.
  - Cloud/HSM-based (Azure Trusted Signing, DigiCert KeyLocker, SSL.com
    eSigner, etc.) - provider-specific credentials plus that vendor's local
    signing agent/CLI, exposed to `signtool` via the Windows certificate
    store. electron-builder has no built-in integration for these; wire a
    custom `sign` function under `build.win.signtoolOptions` once the
    provider is picked.

## Not required to change

`npm run dist` stays the build command either way - once credentials are in
place (env vars, or the HSM agent running locally/in CI), electron-builder
signs automatically as part of the same command via
`CSC_IDENTITY_AUTO_DISCOVERY` (enabled by default).
