import { NavLink, Outlet } from 'react-router-dom';
import { logout } from '../lib/auth';

const LOGO = 'https://scontent.fcnx4-2.fna.fbcdn.net/v/t39.30808-6/562334113_2059051388164314_7568484514742789497_n.jpg?stp=dst-jpg_tt6&cstp=mx864x852&ctp=s864x852&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=iyyf1XGNiVIQ7kNvwHS4Xgr&_nc_oc=AdrWFbiNmIo0atps15qfwtd9gCsjRk2tIjXVy4VNgJ02EodYxenaa846dY7QeGdRWVweQ8AUX1fz2yF8t383dRno&_nc_zt=23&_nc_ht=scontent.fcnx4-2.fna&_nc_gid=0EzVNLiv-cZvVjZnw&oh=00_Af8A9Ftig0QBFn8IEog8AUd4oXymobKlkkjx3M8WMAzwqQ&oe=6A301997';

const NAV = [
  { to: '/',          label: 'Dashboard',        icon: '◼' },
  { to: '/ledger',    label: 'General Ledger',    icon: '≡' },
  { to: '/accounts',  label: 'Chart of Accounts', icon: '☰' },
  { to: '/materials', label: 'Raw Materials',     icon: '⬡' },
  { to: '/costofFG',  label: 'Cost of FG',        icon: '⚙' },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700 flex items-center gap-3">
          <img
            src={LOGO}
            alt="Express"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-600 shrink-0"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight truncate">Express Co., Ltd.</div>
            <div className="text-slate-400 text-xs">Accounting</div>
          </div>
        </div>

        {/* Nav */}
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

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-700 space-y-1">
          <div className="px-3 text-xs text-slate-500">FY 2026</div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="text-base leading-none">⇤</span>
            <span>Logout</span>
          </button>
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
