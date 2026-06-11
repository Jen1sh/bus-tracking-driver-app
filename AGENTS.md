# AGENTS.md — bus-tracking-driver-app

## Project

Expo SDK 56 managed workflow (React Native 0.85) with Expo Router, Unistyles v3, Zustand, React Query. This is a starter template — not yet a bus tracking app.

## Quick start

```sh
npm install          # install deps
npm start            # expo start -c (clears Metro cache)
npm run ios          # expo run:ios
npm run android      # expo run:android
npm run lint         # eslint --fix .
npm test             # jest --watchAll
npm run prebuild     # expo prebuild (generate ios/android)
```

EAS local builds: `npm run build:dev`, `npm run build:prev`, `npm run build:prod`.

## Architecture

- **Entry**: `index.ts` → imports `expo-router/entry`, unistyles init, reanimated (order matters)
- **Routing**: Expo Router file-based. Auth gated via `<Stack.Protected guard={!!token}>` in `app/_layout.tsx`
- **Styling**: Unistyles v3 (`react-native-unistyles`). NOT Tailwind/NativeWind. Theme tokens in `src/unistyles/tokens.ts`, configured in `src/unistyles/index.ts`
- **State**: Zustand (`src/store/index.ts`) + React Query
- **Auth**: `src/contexts/auth.context.tsx` — token stored in expo-secure-store key `AccessToken`
- **HTTP**: Axios instance in `src/lib/axios.ts` — default baseURL is `http://127.0.0.1/api/` (placeholder)
- **Fonts**: Rubik family loaded via `expo-font` at app root. Splash screen waits for font load
- **Theme**: Persisted in SecureStore under key `Theme`. Toggled via `useAppTheme()` hook

## Path aliases

All `@/` aliases are defined in `tsconfig.json` paths:
- `@/components/*` → `src/components/*`
- `@/lib/*` → `src/lib/*`
- `@/store/*` → `src/store/*`
- `@/unistyles/*` → `src/unistyles/*`
- `@/constants/*` → `src/constants/*`
- `@/hooks/*` → `src/hooks/*`
- `@/contexts/*` → `src/contexts/*`
- `@/assets/*` → `assets/*`
- `@/app/*` → `app/*`

## Babel plugins

`babel.config.js` requires both `react-native-unistyles/plugin` and `react-native-worklets/plugin`. Do not remove.

## Tooling

- **Lint**: ESLint with `eslint-config-expo` + Prettier plugin (`eslint --fix .`)
- **Format**: Prettier — single quotes, trailing commas, bracketSameLine, no arrow parens, 100 print width
- **Test**: Jest with `jest-expo` preset. No tests exist yet
- **TypeScript**: strict mode, `typedRoutes` experiment enabled in app.config

## Native builds

- `ios/` and `android/` are gitignored — generate via `npx expo prebuild`
- APP_VARIANT=development switches bundle identifier and display name (dev vs prod)
- `expo-dev-client` configured with `launchMode: 'most-recent'`
- Splash config in `app.config.ts`, not a separate plugin call

## Skills

`.agents/skills/` contains technique references for Expo workflows (deployment, dev-client, API routes, modules, brownfield, App Clip, Tailwind, SwiftUI/Jetpack Compose UI, data fetching, upgrade insights). Also listed in `skills-lock.json`. Load via the skill tool prefix when a task matches.
