# Guide complet - connecter Supabase a SITE OAF

## 1) Ce qui est deja en place dans le projet

- Prisma est configure pour PostgreSQL.
- Le client Prisma est initialise dans src/lib/prisma.ts.
- Un script de verification DB existe: scripts/check-db.ts.
- Un fallback memoire existe quand la DB n est pas joignable.
- Les routes API clients/contrats/factures sont deja branchees sur la couche data.
- Des scripts utilitaires existent dans package.json:
  - check:db
  - prisma:generate
  - prisma:migrate
  - prisma:seed

## 2) Variables .env a renseigner (obligatoires)

Tu dois avoir ces variables:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DIRECT_URL
LOCAL_DEV_AUTH

### Format attendu

- NEXT_PUBLIC_SUPABASE_URL:
  https://<project-ref>.supabase.co

- NEXT_PUBLIC_SUPABASE_ANON_KEY:
  cle publique anon depuis Supabase > Project Settings > API

- SUPABASE_SERVICE_ROLE_KEY:
  cle service_role depuis Supabase > Project Settings > API
  (serveur uniquement, ne jamais exposer cote client)

- DATABASE_URL (runtime Prisma via pooler):
  postgresql://postgres.<project-ref>:<DB_PASSWORD>@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

- DIRECT_URL (migrations Prisma en direct):
  postgresql://postgres:<DB_PASSWORD>@db.<project-ref>.supabase.co:5432/postgres

Important:
- Le pooler utilise en general l utilisateur postgres.<project-ref>.
- La connexion directe utilise en general l utilisateur postgres.
- Le plus fiable est de copier-coller mot pour mot les deux URLs depuis Supabase > Project Settings > Database > Connection string.

- LOCAL_DEV_AUTH:
  true en local, false en prod

## 3) Ordre exact des commandes a executer

Depuis la racine du projet:

1. npm.cmd install
2. npm.cmd run prisma:generate
3. npm.cmd run check:db
4. npx prisma migrate status

Si la base est neuve et doit recevoir les migrations du repo:

5. npx prisma migrate deploy

Optionnel si tu veux des donnees de demo:

6. npm.cmd run prisma:seed

Puis lancer l app:

7. npm.cmd run dev

## 4) Tests rapides apres connexion

- Ouvrir dashboard, clients, contrats, factures.
- Creer un client.
- Creer un contrat.
- Creer une facture.
- Rafraichir la page et verifier que les donnees restent.
- Relancer serveur et reverifier la persistance.

Verification technique utile:

- npm.cmd run test:validators
- npm.cmd run test:api

Note: test:api est prevu pour LOCAL_DEV_AUTH=true en local.

## 5) Checkpoints de securite importants

- Ne jamais commit .env.
- Si une cle a ete exposee (chat/screenshot/repo), la regenerer dans Supabase.
- Garder service_role uniquement cote serveur.
- En production, LOCAL_DEV_AUTH doit etre false.

## 6) Ce que je te demande de faire pour m aider

1. Me confirmer la sortie de:
   - npm.cmd run check:db
   - npx prisma migrate status

2. Me dire si tu veux migration safe (deploy) ou migration dev (migrate dev).

3. Me dire si tu veux activer un seed initial pour tester vite.

Avec ces 3 infos, je peux te guider jusqu a la validation finale sans blocage.

## 7) Probleme potentiel detecte a verifier

Dans ton .env actuel, la valeur NEXT_PUBLIC_SUPABASE_ANON_KEY semble mal formee (debut/fin incoherents).

Action:
- Reprendre exactement la valeur anon key depuis Supabase > Settings > API.
- Verifier qu il n y a pas de caractere en trop au debut/fin.

## 8) Decision table rapide

- check:db KO avec erreur placeholder:
  Les URLs contiennent encore YOUR_DB_PASSWORD ou YOUR_PROJECT_REF.

- check:db KO avec auth failed:
  Mot de passe DB incorrect, reinitialiser dans Supabase.

- check:db KO avec tenant/user not found:
  Username de connexion incorrect pour ce host (souvent postgres.<project-ref> mis sur DIRECT_URL au lieu de postgres).

- check:db OK mais app vide:
  lancer migrate deploy puis seed optionnel.

- creation OK mais perte apres refresh:
  fallback memoire actif, verifier logs et connectivite DB.
