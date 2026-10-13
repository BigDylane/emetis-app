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

Source: [expo/fyi wsl.md](https://github.com/expo/fyi/blob/main/wsl.md). Si Expo Go reste
bloqué sur le chargement ou affiche `something went wrong` / `Failed to download remote
update`, c'est un souci réseau WSL2 ↔ téléphone, pas un bug de l'app.

1. **Projet sur le filesystem Linux** — `pwd` ne doit pas commencer par `/mnt`.

2. **Réseau mirrored** — dans `%USERPROFILE%\.wslconfig`:

   ```ini
   [wsl2]
   networkingMode=mirrored

   [experimental]
   hostAddressLoopback=true
   ```

   Mettre WSL à jour (`wsl --update`), puis `wsl --shutdown` et rouvrir un terminal.

3. **Firewall Hyper-V** (PowerShell admin). En mode mirrored, le trafic entrant est
   filtré par le firewall Hyper-V, pas par les règles Windows classiques:

   ```powershell
   Set-NetFirewallHyperVVMSetting -Name '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -DefaultInboundAction Allow
   ```

4. **Vérifier** — `npm start`: l'IP du QR / `exp://` doit être celle de `ipconfig`
   (ex. `192.168.x.x`). Si `172.x`, mirrored n'est pas actif (WSL a une IP interne
   injoignable depuis le téléphone).

5. Téléphone et PC sur le **même wifi** (pas de réseau invité, pas de 4G). Expo Go doit
   supporter la version du SDK du projet.

**Fallback tunnel** (marche sans rien configurer, plus lent): `npx expo start --tunnel`.
Si le tunnel échoue, installer ngrok en **local** (`npm install --save-dev @expo/ngrok`,
pas en global: échoue souvent sous WSL).

## Commandes utiles

- `npm run lint` — vérifie le code avec ESLint
- `npm run format` — formate avec Prettier
- `npx tsc --noEmit` — vérifie les types TypeScript
- `npm test` — lance les tests Jest
