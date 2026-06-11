import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import KpiCard from '../components/KpiCard';
import { fmt, MONTHS } from '../lib/utils';

const PIE_COLORS = ['#3B82F6','#EF4444','#10B981','#F59E0B','#6366F1','#EC4899','#14B8A6','#F97316'];

export default function Dashboard() {
  const [year, setYear]       = useState(2026);
  const [month, setMonth]     = useState(3);
  const [summary, setSummary] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [year, month]);

  async function load() {
    setLoading(true);
    try {
      const [s, m, r] = await Promise.all([
        api.get(`/api/accounting/gl/summary?year=${year}&month=${month}`),
        api.get(`/api/accounting/gl/monthly?year=${year}`),
        api.get(`/api/accounting/gl?year=${year}&month=${month}&limit=10`),
      ]);
      setSummary(s.data);
      setMonthly(m.data);
      setRecent(r.data.entries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Aggregate KPIs
  const kpis = summary.reduce(
    (acc, item) => {
      const prefix = item._id.code.charAt(0);
      const net = item.totalDebit - item.totalCredit;
      if (prefix === '4') acc.revenue  += item.totalCredit - item.totalDebit;
      if (prefix === '5') acc.expense  += item.totalDebit  - item.totalCredit;
      if (prefix === '1') acc.assets   += item.totalDebit  - item.totalCredit;
      if (prefix === '2') acc.liabilities += item.totalCredit - item.totalDebit;
      return acc;
    },
    { revenue: 0, expense: 0, assets: 0, liabilities: 0 },
  );
  kpis.netIncome = kpis.revenue - kpis.expense;

  // Monthly bar chart data
  const chartData = MONTHS.map(m => ({ month: m, revenue: 0, expense: 0 }));
  monthly.forEach(({ _id, totalDebit, totalCredit }) => {
    const idx = _id.month - 1;
    if (_id.codePrefix === '4') chartData[idx].revenue += totalCredit - totalDebit;
    if (_id.codePrefix === '5') chartData[idx].expense += totalDebit  - totalCredit;
  });
  const activeMonths = chartData.filter(d => d.revenue > 0 || d.expense > 0);

  // Expense breakdown pie
  const expPie = summary
    .filter(s => s._id.code.startsWith('5'))
    .map(s => ({ name: s._id.account.slice(0, 22), full: s._id.account, value: Math.abs(s.totalDebit - s.totalCredit) }))
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">PUTHAILAND.COM — Financial Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(+e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
          </select>
          <Link to="/ledger"
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            View Ledger →
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Revenue"     value={kpis.revenue}                       color="green"                            loading={loading} />
        <KpiCard title="Expenses"    value={kpis.expense}                        color="red"                              loading={loading} />
        <KpiCard title="Net Income"  value={kpis.netIncome}                      color={kpis.netIncome >= 0 ? 'blue' : 'red'} loading={loading} />
        <KpiCard title="Total Assets" value={kpis.assets}                        color="purple"                           loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue vs Expenses — {year}</h2>
          {activeMonths.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={activeMonths} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip formatter={v => [fmt(v), '']} />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4,4,0,0]} />
                <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No data — <Link to="/ledger" className="ml-1 text-blue-500">import or add entries</Link>
            </div>
          )}
        </div>

        {/* Expense pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Expense Breakdown — {MONTHS[month-1]} {year}
          </h2>
          {expPie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={expPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {expPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, _n, { payload }) => [fmt(v), payload.full]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-1">
                {expPie.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-gray-600 truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-gray-800 ml-2 shrink-0">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Account balances summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top expense accounts */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700">Top Expenses — {MONTHS[month-1]} {year}</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="px-4 py-2 text-left font-medium">Account</th>
                <th className="px-4 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-400 text-xs">Loading…</td></tr>
                : summary.filter(s => s._id.code.startsWith('5')).sort((a,b) => (b.totalDebit-b.totalCredit)-(a.totalDebit-a.totalCredit)).slice(0,8).map(s => (
                  <tr key={s._id.code} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-mono text-gray-400 mr-2">{s._id.code}</span>
                      <span className="text-gray-700">{s._id.account}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-red-600">
                      {fmt(Math.abs(s.totalDebit - s.totalCredit))}
                    </td>
                  </tr>
                ))
              }
              {!loading && summary.filter(s => s._id.code.startsWith('5')).length === 0 && (
                <tr><td colSpan={2} className="px-4 py-6 text-center text-gray-400 text-xs">No expense data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700">Recent Entries</h2>
            <Link to="/ledger" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="px-4 py-2 text-left font-medium">Date</th>
                <th className="px-4 py-2 text-left font-medium">Description</th>
                <th className="px-4 py-2 text-right font-medium">Debit</th>
                <th className="px-4 py-2 text-right font-medium">Credit</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">Loading…</td></tr>
                : recent.length === 0
                  ? <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">No entries yet</td></tr>
                  : recent.map(e => (
                    <tr key={e._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(e.date).toLocaleDateString('th-TH',{month:'short',day:'numeric'})}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 max-w-[180px] truncate text-xs" title={e.description}>
                        {e.description || e.voucher}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-green-700">
                        {e.debit > 0 ? fmt(e.debit) : ''}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-red-600">
                        {e.credit > 0 ? fmt(e.credit) : ''}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
