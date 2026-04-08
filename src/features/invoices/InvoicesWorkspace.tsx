'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { buildMainNavigation } from '@/lib/main-navigation';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Client } from '@/types/client';
import type { Invoice, InvoiceStatus } from '@/types/invoice';

type InvoicesWorkspaceProps = {
  initialInvoices: Invoice[];
  clients: Client[];
};

type NewInvoiceForm = {
  clientId: string;
  dueDate: string;
  amountHt: string;
  taxRate: string;
  status: InvoiceStatus;
};

type InlineClientForm = {
  name: string;
  company: string;
  email: string;
  city: string;
};

const INITIAL_FORM: NewInvoiceForm = {
  clientId: '',
  dueDate: '',
  amountHt: '',
  taxRate: '20',
  status: 'brouillon',
};

const INITIAL_INLINE_CLIENT: InlineClientForm = {
  name: '',
  company: '',
  email: '',
  city: '',
};

function getInvoiceTone(status: Invoice['status']): 'ok' | 'warn' | 'danger' | 'neutral' {
  if (status === 'payee') return 'ok';
  if (status === 'retard') return 'danger';
  if (status === 'envoyee') return 'warn';
  return 'neutral';
}

function getInvoiceLabel(status: Invoice['status']): string {
  if (status === 'payee') return 'Payees';
  if (status === 'envoyee') return 'En attente';
  if (status === 'retard') return 'En retard';
  return 'Brouillons';
}

function formatAmountEur(amount: number): string {
  return `${amount.toFixed(2)} EUR`;
}

