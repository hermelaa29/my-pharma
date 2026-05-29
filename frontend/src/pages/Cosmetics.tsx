import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Upload, Download, Plus, Trash2, Save, AlertCircle, CheckCircle2, Loader2, Edit2, X, Filter, ChevronLeft, ChevronRight, FileSpreadsheet, ChevronDown, Calendar as CalendarIcon, Package, TrendingUp, Boxes
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

// ─── Custom Date Picker (Portal for Overflow) ───────────────────────────────
function CustomDatePicker({ value, onChange, placeholder, error }: { value: string, onChange: (v: string) => void, placeholder: string, error?: boolean }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 350) {
        setCoords({ top: rect.top + window.scrollY - 340, left: rect.left + window.scrollX });
      } else {
        setCoords({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
      }
    }
  }, [open]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        portalRef.current && !portalRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const date = value ? new Date(value) : undefined;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-start w-full min-w-[140px] px-2.5 py-1.5 text-xs bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#51a22e]/20 transition-colors ${error ? 'border-amber-300' : 'border-gray-200'} ${!date ? 'text-gray-400' : 'text-[#5b5b5b]'}`}
      >
        <CalendarIcon className="w-3.5 h-3.5 mr-2 opacity-50" />
        <span className="truncate">{date ? format(date, 'PPP') : placeholder}</span>
      </button>
      
      {open && createPortal(
        <div ref={portalRef} className="absolute z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95" style={{ top: coords.top, left: coords.left }}>
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(d) => {
              onChange(d ? format(d, 'yyyy-MM-dd') : '');
              setOpen(false);
            }}
            className="border-0 m-0"
            styles={{ root: { margin: 0, fontSize: '0.85rem' } }}
          />
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Custom Select Component (Shadcn UI Style) ────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder, error }: { value: string, onChange: (v: string) => void, options: string[], placeholder: string, error?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm bg-white border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#51a22e]/50 transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'} ${!value ? 'text-gray-400' : 'text-[#5b5b5b]'}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 ml-2 opacity-50 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
          <div 
            className="px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors"
            onClick={() => { onChange(''); setOpen(false); }}
          >
            -- Ignore --
          </div>
          {options.map((opt: string) => (
            <div
              key={opt}
              className={`px-2 py-1.5 text-sm cursor-pointer transition-colors ${value === opt ? 'bg-[#51a22e]/10 font-medium text-[#51a22e]' : 'text-[#5b5b5b] hover:bg-gray-100 hover:text-gray-900'}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CosmeticRow {
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

type NewRowForm = Omit<CosmeticRow, 'id' | 'currentQuantity'>;

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

const WIZARD_FIELDS = [
  { key: 'itemCode', label: 'Item Code (Required)', required: true },
  { key: 'itemName', label: 'Item Name (Required)', required: true },
  { key: 'receivedDate', label: 'Received Date', required: false },
  { key: 'category', label: 'Category', required: false },
  { key: 'wholesaler', label: 'Wholesaler', required: false },
  { key: 'quantityReceived', label: 'Qty Received', required: false },
  { key: 'quantityIssued', label: 'Qty Issued', required: false },
  { key: 'lossAdjustment', label: 'Loss/Adj', required: false },
  { key: 'expireDate', label: 'Expire Date', required: false },
  { key: 'batchNumber', label: 'Batch No.', required: false },
  { key: 'purchasePrice', label: 'Purchase Price', required: false },
  { key: 'salePrice', label: 'Sale Price', required: false },
  { key: 'remark', label: 'Remark', required: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return format(new Date(iso), 'PPP'); } catch { return '—'; }
}

function calcCurrent(form: NewRowForm): number {
  return (Number(form.quantityReceived) || 0)
       - (Number(form.quantityIssued) || 0)
       - (Number(form.lossAdjustment) || 0);
}

function getMonthLeftStatus(expireDate: string | null) {
  if (!expireDate) return null;
  const now = new Date();
  const exp = new Date(expireDate);
  const diffMonths = (exp.getFullYear() - now.getFullYear()) * 12 + (exp.getMonth() - now.getMonth());
  
  if (diffMonths < 0) return { text: 'Expired', color: 'bg-red-600', bg: 'bg-red-100', isExpired: true };
  if (diffMonths === 0) return { text: 'Expired', color: 'bg-red-600', bg: 'bg-red-100', isExpired: true };
  if (diffMonths > 6) return { text: `${diffMonths}m`, color: 'bg-green-500', bg: 'bg-green-100', isExpired: false };
  if (diffMonths > 3) return { text: `${diffMonths}m`, color: 'bg-yellow-500', bg: 'bg-yellow-100', isExpired: false };
  return { text: `${diffMonths}m`, color: 'bg-red-500', bg: 'bg-red-100', isExpired: false };
}

// Simple CSV parser supporting quotes
function parseCSV(text: string) {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let val = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (i < text.length - 1 && text[i+1] === '"') { val += '"'; i++; } 
        else inQuotes = false;
      } else { val += char; }
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { row.push(val.trim()); val = ''; }
      else if (char === '\n' || char === '\r') {
        if (char === '\r' && i < text.length - 1 && text[i+1] === '\n') i++;
        row.push(val.trim()); val = '';
        result.push(row); row = [];
      } else { val += char; }
    }
  }
  row.push(val.trim());
  result.push(row);
  return result.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

// ─── Component ────────────────────────────────────────────────────────────────
const Cosmetics: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { token } = useAuth();

  const [cosmetics, setCosmetics] = useState<CosmeticRow[]>([]);
  const [newRow, setNewRow] = useState<NewRowForm>(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewRowForm>(emptyForm());
  
  // Filter & Pagination State
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // CSV Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!storeId || !token) return;
    setLoading(true);
    fetch(`/api/stores/${storeId}/cosmetics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setCosmetics(data.cosmetics || []);
        setCurrentPage(1);
      })
      .catch(() => showToast('error', 'Failed to fetch cosmetics.'))
      .finally(() => setLoading(false));
  }, [storeId, token]);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  function handleChange(key: keyof NewRowForm, value: string) {
    if (editingId) {
      setEditForm(prev => ({ ...prev, [key]: value }));
    } else {
      setNewRow(prev => ({ ...prev, [key]: value }));
    }
  }

  // ── Save new cosmetic ─────────────────────────────────────────────────────
  async function handleAddCosmetic() {
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
      const res = await fetch(`/api/stores/${storeId}/cosmetics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save.');
      setCosmetics(prev => [data.cosmetic, ...prev]);
      setNewRow(emptyForm());
      showToast('success', `${data.cosmetic.itemName} added successfully!`);
    } catch (err: any) {
      showToast('error', err.message || 'Error saving cosmetic.');
    } finally {
      setSaving(false);
    }
  }

  // ── Update cosmetic ───────────────────────────────────────────────────────
  async function handleUpdateCosmetic() {
    if (!editForm.itemCode.trim() || !editForm.itemName.trim()) {
      showToast('error', 'Item Code and Item Name are required.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...editForm,
        quantityReceived: Number(editForm.quantityReceived),
        quantityIssued:   Number(editForm.quantityIssued),
        lossAdjustment:   Number(editForm.lossAdjustment),
        purchasePrice:    Number(editForm.purchasePrice),
        salePrice:        Number(editForm.salePrice),
        receivedDate:     editForm.receivedDate || null,
        expireDate:       editForm.expireDate   || null,
      };
      const res = await fetch(`/api/stores/${storeId}/cosmetics/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update.');
      setCosmetics(prev => prev.map(m => m.id === editingId ? data.cosmetic : m));
      setEditingId(null);
      showToast('success', 'Cosmetic updated successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Error updating cosmetic.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCosmetic(id: string) {
    if (!confirm('Are you sure you want to delete this cosmetic item?')) return;
    try {
      const res = await fetch(`/api/stores/${storeId}/cosmetics/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete.');
      }
      setCosmetics(prev => prev.filter(m => m.id !== id));
      showToast('success', 'Cosmetic deleted successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Error deleting cosmetic.');
    }
  }

  function startEdit(cosm: CosmeticRow) {
    setEditingId(cosm.id);
    setEditForm({
      itemCode: cosm.itemCode,
      itemName: cosm.itemName,
      receivedDate: cosm.receivedDate ? cosm.receivedDate.split('T')[0] : '',
      category: cosm.category || '',
      wholesaler: cosm.wholesaler || '',
      quantityReceived: cosm.quantityReceived,
      quantityIssued: cosm.quantityIssued,
      lossAdjustment: cosm.lossAdjustment,
      expireDate: cosm.expireDate ? cosm.expireDate.split('T')[0] : '',
      batchNumber: cosm.batchNumber || '',
      purchasePrice: cosm.purchasePrice,
      salePrice: cosm.salePrice,
      remark: cosm.remark || '',
    });
  }

  // ── CSV Import Wizard ─────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        showToast('error', 'CSV must have a header row and at least one data row.');
        return;
      }
      
      const headers = parsed[0].map(h => h.trim());
      const rows = parsed.slice(1);
      
      setCsvHeaders(headers);
      setCsvRows(rows);

      // Auto-detect columns
      const initMap: Record<string, string> = {};
      const lowerHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      
      WIZARD_FIELDS.forEach(field => {
        const expected = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchIdx = lowerHeaders.findIndex(h => h === expected || h.includes(expected) || expected.includes(h));
        if (matchIdx !== -1) {
          initMap[field.key] = headers[matchIdx];
        } else {
          initMap[field.key] = '';
        }
      });

      setColumnMap(initMap);
      setShowWizard(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleImportSubmit() {
    if (!columnMap.itemCode || !columnMap.itemName) {
      showToast('error', 'Item Code and Item Name must be mapped.');
      return;
    }

    setSaving(true);
    try {
      const payload = csvRows.map((row) => {
        const record: any = {};
        WIZARD_FIELDS.forEach(field => {
          const headerName = columnMap[field.key];
          let val = '';
          if (headerName) {
            const idx = csvHeaders.indexOf(headerName);
            if (idx !== -1) val = row[idx] || '';
          }
          
          if (['quantityReceived', 'quantityIssued', 'lossAdjustment', 'purchasePrice', 'salePrice'].includes(field.key)) {
            record[field.key] = Number(val) || 0;
          } else if (['receivedDate', 'expireDate'].includes(field.key)) {
            const cleanVal = val.trim();
            if (cleanVal) {
              try {
                const parsedDate = new Date(cleanVal);
                if (isNaN(parsedDate.getTime())) {
                  record[field.key] = null;
                } else {
                  record[field.key] = parsedDate.toISOString();
                }
              } catch (e) {
                record[field.key] = null;
              }
            } else {
              record[field.key] = null;
            }
          } else {
            record[field.key] = val || null;
          }
        });
        return record;
      });

      const res = await fetch(`/api/stores/${storeId}/cosmetics/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import bulk data.');
      
      setCosmetics(data.cosmetics || []);
      setCurrentPage(1);
      setShowWizard(false);
      showToast('success', data.message || 'Import successful!');
    } catch (err: any) {
      showToast('error', err.message || 'Error during bulk import.');
    } finally {
      setSaving(false);
    }
  }

  function handleExportCsv() {
    if (cosmetics.length === 0) { showToast('error', 'No data to export.'); return; }
    const headers = [
      'Item Code', 'Item Name', 'Received Date', 'Category', 'Wholesaler',
      'Qty Received', 'Qty Issued', 'Loss/Adj', 'Current Qty',
      'Expire Date', 'Month Left', 'Batch No.', 'Purchase Price', 'Sale Price', 'Profit', 'Remark'
    ];
    const rows = cosmetics.map(m => [
      m.itemCode, m.itemName, formatDate(m.receivedDate), m.category ?? '',
      m.wholesaler ?? '', m.quantityReceived, m.quantityIssued, m.lossAdjustment,
      m.currentQuantity, formatDate(m.expireDate), getMonthLeftStatus(m.expireDate)?.text || '', m.batchNumber ?? '',
      m.purchasePrice, m.salePrice, (m.salePrice - m.purchasePrice).toFixed(2), m.remark ?? ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cosmetics.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'CSV exported successfully!');
  }

  // ── Compute Category Statistics ───────────────────────────────────────────
  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { count: number, totalQty: number, totalValue: number }> = {};
    cosmetics.forEach(cosm => {
      const cat = cosm.category?.trim() || 'Uncategorized';
      if (!stats[cat]) stats[cat] = { count: 0, totalQty: 0, totalValue: 0 };
      stats[cat].count += 1;
      stats[cat].totalQty += cosm.currentQuantity;
      stats[cat].totalValue += (cosm.currentQuantity * cosm.purchasePrice);
    });
    return Object.entries(stats).sort((a, b) => b[1].totalQty - a[1].totalQty);
  }, [cosmetics]);

  // ── Total Stock Aggregate ─────────────────────────────────────────────────
  const totalStock = React.useMemo(() => {
    return cosmetics.reduce((acc, c) => ({
      count: acc.count + 1,
      totalQty: acc.totalQty + c.currentQuantity,
      totalValue: acc.totalValue + (c.currentQuantity * c.purchasePrice),
    }), { count: 0, totalQty: 0, totalValue: 0 });
  }, [cosmetics]);

  // ── Filter and Paginate ───────────────────────────────────────────────────
  const filteredCosmetics = cosmetics.filter(m => 
    !categoryFilter || (m.category && m.category.toLowerCase().includes(categoryFilter.toLowerCase()))
  );
  
  const totalPages = Math.max(1, Math.ceil(filteredCosmetics.length / itemsPerPage));
  const currentData = filteredCosmetics.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Shared generic input style
  const inputCls = "w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-[#5b5b5b] text-xs font-medium focus:outline-none focus:border-[#51a22e]/60 focus:ring-1 focus:ring-[#51a22e]/20 transition-all";
  const editInputCls = "w-full px-2 py-1 rounded-md border border-amber-300 bg-white text-[#5b5b5b] text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-full mx-auto animate-fade-in space-y-6 pb-20 relative">

      {/* CSV Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-[#51a22e]" />
                <h3 className="text-lg font-bold text-[#5b5b5b]">Map CSV Columns</h3>
              </div>
              <button onClick={() => setShowWizard(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-4 flex-1 overflow-y-auto">
              <p className="text-sm text-gray-500 mb-6">
                We detected {csvHeaders.length} columns in your file. Please match them to the required fields below.
              </p>
              
              <div className="space-y-4">
                {WIZARD_FIELDS.map(field => (
                  <div key={field.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-[#51a22e]/30 transition-colors">
                    <div className="text-sm font-semibold text-gray-700 sm:w-1/3 flex items-center gap-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </div>
                    <div className="w-full sm:w-2/3">
                      <CustomSelect 
                        options={csvHeaders}
                        value={columnMap[field.key] || ''}
                        onChange={(val) => setColumnMap(prev => ({ ...prev, [field.key]: val }))}
                        placeholder="-- Ignore --"
                        error={!columnMap[field.key] && field.required}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowWizard(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={saving || !columnMap.itemCode || !columnMap.itemName}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#51a22e] text-white text-sm font-bold hover:bg-[#459926] disabled:opacity-50 transition-all shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Confirm & Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all animate-fade-in ${
          toast.type === 'success' ? 'bg-white text-[#51a22e] border-[#51a22e]/30' : 'bg-white text-red-500 border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center shadow-sm flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[#51a22e]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#5b5b5b] tracking-tight">Cosmetics Inventory</h2>
            <p className="text-[#5b5b5b]/60 text-sm mt-0.5">
              {loading ? 'Loading...' : `${cosmetics.length} item${cosmetics.length !== 1 ? 's' : ''} recorded`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#5b5b5b] text-sm font-semibold hover:bg-[#51a22e]/5 hover:border-[#51a22e]/30 hover:text-[#51a22e] transition-all shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
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

      {/* ─── Toolbar (Filter & Pagination) ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 p-3 rounded-2xl border border-white/50 shadow-sm backdrop-blur-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Filter by category..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#5b5b5b] focus:outline-none focus:border-[#51a22e]/60 focus:ring-1 focus:ring-[#51a22e]/20 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#5b5b5b]/60 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-[#51a22e] hover:bg-[#51a22e]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-[#51a22e] hover:bg-[#51a22e]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Excel Table Card ─────────────────────────────────────────────────── */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ minWidth: '1900px' }}>

            {/* ── EXPLICIT TABLE HEAD ── */}
            <thead>
              <tr className="bg-[#d9ead3]/60 border-b-2 border-[#51a22e]/20">
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap border-r border-[#51a22e]/10 sticky left-0 bg-[#d9ead3]/80 z-20">#</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[110px] border-r border-[#51a22e]/10">Item Code</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[160px] border-r border-[#51a22e]/10">Item Name</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[170px] border-r border-[#51a22e]/10">Received Date</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[120px] border-r border-[#51a22e]/10">Category</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[130px] border-r border-[#51a22e]/10">Wholesaler</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[110px] border-r border-[#51a22e]/10">Qty Received</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[100px] border-r border-[#51a22e]/10">Qty Issued</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[100px] border-r border-[#51a22e]/10">Loss/Adj</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[170px] border-r border-[#51a22e]/10">Expire Date</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[100px] border-r border-[#51a22e]/10">Month Left</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[110px] border-r border-[#51a22e]/10">Batch No.</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[120px] border-r border-[#51a22e]/10">Purchase Price</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[110px] border-r border-[#51a22e]/10">Sale Price</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[110px] border-r border-[#51a22e]/10">Current Qty</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[110px] border-r border-[#51a22e]/10">Profit</th>
                <th className="px-3 py-3 text-left text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[150px] border-r border-[#51a22e]/10">Remark</th>
                <th className="px-3 py-3 text-center text-[10px] font-black text-[#51a22e] uppercase tracking-wider whitespace-nowrap min-w-[100px] sticky right-0 bg-[#d9ead3]/80 z-20">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* ── EXPLICIT ADD NEW ROW ── */}
              {!editingId && (
                <tr className="border-b border-[#51a22e]/10 bg-[#f6fbf3] hover:bg-[#edf7e8] transition-colors group">
                  <td className="px-3 py-2 border-r border-gray-100 sticky left-0 bg-[#f6fbf3] group-hover:bg-[#edf7e8] z-10">
                    <div className="w-6 h-6 rounded-md bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 text-[#51a22e]" />
                    </div>
                  </td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={newRow.itemCode} onChange={e => handleChange('itemCode', e.target.value)} placeholder="COS-001" className={inputCls} /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={newRow.itemName} onChange={e => handleChange('itemName', e.target.value)} placeholder="Face Cream" className={inputCls} /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><CustomDatePicker value={newRow.receivedDate as string} onChange={v => handleChange('receivedDate', v)} placeholder="Pick date..." /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={newRow.category ?? ''} onChange={e => handleChange('category', e.target.value)} placeholder="Skincare" className={inputCls} /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={newRow.wholesaler ?? ''} onChange={e => handleChange('wholesaler', e.target.value)} placeholder="BeautyCo" className={inputCls} /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={newRow.quantityReceived} onChange={e => handleChange('quantityReceived', e.target.value)} placeholder="0" className={inputCls} /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={newRow.quantityIssued} onChange={e => handleChange('quantityIssued', e.target.value)} placeholder="0" className={inputCls} /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={newRow.lossAdjustment} onChange={e => handleChange('lossAdjustment', e.target.value)} placeholder="0" className={inputCls} /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><CustomDatePicker value={newRow.expireDate as string} onChange={v => handleChange('expireDate', v)} placeholder="Pick date..." /></td>
                  <td className="px-3 py-2 border-r border-gray-100 text-center"><span className="text-xs text-[#5b5b5b]/30">—</span></td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={newRow.batchNumber ?? ''} onChange={e => handleChange('batchNumber', e.target.value)} placeholder="B-2024-01" className={inputCls} /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={newRow.purchasePrice} onChange={e => handleChange('purchasePrice', e.target.value)} placeholder="0.00" className={inputCls} /></td>
                  <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={newRow.salePrice} onChange={e => handleChange('salePrice', e.target.value)} placeholder="0.00" className={inputCls} /></td>
                  
                  <td className="px-3 py-2 border-r border-gray-100">
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#51a22e]/5 border border-[#51a22e]/15 text-center">
                      <span className="text-sm font-black text-[#51a22e]">{calcCurrent(newRow)}</span>
                    </div>
                  </td>

                  <td className="px-3 py-2 border-r border-gray-100 text-right">
                    <span className="text-xs font-bold text-[#51a22e]">
                      ${(Number(newRow.salePrice || 0) - Number(newRow.purchasePrice || 0)).toFixed(2)}
                    </span>
                  </td>
                  
                  <td className="px-2 py-2 border-r border-gray-100">
                    <input type="text" value={newRow.remark ?? ''} onChange={e => handleChange('remark', e.target.value)} placeholder="Optional note" className={inputCls} />
                  </td>

                  <td className="px-3 py-2 sticky right-0 bg-[#f6fbf3] group-hover:bg-[#edf7e8] z-10 flex justify-center border-l border-gray-100">
                    <button onClick={handleAddCosmetic} disabled={saving} className="flex items-center justify-center p-1.5 rounded-lg bg-[#51a22e] text-white hover:bg-[#459926] disabled:opacity-60 transition-all shadow-sm">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={18} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#5b5b5b]/50">
                      <Loader2 className="w-8 h-8 animate-spin text-[#51a22e]" />
                      <span className="text-sm font-medium">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && cosmetics.length === 0 && (
                <tr>
                  <td colSpan={18} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-[#5b5b5b]/60">No cosmetics recorded yet.</p>
                      <p className="text-xs text-[#5b5b5b]/40">Fill in the row above or import a CSV to get started.</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* ── EXPLICIT DATA ROWS ────────────────────────────────────────────── */}
              {!loading && currentData.map((cosm, idx) => {
                const isEditing = editingId === cosm.id;
                const isLow = cosm.currentQuantity <= 5 && cosm.currentQuantity > 0;
                const isOut = cosm.currentQuantity <= 0;
                const profit = Number(cosm.salePrice) - Number(cosm.purchasePrice);
                const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                const monthStatus = getMonthLeftStatus(isEditing ? editForm.expireDate : cosm.expireDate);

                if (isEditing) {
                  return (
                    <tr key={cosm.id} className="border-b border-[#51a22e]/30 bg-[#fefce8]">
                      <td className="px-3 py-2 border-r border-gray-100 sticky left-0 bg-[#fefce8] z-10 text-center">
                        <span className="text-[10px] font-bold text-[#5b5b5b]/40">{globalIdx}</span>
                      </td>
                      <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={editForm.itemCode} onChange={e => handleChange('itemCode', e.target.value)} className={editInputCls} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={editForm.itemName} onChange={e => handleChange('itemName', e.target.value)} className={editInputCls} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><CustomDatePicker value={editForm.receivedDate as string} onChange={v => handleChange('receivedDate', v)} placeholder="Pick date..." error={false} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={editForm.category ?? ''} onChange={e => handleChange('category', e.target.value)} className={editInputCls} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={editForm.wholesaler ?? ''} onChange={e => handleChange('wholesaler', e.target.value)} className={editInputCls} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={editForm.quantityReceived} onChange={e => handleChange('quantityReceived', e.target.value)} className={editInputCls} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={editForm.quantityIssued} onChange={e => handleChange('quantityIssued', e.target.value)} className={editInputCls} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={editForm.lossAdjustment} onChange={e => handleChange('lossAdjustment', e.target.value)} className={editInputCls} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><CustomDatePicker value={editForm.expireDate as string} onChange={v => handleChange('expireDate', v)} placeholder="Pick date..." error={false} /></td>
                      
                      <td className="px-3 py-2 border-r border-gray-100 text-center">
                        {monthStatus ? (
                          monthStatus.isExpired ? (
                            <span className="inline-block px-2.5 py-1 rounded-full bg-red-100 text-[10px] font-black text-red-600 uppercase tracking-wider">Expired</span>
                          ) : (
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${monthStatus.bg}`}>
                              <div className={`w-2 h-2 rounded-full ${monthStatus.color}`}></div>
                              <span className={`text-[10px] font-bold ${monthStatus.color.replace('bg-', 'text-')}`}>{monthStatus.text}</span>
                            </div>
                          )
                        ) : <span className="text-[#5b5b5b]/30 text-xs">—</span>}
                      </td>

                      <td className="px-2 py-2 border-r border-gray-100"><input type="text" value={editForm.batchNumber ?? ''} onChange={e => handleChange('batchNumber', e.target.value)} className={editInputCls} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={editForm.purchasePrice} onChange={e => handleChange('purchasePrice', e.target.value)} className={editInputCls} /></td>
                      <td className="px-2 py-2 border-r border-gray-100"><input type="number" value={editForm.salePrice} onChange={e => handleChange('salePrice', e.target.value)} className={editInputCls} /></td>
                      
                      <td className="px-3 py-2 border-r border-gray-100">
                        <div className="px-2.5 py-1.5 rounded-lg bg-amber-100/50 border border-amber-200 text-center">
                          <span className="text-sm font-black text-amber-700">{calcCurrent(editForm)}</span>
                        </div>
                      </td>

                      <td className="px-3 py-2 border-r border-gray-100 text-right">
                        <span className="text-xs font-bold text-amber-600">
                          ${(Number(editForm.salePrice || 0) - Number(editForm.purchasePrice || 0)).toFixed(2)}
                        </span>
                      </td>
                      
                      <td className="px-2 py-2 border-r border-gray-100">
                        <input type="text" value={editForm.remark ?? ''} onChange={e => handleChange('remark', e.target.value)} className={editInputCls} />
                      </td>

                      <td className="px-3 py-2 sticky right-0 bg-[#fefce8] z-10 border-l border-gray-100">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={handleUpdateCosmetic} disabled={saving} className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60 transition-all shadow-sm">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setEditingId(null)} disabled={saving} className="p-1.5 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-60 transition-all shadow-sm">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={cosm.id} className={`border-b border-gray-100 transition-colors group ${
                      isOut ? 'bg-red-50/50 hover:bg-red-50' : isLow ? 'bg-amber-50/40 hover:bg-amber-50/70' : idx % 2 === 0 ? 'bg-white hover:bg-[#f6fbf3]' : 'bg-gray-50/50 hover:bg-[#f6fbf3]'
                  }`}>
                    <td className={`px-3 py-2.5 border-r border-gray-100 sticky left-0 z-10 text-center ${
                      isOut ? 'bg-red-50/50' : isLow ? 'bg-amber-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    } group-hover:bg-[#f6fbf3]`}>
                      <span className="text-[10px] font-bold text-[#5b5b5b]/40">{globalIdx}</span>
                    </td>

                    <td className="px-3 py-2.5 border-r border-gray-100"><span className="text-xs font-bold text-[#51a22e]">{cosm.itemCode}</span></td>
                    <td className="px-3 py-2.5 border-r border-gray-100"><span className="text-xs font-semibold text-[#5b5b5b]">{cosm.itemName}</span></td>
                    <td className="px-3 py-2.5 border-r border-gray-100"><span className="text-xs text-[#5b5b5b]/70">{formatDate(cosm.receivedDate)}</span></td>
                    <td className="px-3 py-2.5 border-r border-gray-100">
                      {cosm.category ? <span className="inline-block px-2 py-0.5 rounded-md bg-[#51a22e]/8 border border-[#51a22e]/15 text-[10px] font-bold text-[#51a22e] uppercase tracking-wide">{cosm.category}</span> : <span className="text-[#5b5b5b]/30 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5 border-r border-gray-100"><span className="text-xs text-[#5b5b5b]/70">{cosm.wholesaler || '—'}</span></td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-right"><span className="text-xs font-bold text-[#5b5b5b]">{cosm.quantityReceived}</span></td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-right"><span className="text-xs text-[#5b5b5b]/70">{cosm.quantityIssued}</span></td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-right"><span className="text-xs text-red-400">{cosm.lossAdjustment > 0 ? `-${cosm.lossAdjustment}` : cosm.lossAdjustment}</span></td>
                    <td className="px-3 py-2.5 border-r border-gray-100"><span className="text-xs text-[#5b5b5b]/70">{formatDate(cosm.expireDate)}</span></td>
                    
                    <td className="px-3 py-2.5 border-r border-gray-100 text-center">
                      {monthStatus ? (
                        monthStatus.isExpired ? (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-red-100 text-[10px] font-black text-red-600 uppercase tracking-wider">Expired</span>
                        ) : (
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${monthStatus.bg}`}>
                            <div className={`w-2 h-2 rounded-full ${monthStatus.color}`}></div>
                            <span className={`text-[10px] font-bold ${monthStatus.color.replace('bg-', 'text-')}`}>{monthStatus.text}</span>
                          </div>
                        )
                      ) : <span className="text-[#5b5b5b]/30 text-xs">—</span>}
                    </td>

                    <td className="px-3 py-2.5 border-r border-gray-100"><span className="text-xs font-mono text-[#5b5b5b]/70">{cosm.batchNumber || '—'}</span></td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-right"><span className="text-xs font-semibold text-[#5b5b5b]">${Number(cosm.purchasePrice).toFixed(2)}</span></td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-right"><span className="text-xs font-bold text-[#51a22e]">${Number(cosm.salePrice).toFixed(2)}</span></td>
                    
                    <td className="px-3 py-2.5 border-r border-gray-100 text-right">
                      <span className={`text-sm font-black ${isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-[#51a22e]'}`}>
                        {cosm.currentQuantity}
                        {isOut && <span className="text-[9px] ml-1 bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase">Out</span>}
                        {isLow && <span className="text-[9px] ml-1 bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">Low</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-right">
                      <span className={`text-xs font-bold ${profit >= 0 ? 'text-[#51a22e]' : 'text-red-500'}`}>${profit.toFixed(2)}</span>
                    </td>
                    <td className="px-3 py-2.5 border-r border-gray-100">
                      <span className="text-xs text-[#5b5b5b]/60 italic">{cosm.remark || '—'}</span>
                    </td>
                    
                    <td className={`px-3 py-2.5 sticky right-0 z-10 border-l border-gray-100 ${
                      isOut ? 'bg-red-50/50' : isLow ? 'bg-amber-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    } group-hover:bg-[#f6fbf3]`}>
                      <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(cosm)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteCosmetic(cosm.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Category Statistics Section ──────────────────────────────────────── */}
      {!loading && categoryStats.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#51a22e]/10 flex items-center justify-center shadow-sm">
              <Boxes className="w-5 h-5 text-[#51a22e]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#5b5b5b]">Stock Summary by Category</h3>
              <p className="text-xs text-[#5b5b5b]/60 mt-0.5">Real-time aggregate totals of your inventory</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Master Total Stock Box */}
            <div className="bg-gradient-to-br from-[#51a22e]/10 to-[#51a22e]/5 rounded-2xl border-2 border-[#51a22e]/30 p-5 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group sm:col-span-2 lg:col-span-1">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#51a22e]/10 rounded-full blur-2xl group-hover:bg-[#51a22e]/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-sm font-black text-[#51a22e] uppercase tracking-wider">Total Stock</h4>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#51a22e]/20 text-[#51a22e] text-[10px] font-extrabold rounded-lg">
                    <Package className="w-3 h-3" />
                    {totalStock.count} Items
                  </div>
                </div>
                <div className="flex items-end justify-between mt-6">
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Stock Qty</p>
                    <p className="text-3xl font-black text-[#5b5b5b] leading-none">{totalStock.totalQty.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Purchase Price</p>
                    <p className="text-base font-extrabold text-[#51a22e] flex items-center justify-end gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      ${totalStock.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {categoryStats.map(([cat, stat]) => (
              <div key={cat} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#51a22e]/5 rounded-full blur-2xl group-hover:bg-[#51a22e]/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-sm font-black text-[#51a22e] uppercase tracking-wider">{cat}</h4>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#51a22e]/10 text-[#51a22e] text-[10px] font-extrabold rounded-lg">
                      <Package className="w-3 h-3" />
                      {stat.count} Items
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Stock Qty</p>
                      <p className="text-3xl font-black text-[#5b5b5b] leading-none">{stat.totalQty.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Purchase Price</p>
                      <p className="text-base font-extrabold text-[#51a22e] flex items-center justify-end gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        ${stat.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Cosmetics;
