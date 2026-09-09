# taken — chore reminders + grocery list

A personal Android app for one user (Timo) on one device: a Google Pixel running
GrapheneOS. It tracks recurring household chores, notifies when each is due, and
holds a Google Keep-style grocery list.

This file is the contract for how the project is built. It was produced from a
full requirements interview; every decision below was made deliberately, and the
rationale is recorded so it is not silently reversed later. If a decision needs
to change, change it here first.

---

## 1. Working style (read this first)

- **Timo is a complete beginner at app development.** Explain as you go: what
  each file is, why it exists, what is being looked at on screen. Do not assume
  knowledge of React, Node, Android, Gradle, or app stores.
- Walk through problems **step by step**; explain concepts before jumping to
  solutions. Prioritise understanding over speed.
- Every build step must end in **something visible on the phone**. No long
  stretches of invisible scaffolding.
- **Check official documentation** for Expo / Android / any library before
  implementing, not after the bug appears.
- **Websearch error messages** before proposing a fix.
- Commit after each meaningful change; **ask before pushing** to the remote.

## 2. Non-negotiable constraints

| Constraint | Consequence |
|---|---|
| Android only, GrapheneOS, no Google Play Services | Notifications must be **local** (scheduled on-device). No FCM, no push server, no Google account, ever. |
| No JDK / Android SDK on the dev machine | Builds happen **in Expo's cloud (EAS)**. Never introduce a step requiring a local native build. |
| Local-only data | No backend, no accounts, no network calls of any kind at runtime. |
| Public GitHub repo | Nothing personal in the code or history. |

Installed on the dev machine: Node 25.8.2, npm 11.11.1, git 2.49.0, Python 3.13.3.
Not installed: Java JDK, Android SDK, adb.

## 3. Stack

- **React Native + Expo, TypeScript.**
- **expo-router** for the two-tab navigation.
- **expo-sqlite** for storage.
- **expo-notifications** for local scheduled notifications.
- **EAS Build** for producing installable APKs.

Delivery: a **development build** (a cloud-built APK of this app that still
hot-reloads our code) during development — *not* Expo Go, which cannot do
custom notification sounds. A **production APK**, sideloaded, once v1 is done.

## 4. Data model (SQLite — the single source of truth)

```
chores
  id                 TEXT PRIMARY KEY
  name               TEXT
  icon               TEXT      -- key into the curated icon set
  color              TEXT
  interval_days      INTEGER
  sound_key          TEXT      -- one of the bundled sounds, or 'silent'
  last_completed_at  INTEGER   -- epoch ms, NULL if never
  created_at         INTEGER
  sort_order         INTEGER

completions
  id            TEXT PRIMARY KEY
  chore_id      TEXT       -- FK, ON DELETE CASCADE
  completed_at  INTEGER

grocery_items
  id          TEXT PRIMARY KEY
  text        TEXT
  checked     INTEGER   -- 0/1
  sort_order  REAL      -- fractional, for cheap drag-reorder
  checked_at  INTEGER   -- NULL when unchecked
```

`next_due` is **never stored**. It is always derived:

```
next_due = last_completed_at + interval_days * 86400000
```

A chore that has never been completed is due immediately.

Keep a **complete completion history**. Nothing displays it in v1 — streaks and
heat-maps become possible later precisely because the rows exist from day one.

## 5. Scheduling & notifications

