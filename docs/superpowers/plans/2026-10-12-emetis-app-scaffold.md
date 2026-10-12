# Emetis App Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the Emetis React Native / Expo app: project scaffold, folder structure organized by actor (public/traveler/host), tooling (lint, format, hooks, commit validation), navigation, state/data layers, testing, CI, PR templates, and docs — ready for feature teams to build on.

**Architecture:** Expo managed workflow with Expo Router for file-based navigation, split into route groups `(public)`, `(auth)`, `(traveler)`, `(host)`. Business logic lives in `src/actors/<actor>/features/*`, never in `app/`. Zustand holds local/session state, TanStack Query handles server data via a shared `apiClient`. Everything enforced by ESLint/Prettier/Husky/commitlint locally and GitHub Actions in CI.

**Tech Stack:** Expo SDK (latest stable) + Expo Router, TypeScript (strict), ESLint (eslint-config-expo) + Prettier, Husky + lint-staged + commitlint, Zustand, TanStack Query, Jest + React Native Testing Library, GitHub Actions, npm.

**Spec:** [docs/superpowers/specs/2026-10-12-emetis-app-architecture-design.md](../specs/2026-10-12-emetis-app-architecture-design.md)

## Global Constraints

- Package manager: npm (lockfile `package-lock.json` committed).
- TypeScript strict mode on, no implicit any.
- Absolute imports via `@/` alias — no `../../../../` imports.
- `app/` directory contains routing files only; no business logic, no direct API calls.
- `UserRole` is a string union type (`'traveler' | 'host'`), never a closed TS enum, to keep it extensible for a future third actor.
- All commits must pass commitlint (Conventional Commits) via Husky `commit-msg` hook.
- All PRs to `main`/`develop` must pass lint, typecheck, test, format:check in CI before merge is allowed (branch protection is a manual GitHub repo-settings step, documented in Task 10 but not automatable from this plan).

---

### Task 1: Scaffold Expo + TypeScript + Expo Router project

**Files:**

- Create: entire Expo project tree via `create-expo-app` (package.json, app.json, app/, assets/, tsconfig.json, etc.)
- Modify: `package.json` (scripts section)
- Modify: `.gitignore` (verify Expo defaults are present)

**Interfaces:**

- Produces: a runnable Expo project with `app/` (Expo Router, default tabs template) and `package.json` scripts `start`, `android`, `ios`, `web`.

- [ ] **Step 1: Run create-expo-app in the current directory**

```bash
npx create-expo-app@latest . --yes
```

This targets the current directory (already contains `docs/` and `.git`, which does not conflict). It installs the default template: TypeScript + Expo Router + example tabs navigation.

- [ ] **Step 2: Verify the scaffold installed correctly**

Run: `cat package.json`
Expected: contains `"expo-router"` in dependencies and `"main": "expo-router/entry"`.

Run: `ls app`
Expected: shows `_layout.tsx`, `(tabs)/`, and other default Expo Router files.

- [ ] **Step 3: Verify the app boots**

Run: `npx expo-doctor`
Expected: no blocking errors reported.

- [ ] **Step 4: Commit the scaffold**

```bash
git add -A
git commit -m "chore: scaffold expo app with typescript and expo router"
```

---

### Task 2: TypeScript strict config + `@/` path alias

**Files:**

- Modify: `tsconfig.json`

**Interfaces:**

- Produces: `@/*` import alias resolving to `src/*` and project root for `app/*` usages; `strict: true`.

- [ ] **Step 1: Update tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./app/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: exits 0 (no errors) on the fresh scaffold.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: enable strict typescript and @/ path alias"
```

---

### Task 3: ESLint + Prettier

**Files:**

- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `.prettierignore`
- Modify: `package.json` (scripts: `lint`, `lint:fix`, `format`, `format:check`)

**Interfaces:**

- Produces: `npm run lint`, `npm run format:check` commands used by Husky (Task 4) and CI (Task 10).

- [ ] **Step 1: Install dependencies**

```bash
npx expo install eslint-config-expo eslint --dev
npm install --save-dev prettier eslint-config-prettier
```

- [ ] **Step 2: Create eslint.config.js**

```js
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['dist/*', '.expo/*'],
  },
];
```

- [ ] **Step 3: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 4: Create .prettierignore**

```
node_modules
dist
.expo
package-lock.json
```

- [ ] **Step 5: Add scripts to package.json**

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint`
Expected: exits 0 on the fresh scaffold (or only trivial warnings, no errors).

