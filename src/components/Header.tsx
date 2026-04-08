type HeaderProps = {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

export function Header({ title, subtitle, ctaLabel = 'Nouvelle facture', onCtaClick }: HeaderProps) {
  return (
    <header className="app-header panel">
      <div>
        <p className="eyebrow">SITE-OAF</p>
        <h1>{title}</h1>
        <p className="hero-copy">{subtitle}</p>
      </div>

      <button className="header-cta" type="button" onClick={onCtaClick}>
        {ctaLabel}
      </button>
    </header>
  );
}
