import { fmt } from '../lib/utils';

export default function KpiCard({ title, value, subtitle, color = 'blue', loading }) {
  const colors = {
    blue:   'bg-blue-50  border-blue-200  text-blue-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    red:    'bg-red-50   border-red-200   text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[color] || colors.blue}`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{title}</div>
      <div className="mt-1.5 text-2xl font-bold font-mono">
        {loading ? <span className="text-base opacity-40">Loading…</span> : fmt(value)}
      </div>
      {subtitle && <div className="mt-1 text-xs opacity-60">{subtitle}</div>}
    </div>
  );
}
