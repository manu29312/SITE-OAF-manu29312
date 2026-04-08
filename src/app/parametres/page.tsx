import Link from 'next/link';
import { SettingsPanel } from '@/features/settings/SettingsPanel';
import { ensureAppUser, requireClerkUserId } from '@/lib/auth-user';
import { buildMainNavigation } from '@/lib/main-navigation';

export default async function ParametresPage() {
  const clerkUserId = await requireClerkUserId();
  await ensureAppUser(clerkUserId);

  return (
    <main className="app-shell">
      <section className="dashboard-topbar panel">
        <div className="dashboard-brand">
          <span className="brand-dot" aria-hidden="true" />
          <h1>OAF Admin</h1>
        </div>
        <Link className="header-cta" href="/dashboard">Retour dashboard</Link>
      </section>

      <nav className="dashboard-tabs panel" aria-label="Navigation principale">
        {buildMainNavigation('parametres').map((item) => (
          <Link key={item.href} href={item.href} className={`dashboard-tab ${item.active ? 'active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="content-column">
        <section className="panel settings-hero">
          <h2>Parametres du site</h2>
          <p className="panel-meta">
            Configure ton entreprise, les regles de facturation, les relances et les notifications depuis un seul ecran.
          </p>
        </section>

        <SettingsPanel />
      </div>
    </main>
  );
}
