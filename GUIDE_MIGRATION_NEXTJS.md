# Guide de migration vers Next.js

Ce document sert de plan de transition pour passer du prototype statique actuel vers une base Next.js propre.

## Objectif

- Garder le prototype comme reference visuelle
- Migrer la structure vers App Router
- Ranger le code par domaine fonctionnel
- Eviter de tout re-ecrire d un coup

## Suivi de migration

### Point 1 - Base Next.js
- [x] Creer la base Next.js avec App Router
- [x] Ajouter les fichiers de configuration de depart
- [x] Poser le layout global et la page d accueil
- [x] Ranger les donnees de demo dans des modules TypeScript
- [x] Installer les dependances Next.js en local
- [x] Lancer l app et verifier le rendu dans le navigateur

### Etat du point 1
- [x] Squelette Next.js cree dans le projet
- [x] Structure de base rangee et documentee
- [x] Installation des dependances terminee
- [x] Lancement local valide sur http://localhost:3000

### Point 2 - Migration visuelle
- [x] Decouper le header en composant reutilisable
- [x] Decouper les cartes et blocs d information
- [x] Reprendre la mise en page mobile et desktop
- [x] Reconnecter les styles globaux au nouveau layout

### Point 3 - Migration metier
- [x] Migrer la liste clients
- [x] Migrer la creation de facture
- [x] Migrer les contrats
- [x] Ajouter les routes API de base

### Point 4 - Nettoyage final
- [x] Supprimer les doublons entre ancien front et Next.js
- [x] Verifier les imports et alias `@/*`
- [x] Ajouter les variables d environnement finales
- [x] Preparer le premier push de la version Next.js

## Structure cible recommandee

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    InfoCard.tsx
    Header.tsx
    Sidebar.tsx
    DataTable.tsx
    StatusBadge.tsx
  features/
    clients/
    invoices/
    contracts/
    settings/
  lib/
    site-data.ts
    formatters.ts
    validators.ts
  types/
    invoice.ts
    client.ts
    contract.ts
```

## Correspondance entre l ancien projet et Next.js

- `legacy-static/index.html` -> `src/app/page.tsx` et `src/app/layout.tsx`
- `legacy-static/styles.css` -> `src/app/globals.css`
- `legacy-static/app.js` -> decoupage vers `src/features/*` et `src/lib/*`
- fichiers de suivi -> `src/lib/site-data.ts` ou dossier `/docs`

## Variables d environnement retenues

- `NEXT_PUBLIC_APP_NAME` : nom affiche dans le front.
- `NEXT_PUBLIC_APP_URL` : URL publique de l application.
- `NEXT_PUBLIC_API_BASE_URL` : URL de base des routes API.
- `DATABASE_URL` : connexion base de donnees pour la future persistance.

Le modele est versionne dans `.env.example`.

## Ordre de migration conseille

1. Créer la base Next.js et valider le rendu principal.
2. Déplacer les éléments visuels dans des composants reutilisables.
3. Isoler les donnees de demo dans `src/lib/site-data.ts`.
4. Reprendre la navigation et les sections une par une.
5. Connecter les vraies donnees et les routes API.
6. Supprimer le front statique quand tout est verifie.

## Statut actuel

- Etape 1: terminee et validee localement.
- Etape 2: terminee.
- Etape 3: terminee.
- Etape 4: terminee et prete pour pre-push Next.js.

## Regles pour garder un projet propre

- Un composant = un seul role
- Les donnees de demo ne restent pas dans les composants si elles grossissent
- La logique metier va dans `src/lib` ou `src/features`
- Les pages restent fines et servent surtout de composition
- Les styles globaux restent limites au layout commun

## Fichiers a ne pas migrer en premier

- Les docs de travail
- Les notes de tache
- Les anciens prototypes tant que la nouvelle base n est pas verifiee

## Checklist avant de brancher le backend

- Le layout s affiche bien sur mobile et desktop
- Les composants sont reutilisables
- Les imports sont propres avec `@/*`
- Les variables d environnement sont pretes
- La base de donnees et l auth ne cassent pas la navigation

## Etape suivante

Quand la base Next.js est en place, la prochaine vraie brique est la migration de la liste clients et du formulaire facture vers des composants et des routes API.

## Ce qu il faut faire ensuite

1. Demarrer le point 4 (nettoyage final) pour retirer les doublons front legacy.
2. Ajouter la persistance base de donnees (ex: Prisma + PostgreSQL).
3. Brancher les formulaires sur les routes API en mutation reelle.
4. Valider les interactions cle (navigation, formulaires, statuts).
