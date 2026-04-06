type InfoCardProps = {
  title: string;
  description: string;
  tone?: 'accent' | 'neutral';
};

export function InfoCard({ title, description, tone = 'neutral' }: InfoCardProps) {
  return (
    <article className={`info-card ${tone}`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
