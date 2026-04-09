import Link from 'next/link';
import { Show, SignInButton, SignUpButton } from '@clerk/nextjs';
import { buildMainNavigation } from '@/lib/main-navigation';
import { homePageContent } from '@/lib/homepage-content';

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="dashboard-topbar panel">
        <div className="dashboard-brand">
          <span className="brand-dot" aria-hidden="true" />
          <h1>OAF Admin</h1>
        </div>
        <Show when="signed-in">
          <Link className="header-cta" href="/dashboard">Vue dashboard detaillee</Link>
        </Show>
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
            <Show when="signed-out">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button type="button" className="header-cta solid">Se connecter</button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button type="button" className="header-cta">Creer un compte</button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <p className="panel-meta">Connecte: tu peux modifier cette page et ajouter tes propres sections.</p>
            </Show>
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
          <div className="panel-head-inline">
            <h2>Actions rapides</h2>
            <span className="status-chip">Personnalisable</span>
          </div>
          <div className="panel-actions split" style={{ flexWrap: 'wrap' }}>
            {homePageContent.quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="header-cta solid">
                {action.label}
              </Link>
            ))}
          </div>
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
