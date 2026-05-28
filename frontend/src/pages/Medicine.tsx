import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Pill, Upload, Download, Plus, Trash2, Save, AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MedicineRow {
  id: string;
  itemCode: string;
  itemName: string;
  receivedDate: string | null;
  category: string | null;
  wholesaler: string | null;
  quantityReceived: number;
  quantityIssued: number;
  lossAdjustment: number;
  currentQuantity: number;
  expireDate: string | null;
  batchNumber: string | null;
  purchasePrice: number;
  salePrice: number;
  remark: string | null;
}

type NewRowForm = Omit<MedicineRow, 'id' | 'currentQuantity'>;

const emptyForm = (): NewRowForm => ({
  itemCode: '',
  itemName: '',
  receivedDate: '',
  category: '',
  wholesaler: '',
  quantityReceived: 0,
  quantityIssued: 0,
  lossAdjustment: 0,
  expireDate: '',
  batchNumber: '',
  purchasePrice: 0,
  salePrice: 0,
  remark: '',
});

// ─── Column Definitions ───────────────────────────────────────────────────────
const COLUMNS: { key: keyof NewRowForm; label: string; type: string; width: string; placeholder: string }[] = [
  { key: 'itemCode',         label: 'Item Code',        type: 'text',   width: 'min-w-[110px]', placeholder: 'MED-001' },
  { key: 'itemName',         label: 'Item Name',        type: 'text',   width: 'min-w-[160px]', placeholder: 'Amoxicillin 500mg' },
  { key: 'receivedDate',     label: 'Received Date',    type: 'date',   width: 'min-w-[140px]', placeholder: '' },
  { key: 'category',         label: 'Category',         type: 'text',   width: 'min-w-[120px]', placeholder: 'Antibiotic' },
  { key: 'wholesaler',       label: 'Wholesaler',       type: 'text',   width: 'min-w-[130px]', placeholder: 'PharmaCo Ltd' },
  { key: 'quantityReceived', label: 'Qty Received',     type: 'number', width: 'min-w-[110px]', placeholder: '0' },
  { key: 'quantityIssued',   label: 'Qty Issued',       type: 'number', width: 'min-w-[100px]', placeholder: '0' },
  { key: 'lossAdjustment',   label: 'Loss/Adj',         type: 'number', width: 'min-w-[100px]', placeholder: '0' },
  { key: 'expireDate',       label: 'Expire Date',      type: 'date',   width: 'min-w-[130px]', placeholder: '' },
  { key: 'batchNumber',      label: 'Batch No.',        type: 'text',   width: 'min-w-[110px]', placeholder: 'B-2024-01' },
  { key: 'purchasePrice',    label: 'Purchase Price',   type: 'number', width: 'min-w-[120px]', placeholder: '0.00' },
  { key: 'salePrice',        label: 'Sale Price',       type: 'number', width: 'min-w-[110px]', placeholder: '0.00' },
  { key: 'remark',           label: 'Remark',           type: 'text',   width: 'min-w-[150px]', placeholder: 'Optional note' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString(); } catch { return '—'; }
}

function calcCurrent(form: NewRowForm): number {
  return (Number(form.quantityReceived) || 0)
       - (Number(form.quantityIssued) || 0)
       - (Number(form.lossAdjustment) || 0);
}

