export const fmt = (n, decimals = 2) => {
  if (n === null || n === undefined || n === '') return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

export const fmtDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const JOURNALS = ['ทั่วไป','รับ','จ่าย','ซื้อ','ขาย','ปรับปรุง'];

export const ACCOUNT_TYPE_COLOR = {
  Asset:     'bg-blue-50 text-blue-700',
  Liability: 'bg-orange-50 text-orange-700',
  Equity:    'bg-purple-50 text-purple-700',
  Revenue:   'bg-green-50 text-green-700',
  Expense:   'bg-red-50 text-red-700',
  Other:     'bg-gray-50 text-gray-600',
};

export function getAccountType(code) {
  const prefix = (code || '').charAt(0);
  if (prefix === '1') return 'Asset';
  if (prefix === '2') return 'Liability';
  if (prefix === '3') return 'Equity';
  if (prefix === '4') return 'Revenue';
  if (prefix === '5') return 'Expense';
  return 'Other';
}
