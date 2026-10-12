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
```

Renseigner `.env` avec l'URL de l'API (`EXPO_PUBLIC_API_BASE_URL`).

## Lancer l'app

```bash
npm start       # Metro bundler, scanner le QR avec Expo Go
npm run ios     # simulateur iOS
npm run android # émulateur Android
```

## Dev sous WSL (Windows)

Si le projet tourne dans WSL (chemin `\\wsl.localhost\...`) et qu'Expo Go sur le
téléphone affiche `something went wrong` / `Failed to download remote update`, c'est
quasi toujours un souci réseau WSL2 ↔ téléphone, pas un bug de l'app:

1. **Activer le réseau mirrored WSL** — dans `%USERPROFILE%\.wslconfig`:

   ```ini
   [wsl2]
   networkingMode=mirrored
   ```

   Puis `wsl --shutdown` et relancer un terminal. Sans ça, WSL a sa propre IP interne
   injoignable depuis le téléphone.

2. **Autoriser le port dans le firewall Windows** (PowerShell admin):

   ```powershell
   New-NetFirewallRule -DisplayName "Expo Metro Dev Server" -Direction Inbound -LocalPort 8081,19000-19006 -Protocol TCP -Action Allow -Profile Any
   ```

   `-Profile Any` est nécessaire si Windows classe ton wifi en "Public" (vérifier avec
   `Get-NetConnectionProfile`) — une règle limitée à "Private" ne suffira pas dans ce cas.

3. Téléphone et PC doivent être sur le **même réseau wifi**.

Si malgré ça `npm start` ne marche pas, `npx expo start --tunnel` est un fallback, mais
nécessite `@expo/ngrok` installé en **local** (`npm install --save-dev @expo/ngrok`,
pas en global — l'install globale échoue souvent sous WSL sans droits suffisants) et un
compte ngrok (le tunnel anonyme est instable).

## Commandes utiles

- `npm run lint` — vérifie le code avec ESLint
- `npm run format` — formate avec Prettier
- `npx tsc --noEmit` — vérifie les types TypeScript
- `npm test` — lance les tests Jest
