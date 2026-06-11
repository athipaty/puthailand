import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '../lib/auth';

const LOGO = 'https://scontent.fcnx4-2.fna.fbcdn.net/v/t39.30808-6/562334113_2059051388164314_7568484514742789497_n.jpg?stp=dst-jpg_tt6&cstp=mx864x852&ctp=s864x852&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=iyyf1XGNiVIQ7kNvwHS4Xgr&_nc_oc=AdrWFbiNmIo0atps15qfwtd9gCsjRk2tIjXVy4VNgJ02EodYxenaa846dY7QeGdRWVweQ8AUX1fz2yF8t383dRno&_nc_zt=23&_nc_ht=scontent.fcnx4-2.fna&_nc_gid=0EzVNLiv-cZvVjZnw&oh=00_Af8A9Ftig0QBFn8IEog8AUd4oXymobKlkkjx3M8WMAzwqQ&oe=6A301997';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'th', label: 'TH' },
  { code: 'zh', label: '中' },
];

export default function Login() {
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  function changeLang(code) {
    i18n.changeLanguage(code);
    localStorage.setItem('pu_lang', code);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(password);
      nav('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t('login.incorrectPassword'));
      setPassword('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Logo banner */}
          <div className="bg-slate-800 px-8 py-8 flex flex-col items-center">
            <img
              src={LOGO}
              alt="Express Logo"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white/20"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="mt-4 text-center">
              <div className="text-white font-bold text-lg tracking-wide">PUTHAILAND.COM</div>
              <div className="text-slate-400 text-xs mt-0.5">{t('login.accountingSystem')}</div>
            </div>
            {/* Language switcher */}
            <div className="flex gap-2 mt-4">
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => changeLang(code)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    i18n.language === code
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('login.enterPassword')}
                  autoFocus
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPwd ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          {t('login.footer')}
        </p>
      </div>
    </div>
  );
}