Run: `npm run format:check`
Expected: reports files needing formatting (expected on first run).

Run: `npm run format`
Expected: formats all files; re-run `npm run format:check` and expect exit 0.

- [ ] **Step 7: Commit**

```bash
git add eslint.config.js .prettierrc .prettierignore package.json package-lock.json
git commit -m "chore: add eslint and prettier"
```

---

### Task 4: Husky + lint-staged + commitlint

**Files:**

- Create: `.husky/pre-commit`
- Create: `.husky/commit-msg`
- Create: `commitlint.config.js`
- Create: `.lintstagedrc.json`
- Modify: `package.json` (scripts: `prepare`; devDependencies)

**Interfaces:**

- Produces: automatic lint/format on staged files before commit, and Conventional Commits validation on every commit message.

- [ ] **Step 1: Install dependencies**

```bash
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional
```

- [ ] **Step 2: Add prepare script and init husky**

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

Run: `npm run prepare`
Expected: creates `.husky/` directory with `_` subfolder.

- [ ] **Step 3: Create .lintstagedrc.json**

```json
{
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

- [ ] **Step 4: Create .husky/pre-commit**

```bash
npx lint-staged
```

- [ ] **Step 5: Create commitlint.config.js**

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

- [ ] **Step 6: Create .husky/commit-msg**

```bash
npx --no -- commitlint --edit "$1"
```

- [ ] **Step 7: Make hooks executable and verify**

```bash
chmod +x .husky/pre-commit .husky/commit-msg
```

Run: `echo "bad commit message" | npx commitlint`
Expected: fails with a rule violation (subject/type missing).

Run: `echo "chore: valid message" | npx commitlint`
Expected: exits 0.

- [ ] **Step 8: Commit (this commit itself validates the new commit-msg hook)**

```bash
git add .husky commitlint.config.js .lintstagedrc.json package.json package-lock.json
git commit -m "chore: add husky, lint-staged and commitlint"
```

---

### Task 5: Folder structure — `src/` skeleton with real base modules

**Files:**

- Create: `src/types/user.ts`
- Create: `src/lib/env.ts`
- Create: `src/lib/apiClient.ts`
- Create: `src/lib/queryClient.ts`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Button.test.tsx`
- Create: `.env.example`
- Modify: `.gitignore` (add `.env`)
- Modify: `app.config.ts` (create from `app.json` if needed, to read env)

**Interfaces:**

- Produces: `UserRole` type, `env` validated config object, `apiClient.get/post`, `queryClient` instance, `Button` component — all consumed by later tasks.

- [ ] **Step 1: Install zod for env validation**

```bash
npm install zod
```

- [ ] **Step 2: Create src/types/user.ts**

```ts
export type UserRole = 'traveler' | 'host';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
```

- [ ] **Step 3: Create .env.example**

```
EXPO_PUBLIC_API_BASE_URL=https://api.emetis.net
```

- [ ] **Step 4: Create src/lib/env.ts**

```ts
import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
});

export const env = envSchema.parse({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
});
```

- [ ] **Step 5: Create src/lib/apiClient.ts**

```ts
import { env } from '@/lib/env';

interface RequestOptions {
  headers?: Record<string, string>;
}

async function request<T>(path: string, init: RequestInit & RequestOptions = {}): Promise<T> {
  const response = await fetch(`${env.EXPO_PUBLIC_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...options }),
};
```

- [ ] **Step 6: Install TanStack Query and create queryClient**

```bash
npm install @tanstack/react-query
```

Create `src/lib/queryClient.ts`:

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});
```

- [ ] **Step 7: Write failing test for Button component**

Create `src/components/ui/Button.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

test('calls onPress when pressed', () => {
  const onPress = jest.fn();
  render(<Button label="Confirm" onPress={onPress} />);

  fireEvent.press(screen.getByText('Confirm'));

  expect(onPress).toHaveBeenCalledTimes(1);
});
```

Note: this test will run once Task 6 (Jest setup) is in place. If running it now fails with "jest: command not found" or no test runner configured, that is expected — Task 6 wires up the runner. Proceed to Step 8 to create the component itself; the test will be executed for real at the end of Task 6.

- [ ] **Step 8: Create src/components/ui/Button.tsx**

