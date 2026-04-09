'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { buildMainNavigation } from '@/lib/main-navigation';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { Client } from '@/types/client';
import type { Contract, ContractStatus } from '@/types/contract';

type ContractsWorkspaceProps = {
  initialContracts: Contract[];
  clients: Client[];
};

type ContractForm = {
  clientId: string;
  title: string;
  contractType: string;
  missionContext: string;
  deliverables: string;
  pricingDetails: string;
  deadlines: string;
  workLocation: string;
  ipOption: string;
  confidentialityEnabled: boolean;
  legalCountry: string;
  startDate: string;
  endDate: string;
  amount: string;
  status: ContractStatus;
  signatureMode: 'link' | 'pdf';
  aiMissionSummary: string;
  clausesText: string;
};

const INITIAL_FORM: ContractForm = {
  clientId: '',
  title: '',
  contractType: 'prestation',
  missionContext: '',
  deliverables: '',
  pricingDetails: '',
  deadlines: '',
  workLocation: '',
  ipOption: 'cession-partielle',
  confidentialityEnabled: true,
  legalCountry: 'France',
  startDate: '',
  endDate: '',
  amount: '',
  status: 'actif',
  signatureMode: 'link',
  aiMissionSummary: '',
  clausesText: '',
};

function getContractTone(status: ContractStatus): 'ok' | 'warn' | 'danger' {
  if (status === 'actif') return 'ok';
  if (status === 'a_renouveler') return 'warn';
  return 'danger';
}

function getContractLabel(status: ContractStatus): string {
  if (status === 'actif') return 'Actif';
  if (status === 'a_renouveler') return 'A renouveler';
  return 'Expire';
}

