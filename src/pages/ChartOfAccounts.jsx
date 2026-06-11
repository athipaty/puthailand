import { useState, useEffect } from 'react';
import api from '../lib/api';
import { ACCOUNT_TYPE_COLOR } from '../lib/utils';

const TYPE_FILTER = ['All','Asset','Liability','Equity','Revenue','Expense','Other'];

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [seeding,  setSeeding]  = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ code: '', name: '', type: 'Asset' });
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/api/accounting/accounts');
      setAccounts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function seed() {
    if (!confirm('Seed Express chart of accounts? This replaces existing.')) return;
    setSeeding(true);
    try {
      await api.post('/api/accounting/accounts/seed', { company: 'Express' });
      await load();
    } catch (e) { alert(e.response?.data?.error || 'Seed failed'); }
    finally { setSeeding(false); }
  }

  async function addAccount(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/accounting/accounts', { ...form, company: 'Express' });
      setShowForm(false);
      setForm({ code: '', name: '', type: 'Asset' });
      await load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm('Delete account?')) return;
    await api.delete(`/api/accounting/accounts/${id}`);
    setAccounts(a => a.filter(x => x._id !== id));
  }

  const visible = accounts.filter(a => {
    const matchType = filter === 'All' || a.type === filter;
    const matchSearch = !search || a.code.includes(search) || a.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const grouped = TYPE_FILTER.slice(1).reduce((acc, type) => {
    const items = visible.filter(a => a.type === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-sm text-gray-500">{accounts.length} accounts</p>
        </div>
        <div className="flex gap-2">
          {accounts.length === 0 && (
            <button onClick={seed} disabled={seeding}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-60">
              {seeding ? 'Seeding…' : '↓ Seed Accounts'}
            </button>
          )}
          <button onClick={() => setShowForm(s => !s)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + Add Account
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={addAccount} className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">New Account</h3>
          <div className="grid grid-cols-3 gap-3">
            <input value={form.code} onChange={e => setForm(f=>({...f,code:e.target.value}))}
              required placeholder="Code (e.g. 5999-01)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
              required placeholder="Account name"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {TYPE_FILTER.slice(1).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-60 hover:bg-blue-700">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {TYPE_FILTER.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === t ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {t}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          className="ml-auto border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48" />
      </div>

      {/* Grouped table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className={`px-4 py-2.5 border-b border-gray-100 ${ACCOUNT_TYPE_COLOR[type]}`}>
            <span className="text-xs font-semibold uppercase tracking-wide">{type}</span>
            <span className="ml-2 text-xs opacity-60">({items.length})</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="px-4 py-2 text-left font-medium w-28">Code</th>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-center font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{a.code}</td>
                  <td className="px-4 py-2.5 text-gray-800">{a.name}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => del(a._id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {!loading && visible.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          {accounts.length === 0
            ? <div>No accounts yet. Click <strong>Seed Accounts</strong> to load Express chart of accounts.</div>
            : 'No accounts match your filter.'
          }
        </div>
      )}
    </div>
  );
}
