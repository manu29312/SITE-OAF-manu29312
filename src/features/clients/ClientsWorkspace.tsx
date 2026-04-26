'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ClientsPanel } from '@/features/clients/ClientsPanel';
import { buildMainNavigation } from '@/lib/main-navigation';
import type { Client } from '@/types/client';

type ClientsWorkspaceProps = {
  clients: Client[];
};

type NewClientForm = {
  nom: string;
  prenom: string;
  email: string;
  company: string;
  adresse: string;
  kbis: string;
};

const INITIAL_FORM: NewClientForm = {
  nom: '',
  prenom: '',
  email: '',
  company: '',
  adresse: '',
  kbis: '',
};

type ClientsViewMode = 'all' | 'new-this-month';

function isClientNewThisMonth(client: Client): boolean {
  if (!client.createdAt) {
    return false;
  }

  const createdAt = new Date(client.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    return false;
  }

  const now = new Date();
  return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
}

export function ClientsWorkspace({ clients }: ClientsWorkspaceProps) {
  const [clientsRecap, setClientsRecap] = useState<Client[]>(clients);
  const [viewMode, setViewMode] = useState<ClientsViewMode>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewClientForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const activeCount = clientsRecap.filter((client) => client.status === 'actif').length;
  const inactiveCount = clientsRecap.length - activeCount;
  const newThisMonthCount = clientsRecap.filter(isClientNewThisMonth).length;
  const visibleClients = viewMode === 'new-this-month'
    ? clientsRecap.filter(isClientNewThisMonth)
    : clientsRecap;

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage('');
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const fullName = `${form.prenom} ${form.nom}`.trim();
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName || form.nom,
          company: form.company,
          kbis: form.kbis,
          email: form.email,
          city: form.adresse,
          status: 'actif',
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.data) {
        setErrorMessage(payload?.error ?? 'Impossible d enregistrer le client.');
        return;
      }

      setClientsRecap((prev) => [payload.data as Client, ...prev]);
      closeModal();
    } catch {
      setErrorMessage('Erreur reseau lors de l enregistrement du client.');
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
          <button className="header-cta solid" type="button" onClick={() => setIsModalOpen(true)}>
            Nouveau client
          </button>
        </section>

        <nav className="dashboard-tabs panel" aria-label="Navigation principale">
          {buildMainNavigation('clients').map((item) => (
            <Link key={item.href} href={item.href} className={`dashboard-tab ${item.active ? 'active' : ''}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="content-column">
          <section className="panel page-context-panel">
            <div className="panel-head-inline">
              <h2>Clients</h2>
                      </div>
            <p className="panel-meta">
              Gestion des clients factures et contrats.
  
            </p>
            <div className="context-pills">
              <button
                type="button"
                className={viewMode === 'new-this-month' ? 'context-pill header-cta solid' : 'context-pill'}
                onClick={() => setViewMode('new-this-month')}
                aria-pressed={viewMode === 'new-this-month'}
              >
                Nouveaux clients du mois: {newThisMonthCount}
              </button>
              <button
                type="button"
                className={viewMode === 'all' ? 'context-pill header-cta solid' : 'context-pill'}
                onClick={() => setViewMode('all')}
                aria-pressed={viewMode === 'all'}
              >
                Total: {clientsRecap.length}
              </button>
            </div>
          </section>

          <ClientsPanel clients={visibleClients} />
        </div>
      </main>

      {isModalOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Nouveau client">
          <section className="panel modal-card">
            <div className="panel-head-inline">
              <h2>Nouveau client</h2>
              <button type="button" className="invoice-ghost-btn" onClick={closeModal}>
                Fermer
              </button>
            </div>

            <p className="panel-meta">Informations generales</p>

            <form className="modal-form-grid" onSubmit={handleSubmit}>
              <label>
                Nom
                <input
                  value={form.nom}
                  onChange={(event) => setForm((prev) => ({ ...prev, nom: event.target.value }))}
                  required
                />
              </label>

              <label>
                Prenom
                <input
                  value={form.prenom}
                  onChange={(event) => setForm((prev) => ({ ...prev, prenom: event.target.value }))}
                  required
                />
              </label>

              <label className="modal-full-width">
                Societe
                <input
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                  placeholder="Ex: Studio Atlas"
                  required
                />
              </label>

              <label className="modal-full-width">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>

              <label className="modal-full-width">
                Adresses
                <textarea
                  value={form.adresse}
                  onChange={(event) => setForm((prev) => ({ ...prev, adresse: event.target.value }))}
                  rows={3}
                  required
                />
              </label>

              <label>
                KBIS
                <input
                  value={form.kbis}
                  onChange={(event) => setForm((prev) => ({ ...prev, kbis: event.target.value }))}
                  placeholder="Ex: RCS Lyon B 123 456 789"
                />
              </label>

              {errorMessage ? <p className="panel-meta modal-full-width">{errorMessage}</p> : null}

              <div className="panel-actions split modal-full-width">
                <button type="button" className="invoice-ghost-btn" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="header-cta solid" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Creer le client'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
