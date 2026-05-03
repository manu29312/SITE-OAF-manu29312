import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildMainNavigation } from '@/lib/main-navigation';
import { homePageContent } from '@/lib/homepage-content';
import { isLocalDevAuthEnabled, requireAuthUserId } from '@/lib/auth-user';

export default async function HomePage() {
  const authUserId = await requireAuthUserId().catch((error: unknown) => {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return null;
    }

    throw error;
  });

  if (authUserId) {
    redirect('/dashboard');
  }

  const localAuthEnabled = isLocalDevAuthEnabled();

  return (
    <main className="app-shell">
      <section className="dashboard-topbar panel">
        <div className="dashboard-brand">
          <span className="brand-dot" aria-hidden="true" />
          <h1>OAF Admin</h1>
        </div>
        <Link className="header-cta" href="/dashboard">Vue dashboard detaillee</Link>
      </section>

      <nav className="dashboard-tabs panel" aria-label="Navigation principale">
        {buildMainNavigation('dashboard').map((item) => (
          <Link key={item.href} href={item.href} className="dashboard-tab">
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="content-column">
        <section className="panel dashboard-hero">
          <h2>{homePageContent.hero.title}</h2>
          <p className="panel-meta">{homePageContent.hero.subtitle}</p>

          <div className="panel-actions split">
            <Link className="header-cta solid" href="/dashboard">Acceder au dashboard</Link>
            <p className="panel-meta">
              {localAuthEnabled
                ? 'Mode local actif: authentification externe desactivee.'
                : 'Authentification Supabase activee.'}
            </p>
          </div>
        </section>

        <section className="dashboard-metrics">
          {homePageContent.highlightCards.map((card) => (
            <article key={card.label} className="panel metric-card">
              <p className="metric-label">{card.label}</p>
              <p className="metric-value" style={{ fontSize: '1.5rem' }}>{card.value}</p>
              <p className="panel-meta">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="panel">
          <h2>Notes d evolution</h2>
          <p className="panel-meta">
            Tu peux ajouter, retirer ou modifier ces points dans le fichier de contenu dedie.
          </p>
          <ul className="list">
            {homePageContent.recentNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
