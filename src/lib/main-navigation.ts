type MainNavigationKey = 'dashboard' | 'clients' | 'factures' | 'contrats' | 'parametres';

type MainNavigationItem = {
  label: string;
  href: string;
  active?: boolean;
};

const NAVIGATION_ITEMS: Array<{ key: MainNavigationKey; label: string; href: string }> = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { key: 'clients', label: 'Clients', href: '/clients' },
  { key: 'factures', label: 'Factures', href: '/factures' },
  { key: 'contrats', label: 'Contrats', href: '/contrats' },
  { key: 'parametres', label: 'Parametres', href: '/parametres' },
];

export function buildMainNavigation(activeKey: MainNavigationKey): MainNavigationItem[] {
  return NAVIGATION_ITEMS.map((item) => ({
    label: item.label,
    href: item.href,
    active: item.key === activeKey,
  }));
}