function toEuros(value: string): number {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

export function ContractsWorkspace({ initialContracts, clients }: ContractsWorkspaceProps) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [form, setForm] = useState<ContractForm>(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState<'details' | 'clauses' | 'signatures'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clientById = useMemo(() => new Map(clients.map((item) => [item.id, item.company])), [clients]);

  const totalAmount = useMemo(
    () => contracts.reduce((sum, contract) => sum + contract.amount, 0),
    [contracts],
  );

  const signatureRate = useMemo(() => {
    if (!contracts.length) return 0;
    const signedOrActive = contracts.filter((item) => item.status === 'actif').length;
    return Math.round((signedOrActive / contracts.length) * 100);
  }, [contracts]);

  const previewClauses = useMemo(() => {
    if (form.clausesText.trim()) {
      return form.clausesText.trim().split('\n').filter(Boolean);
    }

    return [
      `Mission: ${form.missionContext || 'Description de mission a completer.'}`,
      `Livrables: ${form.deliverables || 'Liste de livrables a definir.'}`,
      `Tarification: ${form.pricingDetails || 'Tarification non renseignee.'}`,
      `Delais: ${form.deadlines || 'Delais a definir.'}`,
      `Propriete intellectuelle: ${form.ipOption}`,
      `Confidentialite: ${form.confidentialityEnabled ? 'Activee' : 'Desactivee'}`,
      `Droit applicable: ${form.legalCountry || 'France'}`,
    ];
  }, [form]);

  const handleSuggestClauses = () => {
    const summary = form.aiMissionSummary.trim();
    if (!summary) {
      setErrorMessage('Ajoute un resume de mission pour suggerer les clauses IA.');
      return;
    }

    const baseClauses = [
      `Objet: ${summary}`,
      'Paiement: acompte 40% a la commande, solde a 30 jours fin de mois.',
      'Retard: penalites legales + indemnites forfaitaires de recouvrement.',
      `Livrables: ${form.deliverables || 'Conformes au brief valide par le client.'}`,
      'Revision: deux allers-retours inclus, puis facturation additionnelle.',
      `Confidentialite: ${form.confidentialityEnabled ? 'les parties s obligent a conserver les informations strictement confidentielles.' : 'non imposee pour cette mission.'}`,
      `Droit applicable: ${form.legalCountry || 'France'}, tribunal competent du ressort du prestataire.`,
    ];

    setForm((prev) => ({ ...prev, clausesText: baseClauses.join('\n') }));
    setErrorMessage('');
    setSuccessMessage('Clauses suggerees. Tu peux les modifier avant generation.');
  };

  const handleCreateContract = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: form.clientId,
          title: form.title,
          startDate: form.startDate,
          endDate: form.endDate,
          amount: toEuros(form.amount),
          status: form.status,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.data) {
        setErrorMessage(payload?.error ?? 'Impossible de creer le contrat.');
        return;
      }

      setContracts((prev) => [payload.data as Contract, ...prev]);
      setForm(INITIAL_FORM);
      setSuccessMessage('Contrat cree. Tu peux maintenant le lier a une facture.');
    } catch {
      setErrorMessage('Erreur reseau pendant la creation du contrat.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <section className="panel page-context-panel">
          <div className="panel-head-inline">
            <h2>Espace Contrats</h2>
            <span className="status-chip">Clauses + signatures</span>
          </div>
          <p className="panel-meta">
            Construit tes contrats avec clauses adaptables et previsualisation live avant signature ou export.
          </p>
          <div className="context-pills">
            <span className="context-pill">Total: {contracts.length}</span>
            <span className="context-pill">Taux signature: {signatureRate}%</span>
            <span className="context-pill">Montant: {formatCurrency(totalAmount)}</span>
          </div>
        </section>

        <section className="dashboard-metrics">
          <article className="panel metric-card">
            <p className="metric-label">Contrats total</p>
            <p className="metric-value">{contracts.length}</p>
          </article>
          <article className="panel metric-card">
            <p className="metric-label">Montant cumule</p>
            <p className="metric-value">{formatCurrency(totalAmount)}</p>
          </article>
          <article className="panel metric-card metric-card-accent">
            <p className="metric-label">Taux de signature</p>
            <p className="metric-value">{signatureRate}%</p>
          </article>
        </section>

        <section className="panel doc-workspace-grid">
          <div className="doc-form-column">
            <div className="panel-head-inline">
              <h2>Generer un contrat</h2>
              <span className="status-chip">1 ecran = 1 doc</span>
            </div>

            <div className="doc-tabs" role="tablist" aria-label="Etapes contrat">
              <button type="button" className={`doc-tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                Details
              </button>
              <button type="button" className={`doc-tab-btn ${activeTab === 'clauses' ? 'active' : ''}`} onClick={() => setActiveTab('clauses')}>
                Clauses
              </button>
              <button type="button" className={`doc-tab-btn ${activeTab === 'signatures' ? 'active' : ''}`} onClick={() => setActiveTab('signatures')}>
                Signatures
              </button>
            </div>

            <form className="modal-form-grid" onSubmit={handleCreateContract}>
              {activeTab === 'details' ? (
                <>
                  <label>
                    Client
                    <select value={form.clientId} onChange={(event) => setForm((prev) => ({ ...prev, clientId: event.target.value }))} required>
                      <option value="">Selectionner un client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.company}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Type de contrat
                    <select value={form.contractType} onChange={(event) => setForm((prev) => ({ ...prev, contractType: event.target.value }))}>
                      <option value="prestation">Prestation</option>
                      <option value="cession-droits">Cession droits</option>
                      <option value="nda">NDA</option>
                      <option value="regie">Regie</option>
                    </select>
                  </label>

                  <label className="modal-full-width">
                    Titre
                    <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
                  </label>

                  <label className="modal-full-width">
                    Contexte mission
                    <textarea rows={3} value={form.missionContext} onChange={(event) => setForm((prev) => ({ ...prev, missionContext: event.target.value }))} />
                  </label>

                  <label className="modal-full-width">
                    Livrables
                    <textarea rows={3} value={form.deliverables} onChange={(event) => setForm((prev) => ({ ...prev, deliverables: event.target.value }))} />
                  </label>

                  <label>
                    Tarifs / modalites
                    <input value={form.pricingDetails} onChange={(event) => setForm((prev) => ({ ...prev, pricingDetails: event.target.value }))} />
                  </label>

                  <label>
                    Delais
                    <input value={form.deadlines} onChange={(event) => setForm((prev) => ({ ...prev, deadlines: event.target.value }))} />
                  </label>

                  <label>
                    Lieu
                    <input value={form.workLocation} onChange={(event) => setForm((prev) => ({ ...prev, workLocation: event.target.value }))} />
                  </label>

                  <label>
                    Propriete intellectuelle
                    <select value={form.ipOption} onChange={(event) => setForm((prev) => ({ ...prev, ipOption: event.target.value }))}>
                      <option value="cession-partielle">Cession partielle</option>
                      <option value="cession-complete">Cession complete</option>
                      <option value="licence">Licence d usage</option>
                    </select>
                  </label>

                  <label>
                    Droit applicable
                    <input value={form.legalCountry} onChange={(event) => setForm((prev) => ({ ...prev, legalCountry: event.target.value }))} />
                  </label>

                  <label>
                    Date debut
                    <input type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} required />
                  </label>

                  <label>
                    Date fin
                    <input type="date" value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} required />
                  </label>

                  <label>
                    Montant
                    <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} required />
                  </label>

                  <label>
                    Statut
                    <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ContractStatus }))}>
                      <option value="actif">Actif</option>
                      <option value="a_renouveler">A renouveler</option>
                      <option value="expire">Expire</option>
                    </select>
                  </label>

                  <label className="modal-full-width switch-row">
                    <input
                      type="checkbox"
                      checked={form.confidentialityEnabled}
                      onChange={(event) => setForm((prev) => ({ ...prev, confidentialityEnabled: event.target.checked }))}
                    />
                    <span>Activer la clause de confidentialite</span>
                  </label>
                </>
              ) : null}

              {activeTab === 'clauses' ? (
                <>
                  <label className="modal-full-width">
                    Section IA - Resume mission
                    <textarea
                      rows={4}
                      value={form.aiMissionSummary}
                      onChange={(event) => setForm((prev) => ({ ...prev, aiMissionSummary: event.target.value }))}
                      placeholder="Decris la mission pour suggerer les clauses"
                    />
                  </label>

                  <div className="panel-actions split modal-full-width">
                    <button type="button" className="invoice-ghost-btn" onClick={handleSuggestClauses}>
                      Suggerer les clauses
                    </button>
                  </div>

                  <label className="modal-full-width">
                    Clauses editables
                    <textarea
                      rows={10}
                      value={form.clausesText}
                      onChange={(event) => setForm((prev) => ({ ...prev, clausesText: event.target.value }))}
                    />
                  </label>
                </>
              ) : null}

              {activeTab === 'signatures' ? (
                <>
                  <label>
                    Mode de signature
                    <select
                      value={form.signatureMode}
                      onChange={(event) => setForm((prev) => ({ ...prev, signatureMode: event.target.value as 'link' | 'pdf' }))}
                    >
                      <option value="link">Lien de signature</option>
                      <option value="pdf">Export PDF</option>
                    </select>
                  </label>

                  <article className="panel invoice-status-card modal-full-width">
                    <p className="panel-meta">
                      {form.signatureMode === 'link'
                        ? 'Un lien de signature sera genere apres creation.'
                        : 'Le contrat sera exporte en PDF signe manuellement.'}
                    </p>
                  </article>
                </>
              ) : null}

              {errorMessage ? <p className="panel-meta modal-full-width">{errorMessage}</p> : null}
              {successMessage ? <p className="panel-meta modal-full-width">{successMessage}</p> : null}

              <div className="doc-sticky-footer modal-full-width">
                <div>
                  <p className="metric-label">Montant contrat</p>
                  <p className="metric-value">{formatCurrency(toEuros(form.amount))}</p>
                </div>
                <div className="panel-actions split">
                  <button type="button" className="invoice-ghost-btn">Generer PDF</button>
                  <button type="button" className="invoice-ghost-btn">Partager lien</button>
                  <button type="submit" className="header-cta solid" disabled={isSubmitting}>
                    {isSubmitting ? 'Creation...' : 'Creer contrat'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <aside className="doc-preview-column">
            <div className="pdf-preview-sheet">
              <p className="eyebrow">Apercu contrat</p>
              <h3>{form.title || 'Contrat sans titre'}</h3>
              <p className="panel-meta">Type: {form.contractType}</p>
              <p className="panel-meta">Client: {clientById.get(form.clientId) ?? 'Aucun client'}</p>
              <p className="panel-meta">Periode: {form.startDate || '-'} au {form.endDate || '-'}</p>
              <p className="panel-meta">Montant: {formatCurrency(toEuros(form.amount))}</p>

              <hr />

              <h4>Clauses principales</h4>
              <ul className="list">
                {previewClauses.map((clause) => (
                  <li key={clause}>{clause}</li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        <section className="panel invoice-table-panel">
          <div className="panel-head-inline">
            <h2>Suivi contrats</h2>
            <p className="panel-meta">{contracts.length} contrat(s)</p>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contrat</th>
                  <th>Client</th>
                  <th>Periode</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id}>
                    <td>{contract.title}</td>
                    <td>{clientById.get(contract.clientId) ?? 'Client inconnu'}</td>
                    <td>{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</td>
                    <td>{formatCurrency(contract.amount)}</td>
                    <td><StatusBadge label={getContractLabel(contract.status)} tone={getContractTone(contract.status)} /></td>
                    <td>
                      <Link className="header-cta" href={`/factures?clientId=${contract.clientId}`}>
                        Creer facture liee
                      </Link>
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
