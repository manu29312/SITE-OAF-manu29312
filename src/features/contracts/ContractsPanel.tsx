import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Contract } from '@/types/contract';

type ContractsPanelProps = {
  contracts: Contract[];
};

function getContractTone(status: Contract['status']): 'ok' | 'warn' | 'danger' {
  if (status === 'actif') {
    return 'ok';
  }

  if (status === 'a_renouveler') {
    return 'warn';
  }

  return 'danger';
}

export function ContractsPanel({ contracts }: ContractsPanelProps) {
  return (
    <section className="panel">
      <h2>Contrats</h2>
      <p className="panel-meta">Suivi des contrats, echeances et montants.</p>
      <DataTable
        columns={[
          { key: 'title', label: 'Contrat' },
          { key: 'period', label: 'Periode' },
          { key: 'amount', label: 'Montant' },
          { key: 'status', label: 'Statut' },
        ]}
        rows={contracts.map((contract) => ({
          title: contract.title,
          period: `${formatDate(contract.startDate)} -> ${formatDate(contract.endDate)}`,
          amount: formatCurrency(contract.amount),
          status: (
            <StatusBadge
              label={contract.status}
              tone={getContractTone(contract.status)}
            />
          ),
        }))}
      />
    </section>
  );
}
