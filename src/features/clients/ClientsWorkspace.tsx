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
  adresse: string;
  kbis: string;
};

const INITIAL_FORM: NewClientForm = {
  nom: '',
  prenom: '',
  email: '',
  adresse: '',
  kbis: '',
};

export function ClientsWorkspace({ clients }: ClientsWorkspaceProps) {
  const [clientsRecap, setClientsRecap] = useState<Client[]>(clients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewClientForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const activeCount = clientsRecap.filter((client) => client.status === 'actif').length;
  const inactiveCount = clientsRecap.length - activeCount;

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
          company: `KBIS ${form.kbis}`,
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
              <h2>Espace Clients</h2>
              <span className="status-chip">CRM freelance</span>
            </div>
            <p className="panel-meta">
              Gere tes clients, leurs coordonnees et leur statut pour alimenter automatiquement factures et contrats.
            </p>
            <div className="context-pills">
              <span className="context-pill">Total: {clientsRecap.length}</span>
              <span className="context-pill">Actifs: {activeCount}</span>
              <span className="context-pill">Inactifs: {inactiveCount}</span>
            </div>
          </section>

          <ClientsPanel clients={clientsRecap} />
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
                  required
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
