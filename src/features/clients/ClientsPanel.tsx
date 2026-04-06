import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import type { Client } from '@/types/client';

type ClientsPanelProps = {
  clients: Client[];
};

export function ClientsPanel({ clients }: ClientsPanelProps) {
  return (
    <section className="panel">
      <h2>Liste clients</h2>
      <p className="panel-meta">Vue metier migree depuis l ancien front.</p>
      <DataTable
        columns={[
          { key: 'name', label: 'Client' },
          { key: 'company', label: 'Societe' },
          { key: 'email', label: 'Email' },
          { key: 'city', label: 'Ville' },
          { key: 'status', label: 'Statut' },
        ]}
        rows={clients.map((client) => ({
          name: client.name,
          company: client.company,
          email: client.email,
          city: client.city,
          status: (
            <StatusBadge
              label={client.status}
              tone={client.status === 'actif' ? 'ok' : 'neutral'}
            />
          ),
        }))}
      />
    </section>
  );
}
