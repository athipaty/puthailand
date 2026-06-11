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
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('login.enterPassword')}
                autoFocus
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
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