```tsx
import { Pressable, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
}

export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  label: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
```

- [ ] **Step 9: Add .env to .gitignore**

Append to `.gitignore`:

```
.env
```

- [ ] **Step 10: Commit**

```bash
git add src .env.example .gitignore package.json package-lock.json
git commit -m "feat: add env validation, api client, query client and base ui button"
```

---

### Task 6: Jest + React Native Testing Library

**Files:**

- Create: `jest.config.js`
- Create: `jest.setup.js`
- Modify: `package.json` (scripts: `test`, `test:watch`; devDependencies)

**Interfaces:**

- Produces: `npm test` running all `*.test.ts(x)` files, including the `Button.test.tsx` written in Task 5.

- [ ] **Step 1: Install dependencies**

```bash
npx expo install jest-expo jest @testing-library/react-native @testing-library/jest-native --dev
```

- [ ] **Step 2: Create jest.config.js**

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

- [ ] **Step 3: Create jest.setup.js**

```js
import '@testing-library/jest-native/extend-expect';
```

- [ ] **Step 4: Add test scripts to package.json**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

- [ ] **Step 5: Run the Button test written in Task 5**

Run: `npm test -- Button`
Expected: PASS — `calls onPress when pressed` succeeds.

- [ ] **Step 6: Commit**

```bash
git add jest.config.js jest.setup.js package.json package-lock.json
git commit -m "chore: add jest and react native testing library"
```

---

### Task 7: Zustand session store + auth module

**Files:**

- Create: `src/auth/sessionStore.ts`
- Create: `src/auth/sessionStore.test.ts`

**Interfaces:**

- Consumes: `User`, `UserRole` from `src/types/user.ts` (Task 5).
- Produces: `useSessionStore` hook with shape `{ user: User | null, setUser(user: User): void, logout(): void }`, consumed by `app/_layout.tsx` role-based redirect (Task 8).

- [ ] **Step 1: Install zustand**

```bash
npm install zustand
```

- [ ] **Step 2: Write failing test**

Create `src/auth/sessionStore.test.ts`:

```ts
import { useSessionStore } from './sessionStore';

test('setUser stores the user and logout clears it', () => {
  const traveler = { id: '1', email: 't@emetis.net', name: 'Traveler', role: 'traveler' as const };

  useSessionStore.getState().setUser(traveler);
  expect(useSessionStore.getState().user).toEqual(traveler);

  useSessionStore.getState().logout();
  expect(useSessionStore.getState().user).toBeNull();
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- sessionStore`
Expected: FAIL — `./sessionStore` module not found.

- [ ] **Step 4: Create src/auth/sessionStore.ts**

```ts
import { create } from 'zustand';
import type { User } from '@/types/user';

interface SessionState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- sessionStore`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/auth package.json package-lock.json
git commit -m "feat: add zustand session store"
```

---

### Task 8: Route groups — public / auth / traveler / host with role-based redirect

**Files:**

- Modify: `app/_layout.tsx` (replace default content)
- Create: `app/(public)/_layout.tsx`
- Create: `app/(public)/index.tsx`
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(auth)/login.tsx`
- Create: `app/(traveler)/_layout.tsx`
- Create: `app/(traveler)/(tabs)/_layout.tsx`
- Create: `app/(traveler)/(tabs)/search.tsx`
- Create: `app/(host)/_layout.tsx`
- Create: `app/(host)/(tabs)/_layout.tsx`
- Create: `app/(host)/(tabs)/listings.tsx`
- Delete: default `app/(tabs)/` directory and example files from the create-expo-app template
- Create: `src/actors/traveler/features/search/SearchScreen.tsx`
- Create: `src/actors/host/features/listings/ListingsScreen.tsx`
- Create: `src/public/features/discovery/DiscoveryScreen.tsx`

**Interfaces:**

- Consumes: `useSessionStore` from Task 7.
- Produces: working navigation shell with role-based redirect at the root.

- [ ] **Step 1: Remove the default template's example routes**

```bash
rm -rf "app/(tabs)"
rm -f app/modal.tsx
```

(Exact files to remove depend on what `create-expo-app` generated in Task 1 — remove whatever example tab/modal screens exist alongside `app/_layout.tsx`.)

- [ ] **Step 2: Create src/public/features/discovery/DiscoveryScreen.tsx**

