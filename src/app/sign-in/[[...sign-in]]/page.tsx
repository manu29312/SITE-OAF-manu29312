import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <SignIn afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </main>
  );
}
