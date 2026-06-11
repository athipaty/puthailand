import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { fmt } from '../lib/utils';

const BLANK = { code:'', name:'', openingBalance:'', received:'', issued:'', rmCost:'', dmCost:'', ohCost:'', pkCost:'' };

export default function CostOfFG() {
  const { t } = useTranslation();
  const months = t('months', { returnObjects: true });

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [month,    setMonth]    = useState(3);
  const [year,     setYear]     = useState(2026);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(BLANK);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { load(); }, [month, year]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/api/accounting/fgcost?month=${month}&year=${year}`);
      setProducts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function startAdd()  { setForm(BLANK); setEditId(null); setShowForm(true); }
  function startEdit(p) {
    setForm({ code:p.code, name:p.name, openingBalance:p.openingBalance, received:p.received, issued:p.issued,
      rmCost:p.rmCost, dmCost:p.dmCost, ohCost:p.ohCost, pkCost:p.pkCost });
    setEditId(p._id); setShowForm(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form,
        openingBalance: +form.openingBalance||0, received: +form.received||0, issued: +form.issued||0,
        rmCost: +form.rmCost||0, dmCost: +form.dmCost||0, ohCost: +form.ohCost||0, pkCost: +form.pkCost||0,
        balance: (+form.openingBalance||0)+(+form.received||0)-(+form.issued||0),
        month, year, company: 'Express',
      };
      if (editId) await api.put(`/api/accounting/fgcost/${editId}`, body);
      else        await api.post('/api/accounting/fgcost', body);
      setShowForm(false); setEditId(null);
      await load();
    } catch (err) { alert(err.response?.data?.error || t('costOfFG.saveFailed')); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm(t('costOfFG.deleteConfirm'))) return;
    await api.delete(`/api/accounting/fgcost/${id}`);
    setProducts(p => p.filter(x => x._id !== id));
  }

  const totals = products.reduce((acc, p) => ({
    issued: acc.issued+(p.issued||0), balance: acc.balance+(p.balance||0),
    rm: acc.rm+(p.rmCost||0), dm: acc.dm+(p.dmCost||0),
    oh: acc.oh+(p.ohCost||0), pk: acc.pk+(p.pkCost||0), total: acc.total+(p.totalCost||0),
  }), { issued:0, balance:0, rm:0, dm:0, oh:0, pk:0, total:0 });

  const field = (k,v) => setForm(f=>({...f,[k]:v}));
  const calcTotal = () => (+form.rmCost||0)+(+form.dmCost||0)+(+form.ohCost||0)+(+form.pkCost||0);
  const calcUnit  = () => { const qty = +form.issued||+form.received||1; return calcTotal()/qty; };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('costOfFG.title')}</h1>
          <p className="text-sm text-gray-500">{t('costOfFG.subtitle')} — {months[month-1]} {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e=>setMonth(+e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {months.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(+e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={startAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            {t('costOfFG.addProduct')}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{t('costOfFG.products')}</div>
          <div className="mt-1 text-2xl font-bold text-gray-800">{products.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{t('costOfFG.totalRMCost')}</div>
          <div className="mt-1 text-xl font-bold font-mono text-blue-700">{fmt(totals.rm)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{t('costOfFG.totalOH')}</div>
          <div className="mt-1 text-xl font-bold font-mono text-orange-600">{fmt(totals.oh)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{t('costOfFG.totalProductionCost')}</div>
          <div className="mt-1 text-xl font-bold font-mono text-gray-900">{fmt(totals.total)}</div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">
            {editId ? t('costOfFG.editFG') : t('costOfFG.addFG')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.code} onChange={e=>field('code',e.target.value)} required placeholder={t('costOfFG.codePlaceholder')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input value={form.name} onChange={e=>field('name',e.target.value)} required placeholder={t('costOfFG.productName')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">{t('costOfFG.opening')}</label>
              <input type="number" value={form.openingBalance} onChange={e=>field('openingBalance',e.target.value)} step="0.001" placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">{t('costOfFG.received')}</label>
              <input type="number" value={form.received} onChange={e=>field('received',e.target.value)} step="0.001" placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">{t('costOfFG.issuedProduced')}</label>
              <input type="number" value={form.issued} onChange={e=>field('issued',e.target.value)} step="0.001" placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">{t('costOfFG.costBreakdown')}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['rmCost','costOfFG.rmCost'],['dmCost','costOfFG.dmCost'],['ohCost','costOfFG.ohCost'],['pkCost','costOfFG.pkCost']].map(([k,labelKey]) => (
                <div key={k}>
                  <label className="text-xs text-gray-500 block mb-1">{t(labelKey)}</label>
                  <input type="number" value={form[k]} onChange={e=>field(k,e.target.value)} step="0.01" placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm">
                <span className="text-xs text-blue-600">{t('costOfFG.totalCostLabel')} </span>
                <span className="font-mono font-bold text-blue-800">{fmt(calcTotal())}</span>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-sm">
                <span className="text-xs text-green-600">{t('costOfFG.unitCostLabel')} </span>
                <span className="font-mono font-bold text-green-800">{fmt(calcUnit(), 4)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              {saving ? t('costOfFG.saving') : t('costOfFG.save')}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              {t('costOfFG.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-xs text-gray-500">
                <th className="px-4 py-3 text-left font-semibold">{t('costOfFG.code')}</th>
                <th className="px-4 py-3 text-left font-semibold">{t('costOfFG.product')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.opening')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.received')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.issued')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.balance')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.rmCostCol')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.dm')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.oh')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.pk')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.totalCostCol')}</th>
                <th className="px-4 py-3 text-right font-semibold">{t('costOfFG.unitCostCol')}</th>
                <th className="px-4 py-3 text-center w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={13} className="py-10 text-center text-gray-400">{t('costOfFG.loading')}</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={13} className="py-10 text-center text-gray-400">{t('costOfFG.noProducts')}</td></tr>
              ) : products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{p.code}</td>
                  <td className="px-4 py-2.5 text-gray-800 max-w-[180px] truncate text-xs" title={p.name}>{p.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">{fmt(p.openingBalance,0)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-emerald-700">{fmt(p.received,0)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-rose-600">{fmt(p.issued,0)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums font-semibold">{fmt(p.balance,0)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">{fmt(p.rmCost)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">{fmt(p.dmCost)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-orange-600">{fmt(p.ohCost)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">{fmt(p.pkCost)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums font-bold">{fmt(p.totalCost)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-blue-700">{fmt(p.unitCost,4)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => startEdit(p)} className="text-xs text-blue-400 hover:text-blue-600 mr-1.5">✎</button>
                    <button onClick={() => del(p._id)}   className="text-xs text-red-400 hover:text-red-600">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr className="text-xs font-semibold text-gray-700">
                <td colSpan={4} className="px-4 py-3">{t('costOfFG.total', { count: products.length })}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-rose-600">{fmt(totals.issued,0)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums font-bold">{fmt(totals.balance,0)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{fmt(totals.rm)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{fmt(totals.dm)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-orange-600">{fmt(totals.oh)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{fmt(totals.pk)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums font-bold">{fmt(totals.total)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
