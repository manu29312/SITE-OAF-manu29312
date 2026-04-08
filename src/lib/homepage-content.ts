export const homePageContent = {
  hero: {
    title: 'Accueil OAF Admin',
    subtitle:
      'Page d accueil configurable pour centraliser les modules, les actions rapides et les priorites du moment.',
  },
  quickActions: [
    { label: 'Nouveau client', href: '/clients' },
    { label: 'Nouvelle facture', href: '/factures' },
    { label: 'Nouveau contrat', href: '/contrats' },
    { label: 'Ouvrir les parametres', href: '/parametres' },
  ],
  highlightCards: [
    {
      label: 'Priorite',
      value: 'Relances facture',
      detail: 'Verifier les factures en retard et lancer les rappels manuels si besoin.',
    },
    {
      label: 'Objectif semaine',
      value: 'Signer 2 contrats',
      detail: 'Suivre les statuts de contrats et relancer les prospects en attente.',
    },
    {
      label: 'Qualite de service',
      value: 'Inbox support a zero',
      detail: 'Traiter les demandes clients et mettre a jour le suivi dans les modules.',
    },
  ],
  recentNotes: [
    'Ajouter un bloc KPI specifique au suivi commercial.',
    'Connecter les parametres de facturation a la base de donnees.',
    'Creer une section aide interne pour les procedures recurrentes.',
  ],
};