```tsx
import { View, Text, StyleSheet } from 'react-native';

export function DiscoveryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Découvrez Emetis</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
});
```

- [ ] **Step 3: Create app/(public)/\_layout.tsx and app/(public)/index.tsx**

`app/(public)/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function PublicLayout() {
  return <Stack />;
}
```

`app/(public)/index.tsx`:

```tsx
import { DiscoveryScreen } from '@/public/features/discovery/DiscoveryScreen';

export default function PublicIndex() {
  return <DiscoveryScreen />;
}
```

- [ ] **Step 4: Create app/(auth)/\_layout.tsx and app/(auth)/login.tsx**

`app/(auth)/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack />;
}
```

`app/(auth)/login.tsx`:

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useSessionStore } from '@/auth/sessionStore';
import { router } from 'expo-router';

export default function LoginScreen() {
  const setUser = useSessionStore((state) => state.setUser);

  function loginAsTraveler() {
    setUser({ id: '1', email: 'traveler@emetis.net', name: 'Traveler Demo', role: 'traveler' });
    router.replace('/(traveler)/(tabs)/search');
  }

  function loginAsHost() {
    setUser({ id: '2', email: 'host@emetis.net', name: 'Host Demo', role: 'host' });
    router.replace('/(host)/(tabs)/listings');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <Button label="Se connecter comme traveler" onPress={loginAsTraveler} />
      <Button label="Se connecter comme host" onPress={loginAsHost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
});
```

- [ ] **Step 5: Create src/actors/traveler/features/search/SearchScreen.tsx**

```tsx
import { View, Text, StyleSheet } from 'react-native';

export function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recherche (traveler)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
});
```

- [ ] **Step 6: Create app/(traveler)/\_layout.tsx and tabs**

`app/(traveler)/_layout.tsx`:

```tsx
import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '@/auth/sessionStore';

export default function TravelerLayout() {
  const user = useSessionStore((state) => state.user);

  if (!user || user.role !== 'traveler') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack />;
}
```

`app/(traveler)/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';

export default function TravelerTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="search" options={{ title: 'Recherche' }} />
    </Tabs>
  );
}
```

`app/(traveler)/(tabs)/search.tsx`:

```tsx
import { SearchScreen } from '@/actors/traveler/features/search/SearchScreen';

export default function Search() {
  return <SearchScreen />;
}
```

- [ ] **Step 7: Create src/actors/host/features/listings/ListingsScreen.tsx**

```tsx
import { View, Text, StyleSheet } from 'react-native';

export function ListingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes annonces (host)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
});
```

- [ ] **Step 8: Create app/(host)/\_layout.tsx and tabs**

`app/(host)/_layout.tsx`:

```tsx
import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '@/auth/sessionStore';

export default function HostLayout() {
  const user = useSessionStore((state) => state.user);

  if (!user || user.role !== 'host') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack />;
}
```

`app/(host)/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';

export default function HostTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="listings" options={{ title: 'Annonces' }} />
    </Tabs>
  );
}
```

`app/(host)/(tabs)/listings.tsx`:

```tsx
import { ListingsScreen } from '@/actors/host/features/listings/ListingsScreen';

export default function Listings() {
  return <ListingsScreen />;
}
```

- [ ] **Step 9: Replace app/\_layout.tsx with the root providers + redirect**

```tsx
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(traveler)" />
        <Stack.Screen name="(host)" />
      </Stack>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 10: Verify typecheck and lint pass**

Run: `npx tsc --noEmit`
Expected: exits 0.

Run: `npm run lint`
Expected: exits 0.

- [ ] **Step 11: Verify the app boots**

Run: `npx expo-doctor`
Expected: no blocking errors.

- [ ] **Step 12: Commit**

```bash
git add app src
git commit -m "feat: add public/auth/traveler/host route groups with role-based redirect"
```

---

### Task 9: TanStack Query example — host listings fetch

**Files:**

- Create: `src/actors/host/features/listings/api.ts`
- Create: `src/actors/host/features/listings/useListings.ts`
- Create: `src/actors/host/features/listings/useListings.test.ts`
- Modify: `src/actors/host/features/listings/ListingsScreen.tsx`

**Interfaces:**

- Consumes: `apiClient` (Task 5), `queryClient` test utilities.
- Produces: `useListings()` hook returning `{ data, isLoading, error }`, demonstrating the TanStack Query pattern feature teams will follow for other actors/features.

