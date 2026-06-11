import { useState, useEffect } from 'react';
import api from '../lib/api';
import { fmt, MONTHS } from '../lib/utils';

const BLANK = { code:'', name:'', unit:'KGM', openingBalance:'', received:'', issued:'', latestCost:'', avgCost:'' };

export default function RawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [month,     setMonth]     = useState(3);
  const [year,      setYear]      = useState(2026);
  const [showForm,  setShowForm]  = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [form,      setForm]      = useState(BLANK);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { load(); }, [month, year]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/api/accounting/materials?month=${month}&year=${year}`);
      setMaterials(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function startAdd() { setForm(BLANK); setEditItem(null); setShowForm(true); }
  function startEdit(m) { setForm({ ...m, openingBalance: m.openingBalance, received: m.received, issued: m.issued, latestCost: m.latestCost, avgCost: m.avgCost }); setEditItem(m._id); setShowForm(true); }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        openingBalance: parseFloat(form.openingBalance) || 0,
        received:       parseFloat(form.received)       || 0,
        issued:         parseFloat(form.issued)         || 0,
        latestCost:     parseFloat(form.latestCost)     || 0,
        avgCost:        parseFloat(form.avgCost)        || 0,
        month, year, company: 'Express',
      };
      if (editItem) {
        await api.put(`/api/accounting/materials/${editItem}`, body);
      } else {
        await api.post('/api/accounting/materials', body);
      }
      setShowForm(false); setEditItem(null);
      await load();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm('Delete this material?')) return;
    await api.delete(`/api/accounting/materials/${id}`);
    setMaterials(m => m.filter(x => x._id !== id));
  }

  const totals = materials.reduce((acc, m) => ({
    opening: acc.opening + (m.openingBalance||0),
    received: acc.received + (m.received||0),
    issued: acc.issued + (m.issued||0),
    balance: acc.balance + (m.balance||0),
    value: acc.value + (m.totalValue||0),
  }), { opening:0, received:0, issued:0, balance:0, value:0 });

  const field = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raw Materials</h1>
          <p className="text-sm text-gray-500">วัตถุดิบคงเหลือ — {MONTHS[month-1]} {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(+e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={startAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + Add Material
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Materials',    value: materials.length, isMoney: false },
          { label: 'Total Received',     value: fmt(totals.received, 2) + ' kg', isMoney: false },
          { label: 'Total Balance',      value: fmt(totals.balance, 2) + ' kg', isMoney: false },
          { label: 'Total Value (฿)',    value: fmt(totals.value), isMoney: true },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{c.label}</div>
            <div className={`mt-1 text-xl font-bold ${c.isMoney ? 'font-mono text-blue-700' : 'text-gray-800'}`}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">{editItem ? 'Edit' : 'Add'} Raw Material</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={form.code} onChange={e=>field('code',e.target.value)} required placeholder="Code (RM-XXX)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input value={form.name} onChange={e=>field('name',e.target.value)} required placeholder="Material name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm col-span-2" />
            <input value={form.unit} onChange={e=>field('unit',e.target.value)} placeholder="Unit" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Opening Balance</label>
              <input type="number" value={form.openingBalance} onChange={e=>field('openingBalance',e.target.value)} step="0.001" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Received (รับ)</label>
              <input type="number" value={form.received} onChange={e=>field('received',e.target.value)} step="0.001" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Issued (จ่าย)</label>
              <input type="number" value={form.issued} onChange={e=>field('issued',e.target.value)} step="0.001" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Balance</label>
              <div className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-gray-700">
                {fmt((+form.openingBalance||0)+(+form.received||0)-(+form.issued||0),3)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latest Cost (฿/unit)</label>
              <input type="number" value={form.latestCost} onChange={e=>field('latestCost',e.target.value)} step="0.0001" placeholder="0.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Avg Cost (฿/unit)</label>
              <input type="number" value={form.avgCost} onChange={e=>field('avgCost',e.target.value)} step="0.0001" placeholder="0.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Cancel
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
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-center font-semibold">Unit</th>
                <th className="px-4 py-3 text-right font-semibold">Opening</th>
                <th className="px-4 py-3 text-right font-semibold">Received</th>
                <th className="px-4 py-3 text-right font-semibold">Issued</th>
                <th className="px-4 py-3 text-right font-semibold">Balance</th>
                <th className="px-4 py-3 text-right font-semibold">Avg Cost</th>
                <th className="px-4 py-3 text-right font-semibold">Total Value</th>
                <th className="px-4 py-3 text-center font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={10} className="py-10 text-center text-gray-400">Loading…</td></tr>
              ) : materials.length === 0 ? (
                <tr><td colSpan={10} className="py-10 text-center text-gray-400">No materials. Add one above.</td></tr>
              ) : materials.map(m => (
                <tr key={m._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{m.code}</td>
                  <td className="px-4 py-2.5 text-gray-800 max-w-[200px] truncate" title={m.name}>{m.name}</td>
                  <td className="px-4 py-2.5 text-center text-xs text-gray-500">{m.unit}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums">{fmt(m.openingBalance,3)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-emerald-700">{fmt(m.received,3)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-rose-600">{fmt(m.issued,3)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums font-semibold">{fmt(m.balance,3)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-blue-700">{fmt(m.avgCost||m.latestCost,4)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums font-medium">{fmt(m.totalValue)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => startEdit(m)} className="text-xs text-blue-400 hover:text-blue-600 mr-1.5">✎</button>
                    <button onClick={() => del(m._id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr className="text-xs font-semibold text-gray-700">
                <td colSpan={3} className="px-4 py-3">Total ({materials.length})</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{fmt(totals.opening,3)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-700">{fmt(totals.received,3)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-rose-600">{fmt(totals.issued,3)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums font-bold">{fmt(totals.balance,3)}</td>
                <td></td>
                <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-blue-700">{fmt(totals.value)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
