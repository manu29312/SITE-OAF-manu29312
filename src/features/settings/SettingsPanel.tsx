'use client';

import { FormEvent, useMemo, useState } from 'react';

type SettingsState = {
  companyName: string;
  legalStatus: 'auto-entrepreneur' | 'sasu' | 'pme' | 'intl';
  siren: string;
  vatNumber: string;
  address: string;
  iban: string;
  logoUrl: string;
  city: string;
  supportEmail: string;
  vatRate: string;
  invoicePrefix: string;
  paymentDelayDays: string;
  reminderJminus3: boolean;
  reminderJplus3: boolean;
  reminderJplus10: boolean;
  notifyWhenPaid: boolean;
  notifyWhenOverdue: boolean;
  weeklyDigest: boolean;
  twoFactorRequired: boolean;
  sessionDuration: '8h' | '24h' | '7j';
};

const INITIAL_STATE: SettingsState = {
  companyName: 'OAF Studio',
  legalStatus: 'auto-entrepreneur',
  siren: '123 456 789',
  vatNumber: 'FR12 123456789',
  address: '12 rue des Freelances, 69000 Lyon',
  iban: 'FR76 3000 4000 5000 6000 7000 890',
  logoUrl: '',
  city: 'Lyon',
  supportEmail: 'contact@oaf-studio.fr',
  vatRate: '20',
  invoicePrefix: 'FAC',
  paymentDelayDays: '30',
  reminderJminus3: true,
  reminderJplus3: true,
  reminderJplus10: true,
  notifyWhenPaid: true,
  notifyWhenOverdue: true,
  weeklyDigest: false,
  twoFactorRequired: false,
  sessionDuration: '24h',
};

