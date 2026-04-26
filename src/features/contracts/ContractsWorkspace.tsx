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

const PREDEFINED_CLAUSES: Array<{ id: string; label: string; text: string }> = [
  {
    id: 'paiement',
    label: 'Paiement (30 jours)',
    text: 'Paiement: acompte de 40% a la commande puis solde a 30 jours fin de mois.',
  },
  {
    id: 'retard',
    label: 'Retard de paiement',
    text: 'Retard: application des penalites legales de retard et indemnites forfaitaires de recouvrement.',
  },
  {
    id: 'revision',
    label: 'Revisions limitees',
    text: 'Revision: deux allers-retours de corrections inclus, au-dela une facturation additionnelle s applique.',
  },
  {
    id: 'resiliation',
    label: 'Resiliation anticipee',
    text: 'Resiliation: chaque partie peut resilier avec un preavis de 15 jours, les travaux realises restant dus.',
  },
  {
    id: 'confidentialite',
    label: 'Confidentialite renforcee',
    text: 'Confidentialite: les parties s engagent a ne divulguer aucune information sensible sans accord ecrit prealable.',
  },
];

export function ContractsWorkspace({ initialContracts, clients }: ContractsWorkspaceProps) {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [form, setForm] = useState<ContractForm>(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState<'details' | 'clauses' | 'signatures'>('details');
  const [selectedClauseTemplate, setSelectedClauseTemplate] = useState<string>('');
  const [customClause, setCustomClause] = useState<string>('');
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

  const appendClauseLine = (line: string) => {
    const clause = line.trim();
    if (!clause) {
      setErrorMessage('La clause est vide.');
      return;
    }

    setForm((prev) => {
      const current = prev.clausesText.trim();
      const lines = current ? current.split('\n').map((item) => item.trim()) : [];
      if (lines.includes(clause)) {
        return prev;
      }

      return {
        ...prev,
        clausesText: current ? `${current}\n${clause}` : clause,
      };
    });

    setErrorMessage('');
    setSuccessMessage('Clause ajoutee a la liste editable.');
  };

  const handleAddSelectedClause = () => {
    if (!selectedClauseTemplate) {
      setErrorMessage('Selectionne une clause predefinie ou Autre.');
      return;
    }

    if (selectedClauseTemplate === 'other') {
      appendClauseLine(customClause);
      return;
    }

    const selected = PREDEFINED_CLAUSES.find((item) => item.id === selectedClauseTemplate);
    if (!selected) {
      setErrorMessage('La clause selectionnee est introuvable.');
      return;
    }

    appendClauseLine(selected.text);
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

        <section className="dashboard-metrics">
          <article className="panel metric-card">
            <p className="metric-label">Contrats total</p>
            <p className="metric-value">{contracts.length}</p>
          </article>
          <article className="panel metric-card">
            <p className="metric-label">Montant du mois</p>
            <p className="metric-value">{formatCurrency(totalAmount)}</p>
          </article>
            </section>

        <section className="panel contract-studio-panel">
          <div className="panel-head-inline">
            <div>
              <h2>Generer le contrat</h2>
                          </div>
          </div>
<div className="contract-preview-summary">
                <div>
                  <p className="metric-label">Contrat</p>
                  <p className="metric-value contract-preview-title">{form.title || 'Contrat sans titre'}</p>
                </div>
                <div className="contract-preview-pills">
                  <span className="context-pill">{clientById.get(form.clientId) ?? 'Aucun client'}</span>
                  <span className="context-pill">{form.contractType}</span>
                  <span className="context-pill">{formatCurrency(toEuros(form.amount))}</span>
                </div>
              </div>
          <div className="contract-studio-grid">
            <div className="pdf-preview-sheet contract-studio-preview">
              <p className="eyebrow">Apercu contrat</p>
              <div className="preview-quick-grid">
                <label>
                  Titre
                  <input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Ex: Contrat maintenance site"
                  />
                </label>
                          <label>
                  Client
                  <select
                    value={form.clientId}
                    onChange={(event) => setForm((prev) => ({ ...prev, clientId: event.target.value }))}
                  >
                    <option value="">Selectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.company}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Type
                  <select
                    value={form.contractType}
                    onChange={(event) => setForm((prev) => ({ ...prev, contractType: event.target.value }))}
                  >
                    <option value="prestation">Prestation</option>
                    <option value="cession-droits">Cession droits</option>
                    <option value="nda">NDA</option>
                    <option value="regie">Regie</option>
                  </select>
                </label>
                <label>
                  Date debut
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                  />
                </label>
                <label>
                  Date fin
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                  />
                </label>
                <label>
                  Montant
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder="0.00"
                  />
                </label>
              </div>
              <hr />
            </div>

            <div className="doc-form-column contract-studio-form">
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
              

                  <label className="modal-full-width">
                    Contexte mission
                    <textarea rows={3} value={form.missionContext} onChange={(event) => setForm((prev) => ({ ...prev, missionContext: event.target.value }))} />
                  </label>

                  <label className="modal-full-width">
                    Livrables
                    <textarea rows={3} value={form.deliverables} onChange={(event) => setForm((prev) => ({ ...prev, deliverables: event.target.value }))} />
                  </label>

                  <label>
                    Tarifs 
                    <input value={form.pricingDetails} onChange={(event) => setForm((prev) => ({ ...prev, pricingDetails: event.target.value }))} />
                  </label>

                  <label>
                    Délais
                    <input value={form.deadlines} onChange={(event) => setForm((prev) => ({ ...prev, deadlines: event.target.value }))} />
                  </label>

                  <label>
                    Lieu
                    <input value={form.workLocation} onChange={(event) => setForm((prev) => ({ ...prev, workLocation: event.target.value }))} />
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
                    <span>Clause de confidentialite</span>
                  </label>
                </>
              ) : null}

              {activeTab === 'clauses' ? (
                <>
                  <label>
                    Bibliotheque de clauses
                    <select value={selectedClauseTemplate} onChange={(event) => setSelectedClauseTemplate(event.target.value)}>
                      <option value="">Selectionner une clause</option>
                      {PREDEFINED_CLAUSES.map((clause) => (
                        <option key={clause.id} value={clause.id}>{clause.label}</option>
                      ))}
                      <option value="other">Autre (saisie libre)</option>
                    </select>
                  </label>

                  {selectedClauseTemplate === 'other' ? (
                    <label className="modal-full-width">
                      Clause specifique (Autre)
                      <textarea
                        rows={3}
                        value={customClause}
                        onChange={(event) => setCustomClause(event.target.value)}
                        placeholder="Ex: Le client valide chaque livrable sous 5 jours ou le livrable est considere accepte."
                      />
                    </label>
                  ) : null}

                  <div className="panel-actions split modal-full-width">
                    <button type="button" className="invoice-ghost-btn" onClick={handleAddSelectedClause}>
                      Ajouter un clause 
                    </button>
                  </div>

                  <label className="modal-full-width">
                    Section IA 
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
          </div>
        </section>
      </div>
    </main>
  );
}
