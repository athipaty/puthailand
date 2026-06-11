import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

export default function Contact() {
  const { t } = useTranslation();
  const [subject,     setSubject]     = useState('');
  const [description, setDescription] = useState('');
  const [image,       setImage]       = useState(null);
  const [preview,     setPreview]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState('');
  const [reports,     setReports]     = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const fileRef = useRef();

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    setLoadingList(true);
    try {
      const res = await api.get('/api/accounting/contact');
      setReports(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingList(false); }
  }

  function pickImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function submit(e) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return setError(t('contact.errRequired'));
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('subject',     subject.trim());
      fd.append('description', description.trim());
      fd.append('company',     'Express');
      if (image) fd.append('image', image);

      await api.post('/api/accounting/contact', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubject(''); setDescription(''); removeImage();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('contact.title')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t('contact.subtitle')}</p>
      </div>

      {/* Form */}
      <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span>✓</span> {t('contact.successMsg')}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.subjectLabel')}</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={t('contact.subjectPlaceholder')}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.descLabel')}</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('contact.descPlaceholder')}
            required
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.imageLabel')}</label>
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="preview" className="max-h-48 rounded-lg border border-gray-200 object-contain" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
              >✕</button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">{t('contact.imageHint')}</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {submitting ? t('contact.submitting') : t('contact.submit')}
        </button>
      </form>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('contact.historyTitle')}</h2>
        {loadingList ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">{t('contact.noReports')}</div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r._id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium text-gray-800 text-sm">{r.subject}</div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === 'resolved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {r.status === 'resolved' ? t('contact.statusResolved') : t('contact.statusOpen')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 whitespace-pre-wrap">{r.description}</p>
                {r.imageUrl && (
                  <a href={r.imageUrl} target="_blank" rel="noreferrer">
                    <img src={r.imageUrl} alt="screenshot" className="max-h-40 rounded-lg border border-gray-100 object-contain hover:opacity-80 transition-opacity" />
                  </a>
                )}
                <div className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