- [ ] **Step 1: Create src/actors/host/features/listings/api.ts**

```ts
import { apiClient } from '@/lib/apiClient';

export interface Listing {
  id: string;
  title: string;
}

export function fetchHostListings(): Promise<Listing[]> {
  return apiClient.get<Listing[]>('/host/listings');
}
```

- [ ] **Step 2: Write failing test for useListings**

Create `src/actors/host/features/listings/useListings.test.ts`:

```ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useListings } from './useListings';
import * as api from './api';

jest.mock('./api');

function createWrapper() {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

test('returns listings once the query resolves', async () => {
  jest.spyOn(api, 'fetchHostListings').mockResolvedValue([{ id: '1', title: 'Loft Paris' }]);

  const { result } = renderHook(() => useListings(), { wrapper: createWrapper() });

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.data).toEqual([{ id: '1', title: 'Loft Paris' }]);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- useListings`
Expected: FAIL — `./useListings` module not found.

- [ ] **Step 4: Create src/actors/host/features/listings/useListings.ts**

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchHostListings } from './api';

export const listingsKeys = {
  all: ['host', 'listings'] as const,
};

export function useListings() {
  return useQuery({
    queryKey: listingsKeys.all,
    queryFn: fetchHostListings,
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- useListings`
Expected: PASS.

- [ ] **Step 6: Wire the hook into ListingsScreen**

Replace `src/actors/host/features/listings/ListingsScreen.tsx` with:

```tsx
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useListings } from './useListings';

export function ListingsScreen() {
  const { data, isLoading, error } = useListings();

  if (isLoading) {
    return <ActivityIndicator style={styles.container} />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Erreur de chargement des annonces</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes annonces (host)</Text>
      {data?.map((listing) => (
        <Text key={listing.id}>{listing.title}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
});
```

- [ ] **Step 7: Verify full test suite and typecheck still pass**

Run: `npm test`
Expected: all tests PASS.

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 8: Commit**

```bash
git add src/actors/host/features/listings
git commit -m "feat: add host listings query hook as tanstack query reference pattern"
```

---

### Task 10: GitHub Actions CI + PR template + issue template

**Files:**

- Create: `.github/workflows/ci.yml`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`

**Interfaces:**

- Produces: CI pipeline that runs on every PR to `main`/`develop`, used as required status checks once branch protection is configured on GitHub.

- [ ] **Step 1: Create .github/workflows/ci.yml**

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Format check
        run: npm run format:check

      - name: Test
        run: npm test -- --ci --coverage
```

- [ ] **Step 2: Create .github/PULL_REQUEST_TEMPLATE.md**

```markdown
## Quoi

<!-- Ce que ce PR change, en 1-2 phrases -->

## Pourquoi

<!-- Lien ticket, contexte métier -->

Closes #

## Acteur(s) concerné(s)

- [ ] Public
- [ ] Traveler
- [ ] Host
- [ ] Shared / transverse

## Comment tester

<!-- Étapes manuelles pour vérifier -->

## Screenshots / vidéo

<!-- Si changement UI -->

## Checklist

- [ ] Testé sur iOS et Android (ou simulateur)
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Pas de `console.log` oublié
- [ ] Pas de secret/clé en dur
- [ ] Docs mises à jour si besoin
```

- [ ] **Step 3: Create .github/ISSUE_TEMPLATE/bug_report.md**

```markdown
---
name: Bug report
about: Signaler un bug
labels: bug
---

## Comportement observé

## Comportement attendu

## Étapes pour reproduire

1.
2.

## Acteur concerné

- [ ] Public
- [ ] Traveler
- [ ] Host

## Environnement

- Plateforme: iOS / Android
- Version app:
```

- [ ] **Step 4: Create .github/ISSUE_TEMPLATE/feature_request.md**

```markdown
---
name: Feature request
about: Proposer une fonctionnalité
labels: enhancement
---

## Problème à résoudre

## Solution proposée

## Acteur concerné

- [ ] Public
- [ ] Traveler
- [ ] Host
```

- [ ] **Step 5: Commit**

```bash
git add .github
git commit -m "ci: add github actions pipeline and pr/issue templates"
```

---

### Task 11: EAS config + app.config.ts

**Files:**

- Create: `eas.json`
- Create: `app.config.ts`
- Delete: `app.json` (superseded by `app.config.ts`)

**Interfaces:**

- Produces: `app.config.ts` exporting Expo config with env-driven `extra.apiBaseUrl`; `eas.json` with `development`, `preview`, `production` profiles.

- [ ] **Step 1: Read the existing app.json to preserve generated values**

Run: `cat app.json`

Note the `expo.name`, `expo.slug`, `expo.scheme`, and icon/splash paths generated by `create-expo-app` in Task 1 — carry them into `app.config.ts` in Step 2.

- [ ] **Step 2: Create app.config.ts**

```ts
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Emetis',
  slug: 'emetis-app',
  scheme: 'emetis',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'net.emetis.app',
  },
  android: {
    package: 'net.emetis.app',
  },
  plugins: ['expo-router'],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  },
};

export default config;
```

Adjust `icon`/`splash` paths to match whatever `create-expo-app` actually generated in Task 1 if different.

- [ ] **Step 3: Remove app.json**

```bash
rm app.json
```

- [ ] **Step 4: Create eas.json**

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

- [ ] **Step 5: Verify Expo config is valid**

Run: `npx expo config --type public`
Expected: prints the resolved config with no errors.

- [ ] **Step 6: Commit**

```bash
git add app.config.ts eas.json
git add -u app.json
git commit -m "chore: switch to app.config.ts and add eas build profiles"
```

---

### Task 12: Documentation

**Files:**

- Create: `README.md` (modify if create-expo-app generated one)
- Create: `docs/getting-started.md`
- Create: `docs/architecture.md`
- Create: `docs/conventions.md`
- Create: `docs/contributing.md`
- Create: `docs/adr/0001-expo-router-et-structure-par-acteur.md`

**Interfaces:**

- None — documentation only, no code interfaces.

- [ ] **Step 1: Create README.md**

````markdown
# Emetis App

App mobile React Native / Expo pour [emetis.net](https://emetis.net).

## Stack

- Expo (managed) + Expo Router
- TypeScript strict
- Zustand (state) + TanStack Query (data fetching)
- Jest + React Native Testing Library
- ESLint + Prettier + Husky + commitlint

## Démarrage rapide

```bash
npm install
cp .env.example .env
npm start
```
````

## Documentation

- [Getting started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Conventions](docs/conventions.md)
- [Contributing](docs/contributing.md)
- [Spec architecture complète](docs/superpowers/specs/2026-10-12-emetis-app-architecture-design.md)

````

- [ ] **Step 2: Create docs/getting-started.md**

```markdown
# Getting started

## Prérequis

- Node.js 20+
- npm
- Expo Go (mobile) ou simulateur iOS/Android

## Installation

```bash
git clone <repo-url>
cd emetis-app
npm install
cp .env.example .env
````

Renseigner `.env` avec l'URL de l'API (`EXPO_PUBLIC_API_BASE_URL`).

## Lancer l'app

```bash
npm start       # Metro bundler, scanner le QR avec Expo Go
npm run ios     # simulateur iOS
npm run android # émulateur Android
```

## Commandes utiles

- `npm run lint` — vérifie le code avec ESLint
- `npm run format` — formate avec Prettier
- `npm run typecheck` — vérifie les types TypeScript (`npx tsc --noEmit`)
- `npm test` — lance les tests Jest

````

- [ ] **Step 3: Create docs/architecture.md**

```markdown
# Architecture

Voir la spec complète: [2026-10-12-emetis-app-architecture-design.md](superpowers/specs/2026-10-12-emetis-app-architecture-design.md).

## Résumé

L'app est organisée par **acteur** (`public`, `traveler`, `host`) puis par **feature**:

- `app/` — Expo Router, routing uniquement, aucune logique métier.
- `src/actors/<acteur>/features/<feature>/` — logique métier, API, hooks, store par feature.
- `src/actors/shared/` — logique métier partagée entre acteurs (messagerie, profil...).
- `src/public/features/` — features accessibles sans compte.
- `src/components/ui/` — design system pur, agnostique de l'acteur.
- `src/lib/` — apiClient, queryClient, config transverse.

## Ajouter un nouvel acteur

1. Créer `app/(nouvel-acteur)/` avec son `_layout.tsx` (guard de rôle, voir `app/(host)/_layout.tsx`).
2. Créer `src/actors/nouvel-acteur/features/`.
3. Étendre le type `UserRole` dans `src/types/user.ts`.

Aucun fichier des acteurs existants ne doit être modifié pour ça.

## Ajouter une feature à un acteur existant

1. Créer `src/actors/<acteur>/features/<feature>/` avec `api.ts`, `use<Feature>.ts`, `types.ts`.
2. Suivre le pattern de `src/actors/host/features/listings/` comme référence (query hook TanStack Query).
3. Créer l'écran dans `app/(<acteur>)/(tabs)/<feature>.tsx` qui importe depuis `src/actors/<acteur>/features/<feature>/`.
````

- [ ] **Step 4: Create docs/conventions.md**

```markdown
# Conventions

## Nommage fichiers

- Composants: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Non-composants (api, types, utils): `camelCase.ts`
- Dossiers multi-mots: `kebab-case`
- Tests co-localisés: `*.test.ts(x)`

## Nommage code

- Composants/Types: `PascalCase`
- Variables/fonctions: `camelCase`
- Constantes figées: `UPPER_SNAKE_CASE`
- Props d'un composant `X`: `XProps`
- Store Zustand: suffixe `Store` (`useSessionStore`)
- Query keys TanStack: factory par feature (`listingsKeys.all`)

## Imports

Toujours l'alias `@/` pour sortir du dossier courant. Jamais de `../../../../`.

## Branches

- `feature/<ticket>-<description>`
- `fix/<ticket>-<description>`
- `chore/<description>`
- `hotfix/<description>`

## Commits (Conventional Commits)
```

<type>(<scope>): <description impérative>

```

Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`.
Scope: acteur ou module (`feat(host): ...`, `fix(traveler): ...`).

Validé automatiquement par commitlint à chaque commit.
```

- [ ] **Step 5: Create docs/contributing.md**

````markdown
# Contributing

## Workflow

1. Partir de `develop`, créer une branche (`feature/EM-123-description`).
2. Développer, committer en Conventional Commits (validé par husky).
3. Ouvrir une PR vers `develop` en remplissant le template.
4. La CI doit être verte (lint, typecheck, test, format) avant review.
5. Au moins 1 approbation requise avant merge.
6. Squash merge.

## Avant d'ouvrir une PR

```bash
npm run lint
npm run format:check
npx tsc --noEmit
npm test
```
````

## Revue de code

Vérifier: respect de la structure par acteur (pas de logique dans `app/`), nommage conforme à `docs/conventions.md`, tests sur la logique métier ajoutée.

````

- [ ] **Step 6: Create docs/adr/0001-expo-router-et-structure-par-acteur.md**

```markdown
# ADR 0001: Expo Router + structure par acteur

Date: 2026-10-12
Statut: Accepté

## Contexte

App multi-acteurs (traveler, host, public) avec un 3e acteur possible plus tard.
Besoin d'une structure qui isole le métier de chaque acteur sans bloquer l'ajout
d'un nouvel acteur.

## Décision

- Navigation via Expo Router (file-based), avec des groupes de routes par acteur:
  `(public)`, `(auth)`, `(traveler)`, `(host)`.
- Logique métier dans `src/actors/<acteur>/features/`, jamais dans `app/`.
- Logique partagée entre acteurs dans `src/actors/shared/`.

## Conséquences

- Ajouter un acteur = ajouter un dossier, zéro impact sur l'existant.
- `app/` reste fin et lisible, toute la complexité vit dans `src/`.
- Légère indirection (chaque route délègue à un composant dans `src/`) acceptée
  pour garder cette isolation.
````

- [ ] **Step 7: Commit**

```bash
git add README.md docs
git commit -m "docs: add getting started, architecture, conventions, contributing and adr"
```

---

## Final verification (run after all tasks)

- [ ] Run: `npm run lint` — expect exit 0
- [ ] Run: `npm run format:check` — expect exit 0
- [ ] Run: `npx tsc --noEmit` — expect exit 0
- [ ] Run: `npm test` — expect all tests PASS
- [ ] Run: `npx expo-doctor` — expect no blocking errors
- [ ] Manually start the app (`npm start`), open on a simulator/Expo Go, confirm: `(public)` index screen loads by default, login as traveler redirects to the traveler tabs, login as host redirects to the host tabs showing the listings screen (mocked fetch will error against a real API since none exists yet — that is expected, the error state in `ListingsScreen` should render instead of crashing).
