import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <SignUp afterSignUpUrl="/dashboard" afterSignInUrl="/dashboard" />
    </main>
  );
}
