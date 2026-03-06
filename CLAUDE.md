# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
expo start          # Start dev server (press i/a/w to open iOS/Android/Web)
expo start --ios    # Open directly in iOS simulator
expo start --android
expo start --web

# Linting
expo lint

# Production builds (requires EAS CLI)
eas build --profile development --platform android
eas build --profile preview --platform android
eas build --profile production --platform android
```

No test runner is configured.

## Architecture

**Expo Router** with file-based routing under [src/app/](src/app/). The root layout (`_layout.tsx`) wraps the app in `ThemeProvider` and renders `AppTabs` for bottom tab navigation.

**Path aliases**: `@/*` maps to `src/*`, and `@/assets/*` maps to `assets/*`.

**Platform code splitting**: `.web.tsx` / `.web.ts` files are automatically selected by Metro on web. Key split files:
- `app-tabs.tsx` vs `app-tabs.web.tsx` — native uses `expo-router/unstable-native-tabs`; web uses `expo-router/ui`
- `animated-icon.tsx` vs `animated-icon.web.tsx`
- `use-color-scheme.ts` vs `use-color-scheme.web.ts`

**Theming**: `useTheme()` hook (from `src/hooks/use-theme.ts`) returns `Colors[colorScheme]`. Components use `ThemedText` and `ThemedView` to apply theme colors. Design tokens live in `src/constants/theme.ts`:
- `Colors`, `Fonts` (platform-specific font families), `Spacing` (named scale: half=2, one=4, two=8, three=16, four=24, five=32, six=64), `MaxContentWidth` (800), `BottomTabInset`

**Animations**: `react-native-reanimated` v4 with worklets. The splash overlay (`AnimatedSplashOverlay`) uses Keyframes and animates out after 600ms.

**State**: Local `useState` only — no global state library.

**React 19 + React Compiler** experiment is enabled (`app.json` → `experiments.reactCompiler: true`). Avoid manual memoization patterns that conflict with the compiler.

**Database**: `expo-sqlite` with a custom repository layer under `src/db/`:
- `schema.ts` — DDL + `SCHEMA_VERSION` (increment to trigger migrations)
- `database.ts` — `getDatabase()` singleton; migrations via `PRAGMA user_version`
- `note.ts` — `Note` (app layer), `NoteRow` (raw SQLite), `NoteType`, `CreateNoteInput`, `UpdateNoteInput`, and `rowToNote()` converter
- `note.repository.ts` — `getAllNotes`, `getNoteById`, `searchNotes`, `createNote`, `updateNote`, `deleteNote`
- `index.ts` — public re-exports for the whole `db/` module

Note fields: `id`, `type` (`text` | `audio` | `picture`), `text`, `media_uri`, `is_pinned`, `created_at`, `updated_at`. Timestamps are Unix ms integers. The app-layer `Note` type maps these to camelCase with `Date` objects and a boolean `isPinned`.

**Joystick**: Radial gesture menu in `src/components/joystick/`. Hold and drag to reveal 4 directions — up=Write, left=Speak, right=Picture, down=Settings. Built with `react-native-gesture-handler` (Pan gesture with `activateAfterLongPress`) + Reanimated worklets. Haptic feedback via `expo-haptics` on direction change. Props: `onActionPreview(dir)`, `onAction(dir)`, `onActionCancel(dir)`.

**Note creation overlays**: Modal overlays triggered by the joystick, slide in from the left with a backdrop.
- `new-note-overlay.tsx` — generic `CreateOverlay` base component (handles animation + backdrop)
- `new-note-text-overlay.tsx` — `CreateNoteOverlay` wrapping `NewTextNoteForm`; exposes `focus()` / `dismiss()`
- `new-note-picture-overlay.tsx` — `CreatePictureOverlay` wrapping `NewPictureNoteForm`; exposes `shoot()` / `dismiss()`
- `new-picture-note-form.tsx` — live `CameraView` (from `expo-camera`) with capture → saves `picture` note with `media_uri`

**Notes UI**: `src/components/notes/`
- `notes-list.tsx` — `NotesList` renders the list of notes
- `note-card.tsx` — `NoteCard` renders text notes as text, picture notes with a thumbnail (`expo-image`)
- `use-notes.ts` hook (`src/hooks/`) — loads all notes via `getAllNotes`; returns `{ notes, loading, refresh }`

## Key Libraries

- `expo-symbols` — SF Symbols (iOS) / Material Icons (Android)
- `expo-glass-effect` — glassmorphism
- `expo-image` — optimized images
- `expo-camera` — camera access for picture notes
- `expo-haptics` — haptic feedback (joystick direction changes)
- `expo-sqlite` — local SQLite database
- `react-native-gesture-handler` — gesture detection (joystick Pan gesture)
- `react-native-reanimated` v4 + `react-native-worklets`
- `expo-web-browser` — in-app browser for external links (`ExternalLink` component)
