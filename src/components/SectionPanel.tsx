import type { ReactNode } from 'react';

type SectionPanelProps = {
  title: string;
  children: ReactNode;
  tone?: 'default' | 'highlight';
};

export function SectionPanel({ title, children, tone = 'default' }: SectionPanelProps) {
  return (
    <section className={`panel ${tone === 'highlight' ? 'highlight' : ''}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
