'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { buildMainNavigation } from '@/lib/main-navigation';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Client } from '@/types/client';
import type { Invoice } from '@/types/invoice';

type ContractsWorkspaceProps = {
  clients: Client[];
  invoices: Invoice[];
};

type ContractLeadMode = 'all' | 'paid' | 'pending' | 'both';

type ClientContractInsight = {
  client: Client;
  invoices: Invoice[];
  paidCount: number;
  pendingCount: number;
  monthlyAmount: number;
  latestInvoiceDate: string | null;
};

const MONTH_OPTIONS = [
  { value: 'all', label: 'Tous les mois' },
  { value: '0', label: 'Janvier' },
  { value: '1', label: 'Fevrier' },
  { value: '2', label: 'Mars' },
  { value: '3', label: 'Avril' },
  { value: '4', label: 'Mai' },
  { value: '5', label: 'Juin' },
  { value: '6', label: 'Juillet' },
  { value: '7', label: 'Aout' },
  { value: '8', label: 'Septembre' },
  { value: '9', label: 'Octobre' },
  { value: '10', label: 'Novembre' },
  { value: '11', label: 'Decembre' },
];

function matchesLeadMode(insight: ClientContractInsight, mode: ContractLeadMode): boolean {
  if (mode === 'paid') {
    return insight.paidCount > 0;
  }

  if (mode === 'pending') {
    return insight.pendingCount > 0;
  }

  if (mode === 'both') {
    return insight.paidCount > 0 && insight.pendingCount > 0;
  }

  return insight.paidCount > 0 || insight.pendingCount > 0;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function ContractsWorkspace({ clients, invoices }: ContractsWorkspaceProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [leadMode, setLeadMode] = useState<ContractLeadMode>('all');

  const eligibleInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.status === 'payee' || invoice.status === 'envoyee'),
    [invoices],
  );

  const monthFilteredInvoices = useMemo(() => {
    if (selectedMonth === 'all') {
      return eligibleInvoices;
    }

    const month = Number(selectedMonth);
    return eligibleInvoices.filter((invoice) => {
      const date = new Date(invoice.dueDate);
      return !Number.isNaN(date.getTime()) && date.getMonth() === month;
    });
  }, [eligibleInvoices, selectedMonth]);

  const clientInsights = useMemo(() => {
    const invoicesByClient = new Map<string, Invoice[]>();

    for (const invoice of monthFilteredInvoices) {
      const list = invoicesByClient.get(invoice.clientId) ?? [];
      list.push(invoice);
      invoicesByClient.set(invoice.clientId, list);
    }

    const rows: ClientContractInsight[] = [];

    for (const client of clients) {
      const clientInvoices = invoicesByClient.get(client.id) ?? [];
      if (!clientInvoices.length) {
        continue;
      }

      const paidCount = clientInvoices.filter((invoice) => invoice.status === 'payee').length;
      const pendingCount = clientInvoices.filter((invoice) => invoice.status === 'envoyee').length;
      const latestInvoice = [...clientInvoices].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];
      const monthlyAmount = clientInvoices.reduce((sum, invoice) => sum + invoice.amountTtc, 0);

      rows.push({
        client,
        invoices: clientInvoices,
        paidCount,
        pendingCount,
        monthlyAmount,
        latestInvoiceDate: latestInvoice?.dueDate ?? null,
      });
    }

    rows.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
    return rows;
  }, [clients, monthFilteredInvoices]);

  const filteredInsights = useMemo(() => {
    const normalizedSearch = normalize(searchText);

    return clientInsights.filter((insight) => {
      if (!matchesLeadMode(insight, leadMode)) {
        return false;
      }

      if (selectedClientId !== 'all' && insight.client.id !== selectedClientId) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = `${insight.client.name} ${insight.client.company} ${insight.client.email}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [clientInsights, leadMode, searchText, selectedClientId]);

  const summary = useMemo(() => {
    const totalClients = filteredInsights.length;
    const totalPaid = filteredInsights.reduce((sum, item) => sum + item.paidCount, 0);
    const totalPending = filteredInsights.reduce((sum, item) => sum + item.pendingCount, 0);
    const totalAmount = filteredInsights.reduce((sum, item) => sum + item.monthlyAmount, 0);

    return { totalClients, totalPaid, totalPending, totalAmount };
  }, [filteredInsights]);

  return (
    <main className="app-shell">
      <section className="dashboard-topbar panel">
        <div className="dashboard-brand">
          <span className="brand-dot" aria-hidden="true" />
          <h1>OAF Admin</h1>
        </div>
        <Link className="header-cta" href="/factures">Aller vers factures</Link>
      </section>

      <nav className="dashboard-tabs panel" aria-label="Navigation principale">
        {buildMainNavigation('contrats').map((item) => (
          <Link key={item.href} href={item.href} className={`dashboard-tab ${item.active ? 'active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="content-column">
        <section className="panel page-context-panel contracts-search-panel">
          <div className="panel-head-inline">
            <h2>Apercu clients a contractualiser</h2>
            <p className="panel-meta">Recherche par client et factures en delai/achetees.</p>
          </div>

          <div className="contracts-filter-grid">
            <label>
              Rechercher un client
              <input
                type="search"
                placeholder="Nom, societe, email"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </label>

            <label>
              Filtrer par mois
              <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                {MONTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              Filtrer par client
              <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)}>
                <option value="all">Tous les clients</option>
                {clientInsights.map((insight) => (
                  <option key={insight.client.id} value={insight.client.id}>{insight.client.company}</option>
                ))}
              </select>
            </label>

            <label>
              Type de suivi
              <select value={leadMode} onChange={(event) => setLeadMode(event.target.value as ContractLeadMode)}>
                <option value="all">A deja achete OU en delai</option>
                <option value="paid">A deja achete</option>
                <option value="pending">En delai de paiement</option>
                <option value="both">Les deux</option>
              </select>
            </label>
          </div>

          <div className="context-pills">
            <span className="context-pill">Clients: {summary.totalClients}</span>
            <span className="context-pill">Factures payees: {summary.totalPaid}</span>
            <span className="context-pill">Factures en delai: {summary.totalPending}</span>
            <span className="context-pill">Montant filtre: {formatCurrency(summary.totalAmount)}</span>
          </div>
        </section>

        <section className="panel invoice-table-panel">
          <div className="panel-head-inline">
            <h2>Resultats</h2>
            <p className="panel-meta">{filteredInsights.length} client(s)</p>
          </div>

          <div className="table-wrap">
            <table className="data-table invoice-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Derniere facture</th>
                  <th>Statut factures</th>
                  <th>Montant du filtre</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInsights.length ? (
                  filteredInsights.map((insight) => (
                    <tr key={insight.client.id}>
                      <td>{insight.client.company}</td>
                      <td>{insight.client.email}</td>
                      <td>{insight.latestInvoiceDate ? formatDate(insight.latestInvoiceDate) : '-'}</td>
                      <td>
                        payees: {insight.paidCount} | en delai: {insight.pendingCount}
                      </td>
                      <td>{formatCurrency(insight.monthlyAmount)}</td>
                      <td>
                        <Link className="header-cta" href={`/factures?clientId=${insight.client.id}`}>
                          Voir factures client
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="table-empty">Aucun client correspondant aux filtres.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
