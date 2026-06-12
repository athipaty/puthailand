import { useState, useCallback, useRef } from 'react';

const FIELDS = [
  { key: 'declarationNo',  labelTh: 'เลขที่ใบขนสินค้า',       labelEn: 'Declaration No.' },
  { key: 'accountNo',      labelTh: 'เลขที่บัญชี',             labelEn: 'Account No.' },
  { key: 'invoiceRef',     labelTh: 'บัญชีราคาสินค้า',         labelEn: 'Invoice Reference' },
  { key: 'exporter',       labelTh: 'ผู้ส่งออก',               labelEn: 'Exporter' },
  { key: 'vessel',         labelTh: 'ยานพาหนะ',                labelEn: 'Vessel' },
  { key: 'exportDate',     labelTh: 'วันที่ส่งออก',            labelEn: 'Export Date' },
  { key: 'destination',    labelTh: 'ประเทศปลายทาง',           labelEn: 'Destination' },
  { key: 'packages',       labelTh: 'จำนวนหีบห่อ',             labelEn: 'Packages' },
  { key: 'commodity',      labelTh: 'ชื่อสินค้า',              labelEn: 'Commodity' },
  { key: 'hsCode',         labelTh: 'พิกัดศุลกากร',            labelEn: 'HS Code' },
  { key: 'netWeight',      labelTh: 'น้ำหนักสุทธิ (KGM)',      labelEn: 'Net Weight (KGM)' },
  { key: 'grossWeight',    labelTh: 'น้ำหนักรวม (KGM)',        labelEn: 'Gross Weight (KGM)' },
  { key: 'fobUSD',         labelTh: 'ราคา FOB (USD)',           labelEn: 'FOB Value (USD)' },
  { key: 'fobTHB',         labelTh: 'ราคา FOB (THB)',           labelEn: 'FOB Value (THB)' },
  { key: 'exchangeRate',   labelTh: 'อัตราแลกเปลี่ยน',         labelEn: 'Exchange Rate (THB/USD)' },
  { key: 'exportDuty',     labelTh: 'อากรขาออก (THB)',          labelEn: 'Export Duty (THB)' },
];

const PROMPT = `This PDF may contain multiple Thai export documents.
Find ONLY the page titled "ใบขนสินค้าขาออก" (Thai Export Customs Declaration).
Extract these fields from that page only and return as a single JSON object.
Use null for any field not found.

{
  "declarationNo":  "เลขที่ใบขนสินค้า e.g. DSSX8Y5B06037",
  "accountNo":      "เลขที่บัญชี e.g. A014-1-6811-19243",
  "invoiceRef":     "บัญชีราคาสินค้า — invoice number and date",
  "exporter":       "ชื่อผู้ส่งออก",
  "vessel":         "ชื่อยานพาหนะ",
  "exportDate":     "วันที่ส่งออก",
  "destination":    "ประเทศปลายทาง (code + name)",
  "packages":       "จำนวนหีบห่อ e.g. 80 DRUM",
  "commodity":      "ชื่อสินค้าและรายละเอียด",
  "hsCode":         "รหัสพิกัดศุลกากร/รหัสสถิติ",
  "netWeight":      "น้ำหนักสุทธิ e.g. 18000.000",
  "grossWeight":    "น้ำหนักรวม e.g. 19360.000",
  "fobUSD":         "ราคา FOB in USD e.g. 27625.00",
  "fobTHB":         "ราคา FOB in THB e.g. 896022.40",
  "exchangeRate":   "อัตราแลกเปลี่ยน e.g. 32.4352",
  "exportDuty":     "อากรขาออก in THB e.g. 0.00"
}

Return ONLY the JSON object, no markdown, no explanation.`;

async function extractFromPDF(base64, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          { type: 'text', text: PROMPT },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const raw  = data.content[0].text.trim();
  const json = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(json);
}

export default function ExportDeclaration() {
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const processFile = useCallback(async (f) => {
    if (!f || f.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => resolve(e.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

      const data = await extractFromPDF(base64, apiKey);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Extraction failed.');
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  if (!apiKey) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
          <div className="font-semibold mb-2">Anthropic API key not configured</div>
          <p className="text-sm mb-2">ใส่ API key ใน <code className="bg-amber-100 px-1 rounded">.env</code>:</p>
          <pre className="text-xs bg-amber-100 rounded p-2">VITE_ANTHROPIC_API_KEY=sk-ant-...</pre>
          <p className="text-xs mt-2 text-amber-600">Restart the dev server after saving.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ใบขนสินค้าขาออก</h1>
        <p className="text-gray-500 text-sm mt-1">Export Customs Declaration — PDF Extractor</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer select-none transition-colors ${
          dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
        />
        <div className="text-5xl mb-3">📄</div>
        <p className="text-gray-700 font-medium">Drop PDF here or click to upload</p>
        <p className="text-gray-400 text-sm mt-1">วางไฟล์ PDF หรือคลิกเพื่ออัพโหลด</p>
        {file && !loading && (
          <p className="text-blue-600 text-sm mt-3 font-medium">{file.name}</p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 bg-white rounded-xl shadow p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-600 text-sm">กำลังดึงข้อมูลจากใบขน…</p>
          <p className="text-gray-400 text-xs mt-1">Extracting data — this takes a few seconds</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          <span className="font-medium">Error: </span>{error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">ข้อมูลที่สกัดได้จากใบขน</h2>
              <p className="text-xs text-gray-500 mt-0.5">{file?.name}</p>
            </div>
            <span className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium">
              ✓ Extracted
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FIELDS.map(({ key, labelTh, labelEn }) => (
              <div key={key} className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-1">
                  {labelTh}
                  <span className="mx-1 text-gray-300">·</span>
                  {labelEn}
                </div>
                <div className="text-sm font-medium text-gray-900 break-words">
                  {result[key] ?? <span className="text-gray-300 font-normal">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
