# SITE-OAF-manu29312

Base Next.js (App Router + TypeScript) pour la migration progressive du prototype SITE-OAF.

## Demarrage

1. Installer les dependances:

```bash
npm install
```

2. Creer les variables locales a partir du modele:

```bash
cp .env.example .env.local
```

3. Lancer en developpement:

```bash
npm run dev
```

## Build et verification

```bash
npm run lint
npm run build
```

## Structure

- `src/app` : pages, layout et routes API.
- `src/components` : composants UI reutilisables.
- `src/features` : logique d ecran par domaine metier.
- `src/lib` : utilitaires, validation, formatage et mock DB.
- `src/types` : types metier TypeScript.
- `legacy-static` : ancien front statique conserve en reference.

## Preparer le premier push Next.js

1. Verifier `npm run lint` et `npm run build`.
2. Verifier que les variables locales sont bien configurees via `.env.local`.
3. Commiter les changements de migration Point 4.
4. Pousser sur la branche cible.