# Releasing a desktop update (auto-update)

Installed apps (0.2.0 and later) check `https://api.hnenterprises.org/desktop-updates/latest.yml`
15 seconds after opening and every 6 hours. When the version there is newer, they download the
installer, verify its SHA-512, and offer **Restart now / Later** (Later installs on close).

## Each release

1. Bump `"version"` in `frontend/package.json` (e.g. 0.2.0 -> 0.2.1). Apps only update to a
   **higher** version.
2. Build: `npm run dist` in `frontend/`. In `dist-electron/` you get:
   - `latest.yml`
   - `HN-Enterprises-Setup-<version>.exe`
   - `HN-Enterprises-Setup-<version>.exe.blockmap`
3. Copy those three files to the backend server's `desktop-updates/` folder (next to the backend,
   or the folder set in `DESKTOP_UPDATES_DIR`), for example:

   ```
   scp "dist-electron/latest.yml" "dist-electron/HN-Enterprises-Setup-0.2.1.exe" "dist-electron/HN-Enterprises-Setup-0.2.1.exe.blockmap" ubuntu@<server>:~/hn-enterprises-backend/desktop-updates/
   ```

   Copy the `.exe` first and `latest.yml` last, so apps never see a version whose file is missing.
4. Check: `https://api.hnenterprises.org/desktop-updates/latest.yml` shows the new version.

## First time only

- Version 0.2.0 is the first build that can auto-update. Install it by hand once on every PC;
  after that, updates arrive by themselves.
- Create the `desktop-updates/` folder on the server.

## Notes

- The installer is unsigned, so Windows SmartScreen may still warn on a fresh install. Silent
  updates of an already-installed app are not interrupted by it.
- To test against another server set `HN_UPDATE_URL` before starting the app.
