import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { JOURNALS } from '../lib/utils';

export default function AddEntry() {
  const nav = useNavigate();
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: today, journal: 'ทั่วไป', code: '', account: '',
    voucher: '', description: '', debit: '', credit: '',
  });

  useEffect(() => {
    api.get('/api/accounting/accounts').then(r => setAccounts(r.data)).catch(() => {});
  }, []);

  function set(k, v) {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'code') {
        const acc = accounts.find(a => a.code === v);
        if (acc) next.account = acc.name;
      }
      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.code) return setError(t('addEntry.errAccount'));
    if (!form.debit && !form.credit) return setError(t('addEntry.errAmount'));
    setSaving(true); setError('');
    try {
      await api.post('/api/accounting/gl', {
        ...form,
        debit:  parseFloat(form.debit)  || 0,
        credit: parseFloat(form.credit) || 0,
        company: 'Express',
      });
      nav('/ledger');
    } catch (err) {
      setError(err.response?.data?.error || t('addEntry.errSave'));
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('addEntry.title')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('addEntry.subtitle')}</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addEntry.date')}</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addEntry.journal')}</label>
            <select value={form.journal} onChange={e => set('journal', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {JOURNALS.map(j => <option key={j}>{j}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addEntry.accountCode')}</label>
            <select value={form.code} onChange={e => set('code', e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">{t('addEntry.selectAccount')}</option>
              {accounts.map(a => <option key={a.code} value={a.code}>{a.code} – {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addEntry.voucherNo')}</label>
            <input value={form.voucher} onChange={e => set('voucher', e.target.value)} placeholder={t('addEntry.voucherPlaceholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        {form.account && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-700">
            {form.account}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addEntry.description')}</label>
          <input value={form.description} onChange={e => set('description', e.target.value)}
            placeholder={t('addEntry.descPlaceholder')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addEntry.debit')}</label>
            <input type="number" value={form.debit} min="0" step="0.01" placeholder="0.00"
              onChange={e => { set('debit', e.target.value); if (e.target.value) set('credit', ''); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addEntry.credit')}</label>
            <input type="number" value={form.credit} min="0" step="0.01" placeholder="0.00"
              onChange={e => { set('credit', e.target.value); if (e.target.value) set('debit', ''); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {saving ? t('addEntry.saving') : t('addEntry.save')}
          </button>
          <button type="button" onClick={() => nav('/ledger')}
            className="px-6 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            {t('addEntry.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
