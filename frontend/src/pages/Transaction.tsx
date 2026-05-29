import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import {
  ArrowRightLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Package,
  AlertTriangle,
  Pill,
  Sparkles,
  Download,
  Trash2,
  Loader2,
  X,
  ChevronDown
} from 'lucide-react';

// Ethiopian fiscal year calculation (roughly start year + 7)
const getCurrentEthiopianYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  // Sept 11 is the start, if we are before Sept 11, we are in the previous Ethiopian year.
  // simplified logic:
  let ethYear = year - 8;
  if (now.getMonth() > 8 || (now.getMonth() === 8 && now.getDate() >= 11)) {
    ethYear = year - 7;
  }
  return ethYear;
};

interface FinancialStats {
  investment: number;
  revenue: number;
  profit: number;
  stockValue: number;
  lossValue: number;
}

interface ItemTransaction {
  id: string;
  itemName: string;
  itemCode: string;
  source: 'Medicine' | 'Cosmetic';
  receivedDate: string | null;
  expireDate: string | null;
  quantityReceived: number;
  quantityIssued: number;
  lossAdjustment: number;
  currentQuantity: number;
  purchasePrice: number;
  salePrice: number;
  investment: number;
  revenue: number;
  profit: number;
  stockValue: number;
  lossValue: number;
}

