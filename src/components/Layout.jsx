import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { to: '/',          label: 'Dashboard',         icon: '◼' },
  { to: '/ledger',    label: 'General Ledger',     icon: '≡' },
  { to: '/accounts',  label: 'Chart of Accounts',  icon: '☰' },
  { to: '/materials', label: 'Raw Materials',      icon: '⬡' },
  { to: '/costofFG',  label: 'Cost of FG',         icon: '⚙' },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-700">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Express Co., Ltd.</div>
          <div className="text-lg font-bold text-white mt-0.5">Accounting</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-slate-700 text-xs text-slate-500">
          FY 2026
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
