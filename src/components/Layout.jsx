import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout } from '../lib/auth';

const LOGO = 'https://scontent.fcnx4-2.fna.fbcdn.net/v/t39.30808-6/562334113_2059051388164314_7568484514742789497_n.jpg?stp=dst-jpg_tt6&cstp=mx864x852&ctp=s864x852&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=iyyf1XGNiVIQ7kNvwHS4Xgr&_nc_oc=AdrWFbiNmIo0atps15qfwtd9gCsjRk2tIjXVy4VNgJ02EodYxenaa846dY7QeGdRWVweQ8AUX1fz2yF8t383dRno&_nc_zt=23&_nc_ht=scontent.fcnx4-2.fna&_nc_gid=0EzVNLiv-cZvVjZnw&oh=00_Af8A9Ftig0QBFn8IEog8AUd4oXymobKlkkjx3M8WMAzwqQ&oe=6A301997';

const LANGS = [{ code: 'en', label: 'EN' }, { code: 'th', label: 'TH' }, { code: 'zh', label: '中' }];

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Desktop: open = full sidebar, closed = icon-only
  const [open, setOpen] = useState(() => localStorage.getItem('pu_sidebar') !== 'closed');
  // Mobile: controls overlay visibility (default closed on mobile)
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const NAV = [
    { to: '/',          label: t('nav.dashboard'),      icon: '◼' },
    { to: '/ledger',    label: t('nav.generalLedger'),   icon: '≡' },
    { to: '/accounts',  label: t('nav.chartOfAccounts'), icon: '☰' },
    { to: '/materials', label: t('nav.rawMaterials'),    icon: '⬡' },
    { to: '/costofFG',  label: t('nav.costOfFG'),        icon: '⚙' },
  ];

  function changeLang(code) {
    i18n.changeLanguage(code);
    localStorage.setItem('pu_lang', code);
  }

  function toggleDesktop() {
    setOpen(v => {
      localStorage.setItem('pu_sidebar', v ? 'closed' : 'open');
      return !v;
    });
  }

  const navLinkClass = (isActive, centered = false) =>
    `flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors ${centered ? 'justify-center' : ''} ${
      isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const SidebarContent = ({ collapsed }) => (
    <>
      {/* Logo + toggle (desktop only) */}
      <div className={`border-b border-slate-700 flex items-center gap-3 ${collapsed ? 'px-2 py-5 justify-center' : 'px-4 py-5'}`}>
        {!collapsed && (
          <img src={LOGO} alt="Logo"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-600 shrink-0"
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-white font-bold text-sm leading-tight truncate">PUTHAILAND.COM</div>
            <div className="text-slate-400 text-xs">{t('nav.accounting')}</div>
          </div>
        )}
        {/* Desktop toggle button */}
        <button onClick={toggleDesktop}
          className={`hidden md:flex shrink-0 text-slate-400 hover:text-white transition-colors ${collapsed ? 'mx-auto' : ''}`}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col">
        <div className="space-y-0.5">
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              title={collapsed ? label : undefined}
              className={({ isActive }) => navLinkClass(isActive, collapsed)}
            >
              <span className="text-base leading-none shrink-0">{icon}</span>
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Contact — pinned to bottom */}
        <div className="mt-auto pt-3 border-t border-slate-700">
          <NavLink to="/contact"
            title={collapsed ? t('nav.contact') : undefined}
            className={({ isActive }) => navLinkClass(isActive, collapsed)}
          >
            <span className="text-base leading-none shrink-0">✉</span>
            {!collapsed && <span className="truncate">{t('nav.contact')}</span>}
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-slate-700 space-y-2">
        {collapsed ? (
          <div className="flex flex-col gap-1 items-center">
            {LANGS.map(({ code, label }) => (
              <button key={code} onClick={() => changeLang(code)}
                className={`w-9 py-1 rounded text-xs font-semibold transition-colors ${
                  i18n.language === code ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >{label}</button>
            ))}
          </div>
        ) : (
          <div className="flex gap-1 px-1">
            {LANGS.map(({ code, label }) => (
              <button key={code} onClick={() => changeLang(code)}
                className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                  i18n.language === code ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >{label}</button>
            ))}
          </div>
        )}
        {!collapsed && <div className="px-1 text-xs text-slate-500">FY 2026</div>}
        <button onClick={logout} title={collapsed ? t('nav.logout') : undefined}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-base leading-none shrink-0">⇤</span>
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside className={`hidden md:flex flex-col shrink-0 bg-slate-900 text-slate-100 transition-all duration-300 ${open ? 'w-56' : 'w-14'}`}>
        <SidebarContent collapsed={!open} />
      </aside>

      {/* ── Mobile overlay sidebar ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <aside className="relative z-50 w-64 bg-slate-900 text-slate-100 flex flex-col h-full shadow-2xl">
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="text-gray-600 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src={LOGO} alt="Logo" className="w-7 h-7 rounded-full object-cover"
            onError={e => { e.target.style.display = 'none'; }} />
          <span className="font-bold text-sm text-gray-800">PUTHAILAND.COM</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