// ─── Component ────────────────────────────────────────────────────────────────
const Medicine: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { token } = useAuth();

  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [newRow, setNewRow] = useState<NewRowForm>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!storeId || !token) return;
    setLoading(true);
    fetch(`/api/stores/${storeId}/medicines`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setMedicines(data.medicines || []))
      .catch(() => showToast('error', 'Failed to fetch medicines.'))
      .finally(() => setLoading(false));
  }, [storeId, token]);

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Handle form field change ──────────────────────────────────────────────
  function handleChange(key: keyof NewRowForm, value: string) {
    setNewRow(prev => ({ ...prev, [key]: value }));
  }

  // ── Save new medicine ─────────────────────────────────────────────────────
  async function handleAddMedicine() {
    if (!newRow.itemCode.trim() || !newRow.itemName.trim()) {
      showToast('error', 'Item Code and Item Name are required.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...newRow,
        quantityReceived: Number(newRow.quantityReceived),
        quantityIssued:   Number(newRow.quantityIssued),
        lossAdjustment:   Number(newRow.lossAdjustment),
        purchasePrice:    Number(newRow.purchasePrice),
        salePrice:        Number(newRow.salePrice),
        receivedDate:     newRow.receivedDate || null,
        expireDate:       newRow.expireDate   || null,
      };
      const res = await fetch(`/api/stores/${storeId}/medicines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save.');
      setMedicines(prev => [data.medicine, ...prev]);
      setNewRow(emptyForm());
      showToast('success', `${data.medicine.itemName} added successfully!`);
    } catch (err: any) {
      showToast('error', err.message || 'Error saving medicine.');
    } finally {
      setSaving(false);
    }
  }

  // ── Export CSV ────────────────────────────────────────────────────────────
  function handleExportCsv() {
    if (medicines.length === 0) { showToast('error', 'No data to export.'); return; }
    const headers = [
      'Item Code', 'Item Name', 'Received Date', 'Category', 'Wholesaler',
      'Qty Received', 'Qty Issued', 'Loss/Adj', 'Current Qty',
      'Expire Date', 'Batch No.', 'Purchase Price', 'Sale Price', 'Remark'
    ];
    const rows = medicines.map(m => [
      m.itemCode, m.itemName, formatDate(m.receivedDate), m.category ?? '',
      m.wholesaler ?? '', m.quantityReceived, m.quantityIssued, m.lossAdjustment,
      m.currentQuantity, formatDate(m.expireDate), m.batchNumber ?? '',
      m.purchasePrice, m.salePrice, m.remark ?? ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'medicines.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'CSV exported successfully!');
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-full mx-auto animate-fade-in space-y-6">

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all animate-fade-in ${
          toast.type === 'success'
            ? 'bg-white text-[#51a22e] border-[#51a22e]/30'
            : 'bg-white text-red-500 border-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4" />
            : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center shadow-sm flex-shrink-0">
            <Pill className="w-6 h-6 text-[#51a22e]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#5b5b5b] tracking-tight">Medicine Inventory</h2>
            <p className="text-[#5b5b5b]/60 text-sm mt-0.5">
              {loading ? 'Loading...' : `${medicines.length} item${medicines.length !== 1 ? 's' : ''} recorded`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hidden file input for CSV upload */}
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#5b5b5b] text-sm font-semibold hover:bg-[#51a22e]/5 hover:border-[#51a22e]/30 hover:text-[#51a22e] transition-all shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#51a22e] border border-[#51a22e] text-white text-sm font-bold hover:bg-[#459926] transition-all shadow-sm shadow-[#51a22e]/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Excel Table Card ─────────────────────────────────────────────────── */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm overflow-hidden">

        {/* Scrollable table wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ minWidth: '1600px' }}>

            {/* Table Head */}
            <thead>
              <tr className="bg-[#d9ead3]/60 border-b-2 border-[#51a22e]/20">
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap border-r border-[#51a22e]/10 sticky left-0 bg-[#d9ead3]/80 z-10">
                  #
                </th>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    className={`px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap border-r border-[#51a22e]/10 ${col.width}`}
                  >
                    {col.label}
                  </th>
                ))}
                {/* Auto-calc column */}
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[110px]">
                  Current Qty
                </th>
              </tr>
            </thead>

            <tbody>
              {/* ── INPUT ROW (always shown at top) ─────────────────────────── */}
              <tr className="border-b border-[#51a22e]/10 bg-[#f6fbf3] hover:bg-[#edf7e8] transition-colors group">
                {/* Row number placeholder */}
                <td className="px-3 py-2 border-r border-gray-100 sticky left-0 bg-[#f6fbf3] group-hover:bg-[#edf7e8] z-10">
                  <div className="w-6 h-6 rounded-md bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-[#51a22e]" />
                  </div>
                </td>

                {COLUMNS.map(col => (
                  <td key={col.key} className={`px-2 py-2 border-r border-gray-100 ${col.width}`}>
                    <input
                      type={col.type}
                      value={String(newRow[col.key] ?? '')}
                      onChange={e => handleChange(col.key, e.target.value)}
                      placeholder={col.placeholder}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[#5b5b5b] text-xs font-medium placeholder:text-gray-300 focus:outline-none focus:border-[#51a22e]/60 focus:ring-1 focus:ring-[#51a22e]/20 transition-all"
                    />
                  </td>
                ))}

                {/* Auto-calc current quantity */}
                <td className="px-3 py-2">
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#51a22e]/5 border border-[#51a22e]/15 text-center">
                    <span className="text-sm font-black text-[#51a22e]">
                      {calcCurrent(newRow)}
                    </span>
                  </div>
                </td>
              </tr>

              {/* ── ADD MEDICINE BUTTON ROW ──────────────────────────────────── */}
              <tr className="border-b-2 border-[#51a22e]/15 bg-white">
                <td colSpan={COLUMNS.length + 2} className="px-4 py-3">
                  <button
                    onClick={handleAddMedicine}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#51a22e] text-white text-xs font-bold hover:bg-[#459926] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-[#51a22e]/20 cursor-pointer"
                  >
                    {saving
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Save className="w-3.5 h-3.5" />}
                    {saving ? 'Saving...' : 'Add Medicine'}
                  </button>
                </td>
              </tr>

              {/* ── LOADING STATE ────────────────────────────────────────────── */}
              {loading && (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#5b5b5b]/50">
                      <Loader2 className="w-8 h-8 animate-spin text-[#51a22e]" />
                      <span className="text-sm font-medium">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* ── EMPTY STATE ──────────────────────────────────────────────── */}
              {!loading && medicines.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Pill className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-[#5b5b5b]/60">No medicines recorded yet.</p>
                      <p className="text-xs text-[#5b5b5b]/40">Fill in the row above and click <strong>Add Medicine</strong> to get started.</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* ── DATA ROWS ────────────────────────────────────────────────── */}
              {!loading && medicines.map((med, idx) => {
                // Highlight low stock rows
                const isLow = med.currentQuantity <= 5 && med.currentQuantity > 0;
                const isOut = med.currentQuantity <= 0;

                return (
                  <tr
                    key={med.id}
                    className={`border-b border-gray-100 transition-colors group ${
                      isOut ? 'bg-red-50/50 hover:bg-red-50' :
                      isLow ? 'bg-amber-50/40 hover:bg-amber-50/70' :
                      idx % 2 === 0 ? 'bg-white hover:bg-[#f6fbf3]' : 'bg-gray-50/50 hover:bg-[#f6fbf3]'
                    }`}
                  >
                    {/* Row number */}
                    <td className={`px-3 py-2.5 border-r border-gray-100 sticky left-0 z-10 text-center ${
                      isOut ? 'bg-red-50/50' : isLow ? 'bg-amber-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    } group-hover:bg-[#f6fbf3]`}>
                      <span className="text-[10px] font-bold text-[#5b5b5b]/40">{idx + 1}</span>
                    </td>

                    {/* Item Code */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[110px]">
                      <span className="text-xs font-bold text-[#51a22e]">{med.itemCode}</span>
                    </td>

                    {/* Item Name */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[160px]">
                      <span className="text-xs font-semibold text-[#5b5b5b]">{med.itemName}</span>
                    </td>

                    {/* Received Date */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[140px]">
                      <span className="text-xs text-[#5b5b5b]/70">{formatDate(med.receivedDate)}</span>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[120px]">
                      {med.category ? (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#51a22e]/8 border border-[#51a22e]/15 text-[10px] font-bold text-[#51a22e] uppercase tracking-wide">
                          {med.category}
                        </span>
                      ) : <span className="text-[#5b5b5b]/30 text-xs">—</span>}
                    </td>

                    {/* Wholesaler */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[130px]">
                      <span className="text-xs text-[#5b5b5b]/70">{med.wholesaler || '—'}</span>
                    </td>

                    {/* Qty Received */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[110px] text-right">
                      <span className="text-xs font-bold text-[#5b5b5b]">{med.quantityReceived}</span>
                    </td>

                    {/* Qty Issued */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[100px] text-right">
                      <span className="text-xs text-[#5b5b5b]/70">{med.quantityIssued}</span>
                    </td>

                    {/* Loss/Adj */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[100px] text-right">
                      <span className="text-xs text-red-400">{med.lossAdjustment > 0 ? `-${med.lossAdjustment}` : med.lossAdjustment}</span>
                    </td>

                    {/* Expire Date */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[130px]">
                      <span className="text-xs text-[#5b5b5b]/70">{formatDate(med.expireDate)}</span>
                    </td>

                    {/* Batch Number */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[110px]">
                      <span className="text-xs font-mono text-[#5b5b5b]/70">{med.batchNumber || '—'}</span>
                    </td>

                    {/* Purchase Price */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[120px] text-right">
                      <span className="text-xs font-semibold text-[#5b5b5b]">${Number(med.purchasePrice).toFixed(2)}</span>
                    </td>

                    {/* Sale Price */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[110px] text-right">
                      <span className="text-xs font-bold text-[#51a22e]">${Number(med.salePrice).toFixed(2)}</span>
                    </td>

                    {/* Remark */}
                    <td className="px-3 py-2.5 border-r border-gray-100 min-w-[150px]">
                      <span className="text-xs text-[#5b5b5b]/60 italic">{med.remark || '—'}</span>
                    </td>

                    {/* Current Quantity (auto-calc & colored) */}
                    <td className="px-3 py-2.5 min-w-[110px] text-right">
                      <span className={`text-sm font-black ${
                        isOut ? 'text-red-500' :
                        isLow ? 'text-amber-500' :
                        'text-[#51a22e]'
                      }`}>
                        {med.currentQuantity}
                        {isOut && <span className="text-[9px] ml-1 bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase">Out</span>}
                        {isLow && <span className="text-[9px] ml-1 bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">Low</span>}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        {!loading && medicines.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-[#d9ead3]/30 flex flex-wrap items-center gap-4 text-xs text-[#5b5b5b]/60">
            <span className="font-semibold">{medicines.length} items total</span>
            <span>•</span>
            <span className="text-[#51a22e] font-semibold">
              {medicines.filter(m => m.currentQuantity > 5).length} in stock
            </span>
            <span>•</span>
            <span className="text-amber-500 font-semibold">
              {medicines.filter(m => m.currentQuantity <= 5 && m.currentQuantity > 0).length} low stock
            </span>
            <span>•</span>
            <span className="text-red-400 font-semibold">
              {medicines.filter(m => m.currentQuantity <= 0).length} out of stock
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medicine;
