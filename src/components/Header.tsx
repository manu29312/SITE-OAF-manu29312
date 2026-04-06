type HeaderProps = {
  title: string;
  subtitle: string;
};

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="app-header panel">
      <div>
        <p className="eyebrow">SITE-OAF</p>
        <h1>{title}</h1>
        <p className="hero-copy">{subtitle}</p>
      </div>

      <button className="header-cta" type="button">
        Nouvelle facture
      </button>
    </header>
  );
}
