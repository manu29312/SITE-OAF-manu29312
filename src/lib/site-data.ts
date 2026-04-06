export const frameworkStack = [
  {
    title: 'Next.js',
    description: 'Routes, layouts, server actions et API dans un seul framework.',
  },
  {
    title: 'TypeScript',
    description: 'Moins d erreurs, meilleure lisibilite et refactor plus simple.',
  },
  {
    title: 'Tailwind ou CSS modules',
    description: 'Systeme de design coherent, rapide a maintenir.',
  },
  {
    title: 'Prisma + Postgres',
    description: 'Donnees structurees et modele fiable pour clients, factures et contrats.',
  },
];

export const migrationSteps = [
  'Creer l arborescence Next.js avec App Router.',
  'Decouper les ecrans en composants reutilisables.',
  'Deplacer les donnees statiques vers des modules TypeScript.',
  'Reconnecter progressivement les formulaires, listes et calculs.',
  'Ajouter les routes API et la base de donnees.',
  'Supprimer le front statique une fois la migration verifiee.',
];

export const legacyToNextMap = [
  { legacy: 'index.html', next: 'src/app/page.tsx + src/app/layout.tsx' },
  { legacy: 'styles.css', next: 'src/app/globals.css' },
  { legacy: 'app.js', next: 'src/features/* + src/lib/*' },
  { legacy: 'MVP_APP_WEB_TACHES.md', next: 'src/lib/site-data.ts ou docs' },
];

export const projectGoals = [
  'Un seul repo pour le front et le backend.',
  'Une structure claire par domaine fonctionnel.',
  'Des composants reutilisables pour gagner du temps.',
  'Une base propre pour ajouter factures, contrats et rappels.',
];
