import Link from 'next/link';
import { SettingsPanel } from '@/features/settings/SettingsPanel';
import { ensureAppUser, requireClerkUserIdOrRedirect } from '@/lib/auth-user';
import { buildMainNavigation } from '@/lib/main-navigation';

export default async function ParametresPage() {
  const clerkUserId = await requireClerkUserIdOrRedirect();
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
        <section className="panel settings-hero page-context-panel">
          <div className="panel-head-inline">
            <h2>Parametres du site</h2>
            <span className="status-chip">Configuration globale</span>
          </div>
          <p className="panel-meta">
            Configure ton entreprise, les regles de facturation, les relances et les notifications depuis un seul ecran.
          </p>
          <div className="context-pills">
            <span className="context-pill">Profil legal</span>
            <span className="context-pill">Facturation</span>
            <span className="context-pill">Rappels auto</span>
          </div>
        </section>

        <SettingsPanel />
      </div>
    </main>
  );
}
