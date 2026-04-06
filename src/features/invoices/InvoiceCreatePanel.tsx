'use client';

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/formatters';
import { isPositiveAmount, requireText } from '@/lib/validators';

type FormState = {
  clientName: string;
  number: string;
  amountHt: string;
  taxRate: string;
  dueDate: string;
};

const INITIAL_STATE: FormState = {
  clientName: '',
  number: '',
  amountHt: '',
  taxRate: '20',
  dueDate: '',
};

export function InvoiceCreatePanel() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  const amountHt = Number(form.amountHt || 0);
  const taxRate = Number(form.taxRate || 0);

  const amountTtc = useMemo(() => {
    return amountHt + (amountHt * taxRate) / 100;
  }, [amountHt, taxRate]);

  const canSubmit =
    requireText(form.clientName) &&
    requireText(form.number) &&
    requireText(form.dueDate) &&
    isPositiveAmount(amountHt);

  return (
    <section className="panel">
      <h2>Creation de facture</h2>
      <p className="panel-meta">Formulaire metier migre avec calcul HT/TTC en direct.</p>

      <div className="invoice-form-grid">
        <label>
          Client
          <input
            value={form.clientName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, clientName: event.target.value }))
            }
            placeholder="Nom du client"
          />
        </label>

        <label>
          Numero facture
          <input
            value={form.number}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, number: event.target.value }))
            }
            placeholder="FAC-2026-010"
          />
        </label>

        <label>
          Montant HT
          <input
            type="number"
            min="0"
            value={form.amountHt}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, amountHt: event.target.value }))
            }
            placeholder="1200"
          />
        </label>

        <label>
          TVA (%)
          <input
            type="number"
            min="0"
            value={form.taxRate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, taxRate: event.target.value }))
            }
            placeholder="20"
          />
        </label>

        <label>
          Date limite
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, dueDate: event.target.value }))
            }
          />
        </label>
      </div>

      <div className="invoice-preview">
        <p>Montant HT: {formatCurrency(amountHt)}</p>
        <p>Montant TTC: {formatCurrency(amountTtc)}</p>
      </div>

      <div className="panel-actions">
        <button type="button" className="header-cta" disabled={!canSubmit}>
          Enregistrer le brouillon
        </button>
      </div>
    </section>
  );
}
