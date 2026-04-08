import Link from 'next/link';
import { Show, SignInButton, SignUpButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <main className="app-shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <section className="panel" style={{ maxWidth: 720 }}>
        <h1>SITE OAF Admin</h1>
        <p className="panel-meta">
          Authentification Clerk et base Prisma sont maintenant en place pour demarrer le MVP sur des fondations solides.
        </p>
        <div className="panel-actions" style={{ marginTop: 16 }}>
          <Show when="signed-out">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button type="button" className="header-cta">Se connecter</button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button type="button" className="header-cta">Creer un compte</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="header-cta">Acceder au dashboard</Link>
          </Show>
        </div>
      </section>
    </main>
  );
}