const Transaction: React.FC = () => {
  const { user, token } = useAuth();
  const { storeId } = useParams<{ storeId: string }>();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemTransaction[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentEthiopianYear());
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  
  // Available years to select (e.g., from 2010 to current year)
  const availableYears = Array.from({ length: 15 }, (_, i) => getCurrentEthiopianYear() - i);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTransactions = async () => {
    if (!storeId || !token) return;
    setLoading(true);
    try {
      const [medRes, cosRes] = await Promise.all([
        fetch(`/api/stores/${storeId}/medicines`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/stores/${storeId}/cosmetics`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const medData = await medRes.json();
      const cosData = await cosRes.json();

      const allItems: ItemTransaction[] = [];

      const processItems = (data: any[], source: 'Medicine' | 'Cosmetic') => {
        for (const item of (data || [])) {
          let isExpired = false;
          if (item.expireDate) {
            const now = new Date();
            const exp = new Date(item.expireDate);
            const diffMonths = (exp.getFullYear() - now.getFullYear()) * 12 + (exp.getMonth() - now.getMonth());
            if (diffMonths <= 0) {
              isExpired = true;
            }
          }

          const investment = item.quantityReceived * item.purchasePrice;
          const revenue = item.quantityIssued * item.salePrice;
          const costOfSold = item.quantityIssued * item.purchasePrice;
          const profit = revenue - costOfSold;
          let stockValue = item.currentQuantity * item.purchasePrice;
          let lossValue = item.lossAdjustment * item.purchasePrice;
          
          if (isExpired) {
            lossValue += item.currentQuantity * item.purchasePrice;
            stockValue = 0;
          }

          allItems.push({
            id: item.id,
            itemName: item.itemName,
            itemCode: item.itemCode,
            source,
            receivedDate: item.receivedDate,
            expireDate: item.expireDate,
            quantityReceived: item.quantityReceived,
            quantityIssued: item.quantityIssued,
            lossAdjustment: item.lossAdjustment,
            currentQuantity: item.currentQuantity,
            purchasePrice: item.purchasePrice,
            salePrice: item.salePrice,
            investment,
            revenue,
            profit,
            stockValue,
            lossValue
          });
        }
      };

      processItems(medData.medicines, 'Medicine');
      processItems(cosData.cosmetics, 'Cosmetic');

      setItems(allItems);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [storeId, token]);

  const yearFilteredItems = useMemo(() => {
    const startYearGregorian = selectedYear + 7;
    const startDate = new Date(startYearGregorian, 8, 11).getTime(); // Sept 11
    const endDate = new Date(startYearGregorian + 1, 8, 10, 23, 59, 59).getTime(); // Sept 10 next year

    return items.filter(item => {
      if (!item.receivedDate) return false;
      const date = new Date(item.receivedDate).getTime();
      return date >= startDate && date <= endDate;
    });
  }, [items, selectedYear]);

  const calculateStats = (filtered: ItemTransaction[]): FinancialStats => {
    return filtered.reduce((acc, item) => {
      acc.investment += item.investment;
      acc.revenue += item.revenue;
      acc.profit += item.profit;
      acc.stockValue += item.stockValue;
      acc.lossValue += item.lossValue;
      return acc;
    }, { investment: 0, revenue: 0, profit: 0, stockValue: 0, lossValue: 0 });
  };

  const totalStats = useMemo(() => calculateStats(yearFilteredItems), [yearFilteredItems]);
  const medStats = useMemo(() => calculateStats(yearFilteredItems.filter(i => i.source === 'Medicine')), [yearFilteredItems]);
  const cosStats = useMemo(() => calculateStats(yearFilteredItems.filter(i => i.source === 'Cosmetic')), [yearFilteredItems]);

  const topProfitable = useMemo(() => {
    return [...yearFilteredItems].sort((a, b) => b.profit - a.profit).slice(0, 10);
  }, [yearFilteredItems]);

  const exportCSV = () => {
    const headers = [
      'Item Code', 'Item Name', 'Source', 'Received Date', 'Purchase Price', 'Sale Price',
      'Qty Received', 'Qty Issued', 'Loss Qty', 'Current Qty',
      'Investment', 'Revenue', 'Profit', 'Stock Value', 'Loss Value'
    ];

    const rows = yearFilteredItems.map(i => [
      `"${i.itemCode}"`, `"${i.itemName}"`, `"${i.source}"`, `"${i.receivedDate ? new Date(i.receivedDate).toISOString().split('T')[0] : ''}"`,
      i.purchasePrice, i.salePrice,
      i.quantityReceived, i.quantityIssued, i.lossAdjustment, i.currentQuantity,
      i.investment, i.revenue, i.profit, i.stockValue, i.lossValue
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_EC_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteYear = async () => {
    if (deleteConfirmText !== selectedYear.toString()) return;
    
    setIsDeleting(true);
    try {
      await Promise.all([
        fetch(`/api/stores/${storeId}/medicines/fiscal/${selectedYear}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/stores/${storeId}/cosmetics/fiscal/${selectedYear}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      
      setIsDeleteModalOpen(false);
      setDeleteConfirmText('');
      await fetchTransactions(); // Refresh
    } catch (error) {
      console.error('Error deleting fiscal year:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#51a22e] animate-spin" />
          <p className="text-sm font-semibold text-[#5b5b5b]/50">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-6 pb-20">
      
      {/* ─── Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#51a22e]/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center shadow-sm">
            <ArrowRightLeft className="w-6 h-6 text-[#51a22e]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#5b5b5b] tracking-tight">Financial Overview</h2>
            <p className="text-[#5b5b5b]/60 text-sm mt-1">Review investment, revenue, and profit margins.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-[#5b5b5b] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#51a22e]" />
            Fiscal Year (EC)
          </label>
          <div className="relative">
            <button
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="flex items-center justify-between w-32 px-4 py-2 bg-white border border-[#51a22e]/20 rounded-xl text-sm font-bold text-[#5b5b5b] focus:outline-none focus:ring-2 focus:ring-[#51a22e]/30 shadow-sm"
            >
              {selectedYear}
              <ChevronDown className={`w-4 h-4 text-gray-500 opacity-50 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isYearDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsYearDropdownOpen(false)}
                />
                <div className="absolute right-0 z-50 w-32 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2">
                  {availableYears.map(yr => (
                    <div 
                      key={yr} 
                      onClick={() => { setSelectedYear(yr); setIsYearDropdownOpen(false); }}
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${yr === selectedYear ? 'bg-[#51a22e]/10 text-[#51a22e] font-bold' : 'text-[#5b5b5b] hover:bg-gray-50'}`}
                    >
                      {yr}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Master Summary Cards ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5b5b5b]/60 uppercase tracking-wider">Total Investment</span>
            </div>
            <p className="text-2xl font-black text-[#5b5b5b]">${totalStats.investment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <p className="text-[10px] text-[#5b5b5b]/50 mt-3 leading-snug">Total money spent to purchase these items from the wholesaler.</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5b5b5b]/60 uppercase tracking-wider">Revenue Earned</span>
            </div>
            <p className="text-2xl font-black text-[#5b5b5b]">${totalStats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <p className="text-[10px] text-[#5b5b5b]/50 mt-3 leading-snug">Money collected from the items you have already sold.</p>
        </div>

        <div className="bg-gradient-to-br from-[#51a22e]/10 to-[#51a22e]/5 rounded-2xl p-5 border-2 border-[#51a22e]/30 shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#51a22e]/20 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-[#51a22e]/20 text-[#51a22e]">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#51a22e] uppercase tracking-wider">Realized Profit</span>
            </div>
            <p className="text-2xl font-black text-[#51a22e]">${totalStats.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <p className="text-[10px] text-[#51a22e]/70 mt-3 leading-snug relative z-10 font-medium">Actual net profit gained from the items sold.</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5b5b5b]/60 uppercase tracking-wider">Stock Value</span>
            </div>
            <p className="text-2xl font-black text-[#5b5b5b]">${totalStats.stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <p className="text-[10px] text-[#5b5b5b]/50 mt-3 leading-snug">Estimated value of items currently remaining in stock.</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-red-50 text-red-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#5b5b5b]/60 uppercase tracking-wider">Loss Value</span>
            </div>
            <p className="text-2xl font-black text-[#5b5b5b]">${totalStats.lossValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <p className="text-[10px] text-[#5b5b5b]/50 mt-3 leading-snug">Money lost due to expired, damaged, or lost items.</p>
        </div>

      </div>

      {/* ─── Breakdown Panels ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Medicine Breakdown */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-[#51a22e]/15 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#51a22e] to-[#65c939] rounded-t-2xl"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#51a22e]/10 text-[#51a22e]">
              <Pill className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#5b5b5b]">Medicine Breakdown</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-[#5b5b5b]/70">Investment</span>
              <span className="font-bold text-[#5b5b5b]">${medStats.investment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-[#5b5b5b]/70">Revenue</span>
              <span className="font-bold text-[#5b5b5b]">${medStats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#51a22e]/5 rounded-xl border border-[#51a22e]/20">
              <span className="text-sm font-bold text-[#51a22e]">Profit</span>
              <span className="font-black text-[#51a22e]">${medStats.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Cosmetics Breakdown */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/15 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-t-2xl"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#5b5b5b]">Cosmetics Breakdown</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-[#5b5b5b]/70">Investment</span>
              <span className="font-bold text-[#5b5b5b]">${cosStats.investment.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-[#5b5b5b]/70">Revenue</span>
              <span className="font-bold text-[#5b5b5b]">${cosStats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-sm font-bold text-purple-600">Profit</span>
              <span className="font-black text-purple-600">${cosStats.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Top Profitable Items ────────────────────── */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#5b5b5b]">Top Profitable Items</h3>
            <p className="text-xs text-[#5b5b5b]/50">Highest realized profit for {selectedYear} EC</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Qty Sold</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Investment</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Revenue</th>
                <th className="px-6 py-4 text-xs font-black text-[#51a22e] uppercase tracking-wider text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProfitable.length > 0 ? topProfitable.map((item, i) => (
                <tr key={`${item.source}-${item.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${item.source === 'Medicine' ? 'bg-[#51a22e]/10 text-[#51a22e]' : 'bg-purple-100 text-purple-500'}`}>
                        {item.source === 'Medicine' ? <Pill className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#5b5b5b]">{item.itemName}</p>
                        <p className="text-[10px] text-gray-400">{item.itemCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-[#5b5b5b]">
                      {item.quantityIssued}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-500 text-right">
                    ${item.investment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#5b5b5b] text-right">
                    ${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-[#51a22e] text-right bg-[#51a22e]/5">
                    ${item.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400 font-medium">
                    No transactions found for this fiscal year.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Archive & Delete Actions ──────────────── */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-[#5b5b5b] mb-1">Year-End Operations</h3>
        <p className="text-xs text-[#5b5b5b]/60 mb-6">Export data for your records, or clear old data to keep the system fast.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={exportCSV}
            disabled={yearFilteredItems.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-[#51a22e]/30 text-[#51a22e] rounded-xl font-bold hover:bg-[#51a22e]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Download className="w-5 h-5" />
            Export Year {selectedYear} as CSV
          </button>

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors shadow-sm"
            >
              <Trash2 className="w-5 h-5" />
              Clear {selectedYear} Data
            </button>
          )}
        </div>
      </div>

      {/* ─── Delete Confirmation Modal ─────────────── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up relative">
            <div className="absolute top-4 right-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mb-4 text-red-500 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-center text-[#5b5b5b] mb-2">Delete Fiscal Year {selectedYear}?</h3>
              <p className="text-sm text-center text-gray-500 mb-6">
                This will permanently delete all medicine and cosmetics received in the EC year {selectedYear}. Ensure you have exported the data first.
                {totalStats.stockValue > 0 && (
                  <span className="block mt-2 font-bold text-red-500">
                    Warning: There is still ${totalStats.stockValue.toLocaleString()} in unsold stock value for this year!
                  </span>
                )}
              </p>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Type "{selectedYear}" to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={selectedYear.toString()}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 text-center font-bold text-lg"
                />
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteYear}
                  disabled={deleteConfirmText !== selectedYear.toString() || isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-red-500/20 flex items-center justify-center"
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transaction;
