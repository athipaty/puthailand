import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { fmt, JOURNALS } from '../lib/utils';

export default function GeneralLedger() {
  const { t } = useTranslation();
  const months = t('months', { returnObjects: true });

  const [entries,  setEntries]  = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(1);
  const LIMIT = 150;

  const [f, setF] = useState({ year: 2026, month: '', code: '', journal: '', search: '' });

  useEffect(() => { api.get('/api/accounting/accounts').then(r => setAccounts(r.data)).catch(() => {}); }, []);
  useEffect(() => { setPage(1); fetchEntries(1); }, [f]);

  async function fetchEntries(p) {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: p, limit: LIMIT });
      if (f.year)    q.set('year', f.year);
      if (f.month)   q.set('month', f.month);
      if (f.code)    q.set('code', f.code);
      if (f.journal) q.set('journal', f.journal);
      if (f.search)  q.set('search', f.search);
      const res = await api.get(`/api/accounting/gl?${q}`);
      setEntries(res.data.entries || []);
      setTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const field = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const rows = useMemo(() => {
    const bal = {};
    return entries.map(e => {
      if (!bal[e.code]) bal[e.code] = 0;
      bal[e.code] += (e.debit || 0) - (e.credit || 0);
      return { ...e, runBal: bal[e.code] };
    });
  }, [entries]);

  const totals = useMemo(() =>
    entries.reduce((acc, e) => ({ dr: acc.dr + (e.debit||0), cr: acc.cr + (e.credit||0) }), { dr: 0, cr: 0 }),
  [entries]);

  async function del(id) {
    await api.delete(`/api/accounting/gl/${id}`);
    fetchEntries(page);
  }

  function goPage(p) { setPage(p); fetchEntries(p); }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('gl.title')}</h1>
          <p className="text-sm text-gray-500">{t('gl.entriesTotal', { count: total.toLocaleString() })}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/add-entry"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            {t('gl.addEntry')}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select value={f.year} onChange={e => field('year', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
          </select>

          <select value={f.month} onChange={e => field('month', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">{t('gl.allMonths')}</option>
            {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>

          <select value={f.code} onChange={e => field('code', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">{t('gl.allAccounts')}</option>
            {accounts.map(a => <option key={a.code} value={a.code}>{a.code} – {a.name}</option>)}
          </select>

          <select value={f.journal} onChange={e => field('journal', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">{t('gl.allJournals')}</option>
            {JOURNALS.map(j => <option key={j}>{j}</option>)}
          </select>

          <input value={f.search} onChange={e => field('search', e.target.value)}
            placeholder={t('gl.search')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-xs text-gray-500">
                <th className="px-3 py-3 text-left font-semibold">{t('gl.date')}</th>
                <th className="px-3 py-3 text-left font-semibold">{t('gl.code')}</th>
                <th className="px-3 py-3 text-left font-semibold">{t('gl.account')}</th>
                <th className="px-3 py-3 text-left font-semibold">{t('gl.journal')}</th>
                <th className="px-3 py-3 text-left font-semibold">{t('gl.voucher')}</th>
                <th className="px-3 py-3 text-left font-semibold">{t('gl.description')}</th>
                <th className="px-3 py-3 text-right font-semibold">{t('gl.debit')}</th>
                <th className="px-3 py-3 text-right font-semibold">{t('gl.credit')}</th>
                <th className="px-3 py-3 text-right font-semibold">{t('gl.balance')}</th>
                <th className="px-3 py-3 text-center font-semibold w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={10} className="py-12 text-center text-gray-400">{t('gl.loading')}</td></tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    {t('gl.noEntries')} <Link to="/add-entry" className="text-blue-600">{t('gl.addOne')}</Link> {t('gl.toStart')}
                  </td>
                </tr>
              ) : rows.map(e => (
                <tr key={e._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString('th-TH',{month:'short',day:'numeric',year:'2-digit'})}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-500">{e.code}</td>
                  <td className="px-3 py-2 text-gray-800 max-w-[140px] truncate" title={e.account}>{e.account}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{e.journal}</span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-500 whitespace-nowrap">{e.voucher}</td>
                  <td className="px-3 py-2 text-gray-700 max-w-[220px] truncate text-xs" title={e.description}>{e.description}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-emerald-700 tabular-nums">
                    {e.debit > 0 ? fmt(e.debit) : ''}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-rose-600 tabular-nums">
                    {e.credit > 0 ? fmt(e.credit) : ''}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono text-xs tabular-nums ${e.runBal < 0 ? 'text-rose-600' : 'text-gray-700'}`}>
                    {e.runBal < 0 ? `(${fmt(Math.abs(e.runBal))})` : fmt(e.runBal)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => del(e._id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr className="text-xs font-semibold text-gray-700">
                <td colSpan={6} className="px-3 py-3">{t('gl.totalRows', { count: entries.length })}</td>
                <td className="px-3 py-3 text-right font-mono text-emerald-700 tabular-nums">{fmt(totals.dr)}</td>
                <td className="px-3 py-3 text-right font-mono text-rose-600 tabular-nums">{fmt(totals.cr)}</td>
                <td colSpan={2} className="px-3 py-3 text-right font-mono tabular-nums">
                  {t('gl.diff')} {fmt(Math.abs(totals.dr - totals.cr))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{t('gl.showing', { from: Math.min((page-1)*LIMIT+1,total), to: Math.min(page*LIMIT,total), total: total.toLocaleString() })}</span>
          <div className="flex gap-2">
            <button disabled={page===1} onClick={() => goPage(page-1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40">
              {t('gl.prev')}
            </button>
            <button disabled={page*LIMIT>=total} onClick={() => goPage(page+1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40">
              {t('gl.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
