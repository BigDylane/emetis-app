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

## Commandes utiles

- `npm run lint` — vérifie le code avec ESLint
- `npm run format` — formate avec Prettier
- `npx tsc --noEmit` — vérifie les types TypeScript
- `npm test` — lance les tests Jest
