# Notification sounds

The five `.wav` files in this folder are the sounds a chore reminder can play
(`CLAUDE.md` section 5). A sixth option, "Silent", is not a file — it is a
notification channel with no sound attached.

## Provenance and licence

All five come from Kenney's **Interface Sounds** pack (version 1.0, 2020-02-11),
released under **Creative Commons Zero 1.0 Universal (CC0)** — a public domain
dedication. They may be used in personal, educational and commercial projects.
Crediting Kenney is explicitly optional; this file does so anyway, because a
public repository should record where its binaries came from.

- Pack: https://kenney.nl/assets/interface-sounds
- Licence: https://creativecommons.org/publicdomain/zero/1.0/
- WAV conversion mirrored from https://github.com/Calinou/kenney-interface-sounds

## The files

| File | Original name | Length | Character |
|---|---|---|---|
| `chime.wav`  | `glass_001`        | 0.29s | Soft glass chime — the calm default |
| `ping.wav`   | `confirmation_001` | 0.29s | Friendly two-note confirmation |
| `pebble.wav` | `drop_003`         | 0.20s | Short, soft drop |
| `rise.wav`   | `maximize_006`     | 0.39s | Rising and insistent |
| `nudge.wav`  | `question_002`     | 0.34s | Questioning two-tone |

All are 16-bit, 44.1 kHz WAV, which is the format the Expo docs recommend.

## Rules if you change these

- **Filenames must be lowercase letters, digits and underscores only**, and may
  not start with a digit. The config plugin copies them into Android's
  `res/raw` directory, where those are the resource-naming rules — a hyphen or
  a capital letter breaks the native build.
- Every file here must also be listed in the `expo-notifications` plugin block
  in `app.json`, and have a matching entry in `CHORE_SOUNDS`
  (`src/features/chores/constants.ts`).
- Sounds are compiled into the APK. **Adding or renaming one requires a new EAS
  build**, not just a Metro reload.
- Android notification channels are immutable once created. Changing which
  sound a chore uses means posting to a different channel, never editing one.