export function InvoicesWorkspace({ initialInvoices, clients }: InvoicesWorkspaceProps) {
  const [clientsList, setClientsList] = useState<Client[]>(clients);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewInvoiceForm>(INITIAL_FORM);
  const [isCreatingInlineClient, setIsCreatingInlineClient] = useState(false);
  const [inlineClient, setInlineClient] = useState<InlineClientForm>(INITIAL_INLINE_CLIENT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const clientById = useMemo(() => new Map(clientsList.map((client) => [client.id, client.company])), [clientsList]);

  const sortedInvoices = useMemo(
    () => [...invoices].sort((left, right) => new Date(right.dueDate).getTime() - new Date(left.dueDate).getTime()),
    [invoices],
  );

  const grouped = useMemo(
    () => ({
      payees: sortedInvoices.filter((invoice) => invoice.status === 'payee'),
      attente: sortedInvoices.filter((invoice) => invoice.status === 'envoyee'),
      retard: sortedInvoices.filter((invoice) => invoice.status === 'retard'),
      brouillons: sortedInvoices.filter((invoice) => invoice.status === 'brouillon'),
    }),
    [sortedInvoices],
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage('');
    resetInvoiceModal();
  };

  const resetInvoiceModal = () => {
    setForm(INITIAL_FORM);
    setInlineClient(INITIAL_INLINE_CLIENT);
    setIsCreatingInlineClient(false);
  };

  const handleCreateInvoice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let invoiceClientId = form.clientId;

      if (isCreatingInlineClient) {
        const createClientResponse = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: inlineClient.name,
            company: inlineClient.company,
            email: inlineClient.email,
            city: inlineClient.city || 'Non renseignee',
            status: 'actif',
          }),
        });

        const createClientPayload = await createClientResponse.json();
        if (!createClientResponse.ok || !createClientPayload?.data) {
          setErrorMessage(createClientPayload?.error ?? 'Impossible de creer la fiche client.');
          return;
        }

        const createdClient = createClientPayload.data as Client;
        setClientsList((prev) => [createdClient, ...prev]);
        invoiceClientId = createdClient.id;
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: invoiceClientId,
          dueDate: form.dueDate,
          amountHt: Number(form.amountHt),
          taxRate: Number(form.taxRate),
          status: form.status,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.data) {
        setErrorMessage(payload?.error ?? 'Impossible de creer la facture.');
        return;
      }

      setInvoices((prev) => [payload.data as Invoice, ...prev]);
      resetInvoiceModal();
      setIsModalOpen(false);
    } catch {
      setErrorMessage('Erreur reseau lors de la creation de la facture.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="app-shell">
        <section className="dashboard-topbar panel">
          <div className="dashboard-brand">
            <span className="brand-dot" aria-hidden="true" />
            <h1>OAF Admin</h1>
          </div>
          <button className="header-cta" type="button">Nouveau document</button>
        </section>

        <nav className="dashboard-tabs panel" aria-label="Navigation principale">
          {buildMainNavigation('factures').map((item) => (
            <Link key={item.href} href={item.href} className={`dashboard-tab ${item.active ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="content-column">
          <section className="panel invoice-toolbar-panel">
            <div className="invoice-toolbar-head">
              <h2>Factures</h2>
              <div className="invoice-toolbar-actions">
                <button type="button" className="invoice-ghost-btn">Ouvrir brouillon rapide</button>
                <select aria-label="Filtrer les statuts">
                  <option>Tous les statuts</option>
                </select>
                <button type="button" className="header-cta solid" onClick={() => setIsModalOpen(true)}>
                  Nouvelle facture
                </button>
              </div>
            </div>
          </section>

          <section className="panel invoice-status-panel">
            <h2>Suivi des statuts facture</h2>

          <article className="invoice-status-card">
            <p className="invoice-status-label ok">Payees ({grouped.payees.length})</p>
            {grouped.payees.length ? (
              <ul className="list">
                {grouped.payees.map((invoice) => (
                  <li key={invoice.id}>
                    {(clientById.get(invoice.clientId) ?? 'Entreprise inconnue')} - {invoice.number} - {formatAmountEur(invoice.amountTtc)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel-meta">Aucune facture</p>
            )}
          </article>

          <article className="invoice-status-card">
            <p className="invoice-status-label warn">En attente ({grouped.attente.length})</p>
            {grouped.attente.length ? (
              <ul className="list">
                {grouped.attente.map((invoice) => (
                  <li key={invoice.id}>
                    {(clientById.get(invoice.clientId) ?? 'Entreprise inconnue')} - {invoice.number} - {formatAmountEur(invoice.amountTtc)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel-meta">Aucune facture</p>
            )}
          </article>

          <article className="invoice-status-card">
            <p className="invoice-status-label danger">En retard ({grouped.retard.length})</p>
            {grouped.retard.length ? (
              <ul className="list">
                {grouped.retard.map((invoice) => (
                  <li key={invoice.id}>
                    {(clientById.get(invoice.clientId) ?? 'Entreprise inconnue')} - {invoice.number} - {formatAmountEur(invoice.amountTtc)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel-meta">Aucune facture</p>
            )}
          </article>

          <article className="invoice-status-card">
            <p className="invoice-status-label neutral">Brouillons ({grouped.brouillons.length})</p>
            {grouped.brouillons.length ? (
              <ul className="list">
                {grouped.brouillons.map((invoice) => (
                  <li key={invoice.id}>
                    {(clientById.get(invoice.clientId) ?? 'Entreprise inconnue')} - {invoice.number} - {formatAmountEur(invoice.amountTtc)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel-meta">Aucune facture</p>
            )}
            </article>
          </section>

          <section className="panel invoice-table-panel">
            <div className="panel-head-inline">
              <h2>Liste des factures</h2>
              <p className="panel-meta">{sortedInvoices.length} facture(s) affichee(s)</p>
            </div>

            <div className="table-wrap">
              <table className="data-table invoice-table">
                <thead>
                  <tr>
                    <th>Numero facture</th>
                    <th>Entreprise</th>
                    <th>Montant TTC</th>
                    <th>Date</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.number}</td>
                      <td>{clientById.get(invoice.clientId) ?? 'Entreprise inconnue'}</td>
                      <td>{formatCurrency(invoice.amountTtc)}</td>
                      <td>{formatDate(invoice.dueDate)}</td>
                      <td>
                        <StatusBadge label={getInvoiceLabel(invoice.status)} tone={getInvoiceTone(invoice.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {isModalOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Nouvelle facture">
          <section className="panel modal-card">
            <div className="panel-head-inline">
              <h2>Nouvelle facture</h2>
              <button type="button" className="invoice-ghost-btn" onClick={closeModal}>Fermer</button>
            </div>

            <p className="panel-meta">Le numero de facture est attribue automatiquement a la creation.</p>

            <form className="modal-form-grid" onSubmit={handleCreateInvoice}>
              <label>
                Client
                <select
                  value={form.clientId}
                  onChange={(event) => setForm((prev) => ({ ...prev, clientId: event.target.value }))}
                  required={!isCreatingInlineClient}
                >
                  <option value="">Selectionner un client</option>
                  {clientsList.map((client) => (
                    <option key={client.id} value={client.id}>{client.company}</option>
                  ))}
                </select>
              </label>

              <label className="modal-full-width switch-row">
                <input
                  type="checkbox"
                  checked={isCreatingInlineClient}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setIsCreatingInlineClient(checked);
                    setErrorMessage('');
                    if (checked) {
                      setForm((prev) => ({ ...prev, clientId: '' }));
                    } else {
                      setInlineClient(INITIAL_INLINE_CLIENT);
                    }
                  }}
                />
                <span>Client non liste ? Creer une fiche client automatiquement.</span>
              </label>

              {isCreatingInlineClient ? (
                <>
                  <label>
                    Nom / Prenom
                    <input
                      value={inlineClient.name}
                      onChange={(event) => setInlineClient((prev) => ({ ...prev, name: event.target.value }))}
                      required={isCreatingInlineClient}
                    />
                  </label>

                  <label>
                    Entreprise
                    <input
                      value={inlineClient.company}
                      onChange={(event) => setInlineClient((prev) => ({ ...prev, company: event.target.value }))}
                      required={isCreatingInlineClient}
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={inlineClient.email}
                      onChange={(event) => setInlineClient((prev) => ({ ...prev, email: event.target.value }))}
                      required={isCreatingInlineClient}
                    />
                  </label>

                  <label>
                    Ville / Adresse
                    <input
                      value={inlineClient.city}
                      onChange={(event) => setInlineClient((prev) => ({ ...prev, city: event.target.value }))}
                    />
                  </label>
                </>
              ) : null}

              <label>
                Date echeance
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  required
                />
              </label>

              <label>
                Montant HT
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amountHt}
                  onChange={(event) => setForm((prev) => ({ ...prev, amountHt: event.target.value }))}
                  required
                />
              </label>

              <label>
                TVA (%)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.taxRate}
                  onChange={(event) => setForm((prev) => ({ ...prev, taxRate: event.target.value }))}
                  required
                />
              </label>

              <label className="modal-full-width">
                Statut initial
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as InvoiceStatus }))}
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="envoyee">Envoyee</option>
                  <option value="payee">Payee</option>
                  <option value="retard">Retard</option>
                </select>
              </label>

              {errorMessage ? <p className="panel-meta modal-full-width">{errorMessage}</p> : null}

              <div className="panel-actions split modal-full-width">
                <button type="button" className="invoice-ghost-btn" onClick={closeModal}>Annuler</button>
                <button type="submit" className="header-cta solid" disabled={isSubmitting}>
                  {isSubmitting ? 'Creation...' : 'Creer la facture'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