export function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsState>(INITIAL_STATE);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const previewInvoice = useMemo(() => {
    const year = new Date().getFullYear();
    return `${settings.invoicePrefix}-${year}-0001`;
  }, [settings.invoicePrefix]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('Parametres enregistres localement.');
  };

  const resetAll = () => {
    setSettings(INITIAL_STATE);
    setStatusMessage('Parametres reinitialises.');
  };

  return (
    <form className="settings-grid" onSubmit={handleSave}>
      <section className="panel settings-card">
        <div className="settings-card-head">
          <h3>Profil entreprise</h3>
          <span className="settings-tag">Public</span>
        </div>

        <div className="settings-fields two-col">
          <label>
            Nom de l entreprise
            <input
              value={settings.companyName}
              onChange={(event) => setSettings((prev) => ({ ...prev, companyName: event.target.value }))}
              required
            />
          </label>

          <label>
            Statut
            <select
              value={settings.legalStatus}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  legalStatus: event.target.value as SettingsState['legalStatus'],
                }))
              }
            >
              <option value="auto-entrepreneur">Auto-entrepreneur</option>
              <option value="sasu">SASU</option>
              <option value="pme">PME</option>
              <option value="intl">International</option>
            </select>
          </label>

          <label>
            SIREN
            <input
              value={settings.siren}
              onChange={(event) => setSettings((prev) => ({ ...prev, siren: event.target.value }))}
              required
            />
          </label>

          <label>
            TVA intracom
            <input
              value={settings.vatNumber}
              onChange={(event) => setSettings((prev) => ({ ...prev, vatNumber: event.target.value }))}
            />
          </label>

          <label className="switch-inline">
            Adresse
            <input
              value={settings.address}
              onChange={(event) => setSettings((prev) => ({ ...prev, address: event.target.value }))}
            />
          </label>

          <label className="switch-inline">
            IBAN
            <input
              value={settings.iban}
              onChange={(event) => setSettings((prev) => ({ ...prev, iban: event.target.value }))}
            />
          </label>

          <label className="switch-inline">
            URL logo
            <input
              value={settings.logoUrl}
              onChange={(event) => setSettings((prev) => ({ ...prev, logoUrl: event.target.value }))}
              placeholder="https://.../logo.png"
            />
          </label>

          <label>
            Ville
            <input
              value={settings.city}
              onChange={(event) => setSettings((prev) => ({ ...prev, city: event.target.value }))}
            />
          </label>

          <label>
            Email de support
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(event) => setSettings((prev) => ({ ...prev, supportEmail: event.target.value }))}
              required
            />
          </label>
        </div>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head">
          <h3>Facturation</h3>
          <span className="settings-tag">Metier</span>
        </div>

        <div className="settings-fields three-col">
          <label>
            TVA par defaut (%)
            <input
              type="number"
              min="0"
              max="100"
              value={settings.vatRate}
              onChange={(event) => setSettings((prev) => ({ ...prev, vatRate: event.target.value }))}
            />
          </label>

          <label>
            Prefixe facture
            <input
              value={settings.invoicePrefix}
              onChange={(event) => setSettings((prev) => ({ ...prev, invoicePrefix: event.target.value.toUpperCase() }))}
              required
            />
          </label>

          <label>
            Delai de paiement (jours)
            <input
              type="number"
              min="1"
              value={settings.paymentDelayDays}
              onChange={(event) => setSettings((prev) => ({ ...prev, paymentDelayDays: event.target.value }))}
            />
          </label>
        </div>

        <p className="panel-meta">Apercu numerotation: {previewInvoice}</p>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head">
          <h3>Relances automatiques</h3>
          <span className="settings-tag">Cron</span>
        </div>

        <div className="settings-toggles">
          <label className="switch-row">
            <input
              type="checkbox"
              checked={settings.reminderJminus3}
              onChange={(event) => setSettings((prev) => ({ ...prev, reminderJminus3: event.target.checked }))}
            />
            <span>Activer J-3 avant echeance</span>
          </label>

          <label className="switch-row">
            <input
              type="checkbox"
              checked={settings.reminderJplus3}
              onChange={(event) => setSettings((prev) => ({ ...prev, reminderJplus3: event.target.checked }))}
            />
            <span>Activer J+3 apres echeance</span>
          </label>

          <label className="switch-row">
            <input
              type="checkbox"
              checked={settings.reminderJplus10}
              onChange={(event) => setSettings((prev) => ({ ...prev, reminderJplus10: event.target.checked }))}
            />
            <span>Activer J+10 apres echeance</span>
          </label>
        </div>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head">
          <h3>Notifications</h3>
          <span className="settings-tag">Email</span>
        </div>

        <div className="settings-toggles">
          <label className="switch-row">
            <input
              type="checkbox"
              checked={settings.notifyWhenPaid}
              onChange={(event) => setSettings((prev) => ({ ...prev, notifyWhenPaid: event.target.checked }))}
            />
            <span>Notification quand une facture est payee</span>
          </label>

          <label className="switch-row">
            <input
              type="checkbox"
              checked={settings.notifyWhenOverdue}
              onChange={(event) => setSettings((prev) => ({ ...prev, notifyWhenOverdue: event.target.checked }))}
            />
            <span>Notification quand une facture passe en retard</span>
          </label>

          <label className="switch-row">
            <input
              type="checkbox"
              checked={settings.weeklyDigest}
              onChange={(event) => setSettings((prev) => ({ ...prev, weeklyDigest: event.target.checked }))}
            />
            <span>Resume hebdomadaire du cockpit</span>
          </label>
        </div>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head">
          <h3>Securite</h3>
          <span className="settings-tag">Compte</span>
        </div>

        <div className="settings-fields two-col">
          <label className="switch-row switch-inline">
            <input
              type="checkbox"
              checked={settings.twoFactorRequired}
              onChange={(event) => setSettings((prev) => ({ ...prev, twoFactorRequired: event.target.checked }))}
            />
            <span>Forcer la double authentification (2FA)</span>
          </label>

          <label>
            Duree de session
            <select
              value={settings.sessionDuration}
              onChange={(event) =>
                setSettings((prev) => ({
                  ...prev,
                  sessionDuration: event.target.value as SettingsState['sessionDuration'],
                }))
              }
            >
              <option value="8h">8 heures</option>
              <option value="24h">24 heures</option>
              <option value="7j">7 jours</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel settings-actions">
        <div className="panel-actions split">
          <button type="button" className="invoice-ghost-btn" onClick={resetAll}>
            Reinitialiser
          </button>
          <button type="submit" className="header-cta solid">
            Enregistrer les parametres
          </button>
        </div>
        {statusMessage ? <p className="panel-meta settings-feedback">{statusMessage}</p> : null}
      </section>
    </form>
  );
}