**Design rule: the database is the truth; scheduled notifications are a
disposable projection of it.** Android's alarm scheduling does not survive a
reboot (expo/expo#4121), and time-zone changes, app updates and OS quirks can
all desynchronise it. Therefore:

- **Reconcile on every app launch, after every completion or chore edit, and on
  device boot**: cancel all pending notifications, recompute from the DB,
  reschedule.
- Schedule **one occurrence ahead per chore**. Never a year of them.
- Use **inexact** alarms. No `SCHEDULE_EXACT_ALARM` permission is requested — a
  reminder arriving at 09:20 instead of 09:00 is not a defect, and a lean
  permission list matters on GrapheneOS.
- The README must tell the user to grant the app a **battery-optimisation
  exemption**, or notifications can be delayed indefinitely while the phone is
  idle.

**Timing model: pure interval arithmetic.** Completing a chore at 23:40 with a
3-day interval means the next notification fires at 23:40 three days later. The
reminder time-of-day drifts to whenever the chore was last ticked. This was
chosen knowingly, over a fixed daily reminder hour.

**Overdue behaviour: one notification per due date, then silence.** No daily
re-nagging and no snooze in v1. The home-screen card turning red is the ongoing
signal.

**Sounds.** On Android 8+ the sound belongs to the *notification channel*, and
channels are **immutable once created**. So: bundle ~5 sound files at build time
via the `expo-notifications` config plugin, and **pre-create one channel per
sound** at first launch. Changing a chore's sound means changing which channel it
posts to. Never try to mutate a channel.

## 6. Screen 1 — Chores

- **2-column scrollable grid** of cards. Each card shows an icon, the chore
  name, and the **time until the next notification** underneath.
- Cards are **colour-coded by urgency**: calm when distant, amber when due
  today, red when overdue.
- **Icons come from a curated set of ~30 hand-picked household icons**, shown in
  a simple grid picker. Finite and coherent by design — not a searchable
  7,000-icon library.
- **Tap a card → chore detail screen**, where the user can edit name, icon,
  colour, interval and sound; **mark it done**; or **delete** it.
- **Mark done** is available both on the card (tap / long-press) and in the
  detail screen. An actionable "Done" button on the notification itself is a
  post-v1 addition, explicitly planned for.
- **Changing an interval applies retroactively**: next due is recomputed from
  `last_completed_at`, so editing a chore can never hide something already
  overdue.
- **Delete = a confirm dialog, then gone**, history included.
- An **add-chore** button creates custom chores with any name, icon, colour,
  interval and sound.

**Seeded on first launch** (all editable, all deletable):

| Chore | Interval |
|---|---|
| Water plants | 7 days |
| Doing laundry | 7 days |
| Take out the trash | 3 days |
| Clean the kitchen | 3 days |
| Dust shelves | 14 days |
| Clean the bathroom | 14 days |

## 7. Screen 2 — Grocery list

**One single list**, replicating Google Keep's checklist behaviour faithfully:

- Type at the top to add an item; items are freely editable text.
- Ticking an item animates it **down into a collapsed "N ticked items" section**.
- Unticking returns it to the main list **at the bottom**.
- **Long-press-drag to reorder** unchecked items.
- An overflow menu with **"Uncheck all items"** and **"Delete checked items"**.
- Checked items **persist indefinitely** until explicitly deleted.

## 8. Settings

- **Export** — writes a JSON backup out through the Android share sheet
  (OneDrive, Files, anywhere).
- **Import** — reads one back via the file picker.
- Reset to the seeded chores.

Backup is manual and user-initiated. No background jobs, no auto-sync.

## 9. Theme

Follow the **system light/dark theme**, wired in from the first screen rather
than retrofitted.

## 10. Build order (v1)

1. Empty Expo app, two tabs, running on the Pixel via a development build.
2. **Grocery list**, complete with all Keep behaviours. (Deliberately first: it
   is the simplest complete feature, so the whole loop is understood before the
   hardest part.)
3. Chore data model + home-screen grid + detail/edit screen.
4. Notifications: channels, sounds, reconcile-on-launch/boot.
5. Settings: export / import / reset.
6. Production APK, README with the battery-exemption setup steps.

**v1 is done** when all six are complete and the app runs from a sideloaded
production APK with no laptop involved.

## 11. Explicitly out of scope for v1

Cloud sync · shared or multi-user lists · multiple grocery lists · streaks and
history UI · notification action buttons · snooze · daily overdue re-nagging ·
quiet hours · per-chore reminder times · fixed-weekday chores · iOS · Play Store.

Several of these are cheap follow-ups precisely because the data model above
already accommodates them. Do not build them early.

## 12. Repo & git

- **Public GitHub repository**, **MIT licence**.
- Commit identity in this repo: name `Timo Strijbis`, email set to the GitHub
  `@users.noreply.github.com` address — configured **locally in this repo only**,
  and **before the first commit** (changing it later means rewriting history).
- Explicit `.gitignore`: `node_modules/`, `.expo/`, build output, `*.db`, any
  exported backup JSON, `.env*`.
- No personal data in the repo. All chore and grocery data lives on the phone.
- Commit as work progresses; **ask before pushing**.
