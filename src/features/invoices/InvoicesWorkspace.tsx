'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  reference: string;
  issueDate: string;
  dueDate: string;
  amountHt: string;
  taxRate: string;
  discountRate: string;
  lineTitle: string;
  lineQuantity: string;
  lineUnitPrice: string;
  status: InvoiceStatus;
};

const INITIAL_FORM: NewInvoiceForm = {
  clientId: '',
  reference: '',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  amountHt: '',
  taxRate: '20',
  discountRate: '0',
  lineTitle: '',
  lineQuantity: '1',
  lineUnitPrice: '',
  status: 'brouillon',
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
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId') ?? '';
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [form, setForm] = useState<NewInvoiceForm>({
    ...INITIAL_FORM,
    clientId: preselectedClientId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client.company])), [clients]);

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

  const amountHt = Number(form.amountHt || 0);
  const taxRate = Number(form.taxRate || 0);
  const discountRate = Number(form.discountRate || 0);
  const lineTotal = Number(form.lineQuantity || 0) * Number(form.lineUnitPrice || 0);
  const computedHt = amountHt > 0 ? amountHt : lineTotal;
  const discountAmount = (computedHt * discountRate) / 100;
  const totalHt = Math.max(0, computedHt - discountAmount);
  const totalTax = (totalHt * taxRate) / 100;
  const totalTtc = totalHt + totalTax;

  const handleCreateInvoice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: form.clientId,
          dueDate: form.dueDate,
          amountHt: totalHt,
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
      setForm((prev) => ({
        ...INITIAL_FORM,
        clientId: prev.clientId,
      }));
      setSuccessMessage('Facture creee. Tu peux maintenant la generer en PDF ou l envoyer.');
    } catch {
      setErrorMessage('Erreur reseau lors de la creation de la facture.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const markPaid = async (invoiceId: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/mark-paid`, { method: 'POST' });
      const payload = await response.json();

      if (!response.ok || !payload?.data) {
        setErrorMessage(payload?.error ?? 'Impossible de marquer la facture comme payee.');
        return;
      }

      const updated = payload.data as Invoice;
      setInvoices((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSuccessMessage(`Facture ${updated.number} marquee comme payee.`);
    } catch {
      setErrorMessage('Erreur reseau pendant la mise a jour du statut.');
    }
  };

  return (
    <main className="app-shell">
      <section className="dashboard-topbar panel">
        <div className="dashboard-brand">
          <span className="brand-dot" aria-hidden="true" />
          <h1>OAF Admin</h1>
        </div>
        <Link className="header-cta" href="/contrats">Nouveau contrat</Link>
      </section>

      <nav className="dashboard-tabs panel" aria-label="Navigation principale">
        {buildMainNavigation('factures').map((item) => (
          <Link key={item.href} href={item.href} className={`dashboard-tab ${item.active ? 'active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="content-column">
        <section className="panel page-context-panel">
          <div className="panel-head-inline">
            <h2>Espace Factures</h2>
            <span className="status-chip">Generation + suivi</span>
          </div>
          <p className="panel-meta">
            Cree, previsualise et suis tes factures dans un flux unique avec relances intelligentes.
          </p>
          <div className="context-pills">
            <span className="context-pill">Total: {sortedInvoices.length}</span>
            <span className="context-pill">En attente: {grouped.attente.length}</span>
            <span className="context-pill">En retard: {grouped.retard.length}</span>
          </div>
        </section>

        <section className="panel doc-workspace-grid">
          <div className="doc-form-column">
            <div className="panel-head-inline">
              <h2>Creer une facture</h2>
              <span className="status-chip">Preview live</span>
            </div>

            <form className="modal-form-grid" onSubmit={handleCreateInvoice}>
              <label>
                Client
                <select
                  value={form.clientId}
                  onChange={(event) => setForm((prev) => ({ ...prev, clientId: event.target.value }))}
                  required
                >
                  <option value="">Selectionner un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.company}</option>
                  ))}
                </select>
              </label>

              <label>
                Reference
                <input
                  value={form.reference}
                  onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
                  placeholder="Mission branding avril"
                />
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={form.issueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, issueDate: event.target.value }))}
                />
              </label>

              <label>
                Echeance
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  required
                />
              </label>

              <label className="modal-full-width">
                Designation
                <input
                  value={form.lineTitle}
                  onChange={(event) => setForm((prev) => ({ ...prev, lineTitle: event.target.value }))}
                  placeholder="Creation identite visuelle"
                />
              </label>

              <label>
                Quantite
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.lineQuantity}
                  onChange={(event) => setForm((prev) => ({ ...prev, lineQuantity: event.target.value }))}
                />
              </label>

              <label>
                Prix unitaire HT
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.lineUnitPrice}
                  onChange={(event) => setForm((prev) => ({ ...prev, lineUnitPrice: event.target.value }))}
                />
              </label>

              <label>
                Montant HT manuel
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amountHt}
                  onChange={(event) => setForm((prev) => ({ ...prev, amountHt: event.target.value }))}
                  placeholder="Laisse vide pour calculer via ligne"
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

              <label>
                Remise (%)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountRate}
                  onChange={(event) => setForm((prev) => ({ ...prev, discountRate: event.target.value }))}
                />
              </label>

              <label>
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
              {successMessage ? <p className="panel-meta modal-full-width">{successMessage}</p> : null}

              <div className="doc-sticky-footer modal-full-width">
                <div className="totals-rows">
                  <p>Total HT: {formatCurrency(totalHt)}</p>
                  <p>TVA: {formatCurrency(totalTax)}</p>
                  <p className="total-ttc">Total TTC: {formatCurrency(totalTtc)}</p>
                </div>
                <div className="panel-actions split">
                  <button type="button" className="invoice-ghost-btn">Generer PDF</button>
                  <button type="button" className="invoice-ghost-btn">Envoyer par email</button>
                  <button type="submit" className="header-cta solid" disabled={isSubmitting}>
                    {isSubmitting ? 'Creation...' : 'Creer facture'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <aside className="doc-preview-column">
            <div className="pdf-preview-sheet">
              <p className="eyebrow">Apercu facture A4</p>
              <h3>Facture {form.reference || 'nouvelle'}</h3>
              <p className="panel-meta">Client: {clientById.get(form.clientId) ?? 'Aucun client'}</p>
              <p className="panel-meta">Date: {form.issueDate || '-'}</p>
              <p className="panel-meta">Echeance: {form.dueDate || '-'}</p>

              <hr />

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Designation</th>
                    <th>Qt</th>
                    <th>PU</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{form.lineTitle || 'Prestation freelance'}</td>
                    <td>{form.lineQuantity || '1'}</td>
                    <td>{formatCurrency(Number(form.lineUnitPrice || 0))}</td>
                    <td>{formatCurrency(lineTotal)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="invoice-preview-totals">
                <p>HT: {formatCurrency(totalHt)}</p>
                <p>TVA ({taxRate}%): {formatCurrency(totalTax)}</p>
                <p><strong>TTC: {formatCurrency(totalTtc)}</strong></p>
              </div>
            </div>
          </aside>
        </section>

        <section className="panel invoice-status-panel">
          <h2>Suivi & rappels intelligents</h2>
          <article className="invoice-status-card">
            <p className="invoice-status-label ok">Payees ({grouped.payees.length})</p>
            <p className="panel-meta">Rappel auto desactive sur factures payees.</p>
          </article>
          <article className="invoice-status-card">
            <p className="invoice-status-label warn">En attente ({grouped.attente.length})</p>
            <p className="panel-meta">Planification recommandee: J-3 puis J+3.</p>
          </article>
          <article className="invoice-status-card">
            <p className="invoice-status-label danger">En retard ({grouped.retard.length})</p>
            <p className="panel-meta">Escalade douce: J+3 puis J+10.</p>
          </article>
        </section>

        <section className="panel invoice-table-panel">
          <div className="panel-head-inline">
            <h2>Table factures</h2>
            <p className="panel-meta">{sortedInvoices.length} facture(s)</p>
          </div>

          <div className="table-wrap">
            <table className="data-table invoice-table">
              <thead>
                <tr>
                  <th>Numero</th>
                  <th>Client</th>
                  <th>Montant TTC</th>
                  <th>Echeance</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.number}</td>
                    <td>{clientById.get(invoice.clientId) ?? 'Entreprise inconnue'}</td>
                    <td>{formatAmountEur(invoice.amountTtc)}</td>
                    <td>{formatDate(invoice.dueDate)}</td>
                    <td>
                      <StatusBadge label={getInvoiceLabel(invoice.status)} tone={getInvoiceTone(invoice.status)} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="invoice-ghost-btn">Relancer</button>
                        <button type="button" className="invoice-ghost-btn" onClick={() => markPaid(invoice.id)}>
                          Marquer payee
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
