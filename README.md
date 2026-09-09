# taken

A small Android app for tracking recurring household chores and holding a
grocery list. Chores notify you locally when they come due; the grocery list
behaves like a Google Keep checklist.

Built with React Native + Expo (SDK 57), TypeScript, expo-router and SQLite.
All data stays on the device — there is no backend, no account and no network
access at runtime.

## Status

In development. See `CLAUDE.md` for the full design contract and build order.

- [x] Step 1 — two-tab app shell
- [ ] Step 2 — grocery list
- [ ] Step 3 — chores grid + detail screen
- [ ] Step 4 — local notifications
- [ ] Step 5 — export / import / reset
- [ ] Step 6 — production APK

## Development

Requires Node (LTS recommended) and an Expo account. There is no local Android
build: APKs are produced by EAS Build in Expo's cloud.

```bash
npm install
npm start       # starts the dev server for the development build
```

## Licence

MIT — see `LICENSE`.
