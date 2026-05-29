import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import {
  Bell, AlertTriangle, Pill, Sparkles, Loader2, CheckCircle, Clock, XCircle, Search
} from 'lucide-react';

interface ItemAlert {
  id: string;
  itemCode: string;
  itemName: string;
  category: string | null;
  expireDate: string | null;
  currentQuantity: number;
  batchNumber: string | null;
  source: 'Medicine' | 'Cosmetic';
  monthsLeft: number;
  status: 'expired' | 'critical' | 'warning';
}

function computeMonthsLeft(expireDate: string): number {
  const now = new Date();
  const exp = new Date(expireDate);
  return (exp.getFullYear() - now.getFullYear()) * 12 + (exp.getMonth() - now.getMonth());
}

const Notification: React.FC = () => {
  const { token } = useAuth();
  const { storeId } = useParams<{ storeId: string }>();

  const [alerts, setAlerts] = useState<ItemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'Medicine' | 'Cosmetic'>('all');

  useEffect(() => {
    if (!storeId || !token) return;

    const fetchAlerts = async () => {
      try {
        const [medRes, cosRes] = await Promise.all([
          fetch(`/api/stores/${storeId}/medicines`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/stores/${storeId}/cosmetics`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const medData = await medRes.json();
        const cosData = await cosRes.json();

        const flagged: ItemAlert[] = [];

        // Process medicines
        for (const m of (medData.medicines ?? [])) {
          if (!m.expireDate) continue;
          const ml = computeMonthsLeft(m.expireDate);
          if (ml > 3) continue; // Only show items within 3 months or expired
          flagged.push({
            id: m.id,
            itemCode: m.itemCode,
            itemName: m.itemName,
            category: m.category,
            expireDate: m.expireDate,
            currentQuantity: m.currentQuantity,
            batchNumber: m.batchNumber,
            source: 'Medicine',
            monthsLeft: ml,
            status: ml <= 0 ? 'expired' : ml <= 1 ? 'critical' : 'warning',
          });
        }

        // Process cosmetics
        for (const c of (cosData.cosmetics ?? [])) {
          if (!c.expireDate) continue;
          const ml = computeMonthsLeft(c.expireDate);
          if (ml > 3) continue;
          flagged.push({
            id: c.id,
            itemCode: c.itemCode,
            itemName: c.itemName,
            category: c.category,
            expireDate: c.expireDate,
            currentQuantity: c.currentQuantity,
            batchNumber: c.batchNumber,
            source: 'Cosmetic',
            monthsLeft: ml,
            status: ml <= 0 ? 'expired' : ml <= 1 ? 'critical' : 'warning',
          });
        }

        // Sort: expired first, then by months left ascending
        flagged.sort((a, b) => a.monthsLeft - b.monthsLeft);
        setAlerts(flagged);
      } catch (e) {
        console.error('Error fetching alerts:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [storeId, token]);

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (filterSource !== 'all' && a.source !== filterSource) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return a.itemName.toLowerCase().includes(q) || a.itemCode.toLowerCase().includes(q) || (a.category ?? '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [alerts, filterSource, searchTerm]);

  const expiredCount = alerts.filter(a => a.status === 'expired').length;
  const criticalCount = alerts.filter(a => a.status === 'critical').length;
  const warningCount = alerts.filter(a => a.status === 'warning').length;

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-6">
      
      {/* ─── Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#51a22e]/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center shadow-sm relative">
            <Bell className="w-6 h-6 text-[#51a22e]" />
            {alerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black shadow-md">
                {alerts.length > 99 ? '99+' : alerts.length}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#5b5b5b] tracking-tight">Notifications</h2>
            <p className="text-[#5b5b5b]/60 text-sm mt-1">Items that are expired or expiring within 3 months.</p>
          </div>
        </div>
      </div>

      {/* ─── Summary Pills ──────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 shadow-sm">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-red-600">{expiredCount} Expired</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold text-orange-600">{criticalCount} Critical (≤1 month)</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-amber-600">{warningCount} Warning (≤3 months)</span>
        </div>
        {alerts.length === 0 && !loading && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#51a22e]/5 border border-[#51a22e]/20 shadow-sm">
            <CheckCircle className="w-4 h-4 text-[#51a22e]" />
            <span className="text-xs font-bold text-[#51a22e]">All Clear — No alerts</span>
          </div>
        )}
      </div>

      {/* ─── Filters ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, code, or category…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#51a22e]/30 focus:border-[#51a22e]/40 font-medium text-[#5b5b5b] placeholder:text-gray-300"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'Medicine', 'Cosmetic'] as const).map(src => (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                filterSource === src
                  ? 'bg-[#51a22e] text-white border-[#51a22e] shadow-md shadow-[#51a22e]/20'
                  : 'bg-white text-[#5b5b5b]/60 border-gray-200 hover:border-[#51a22e]/30 hover:text-[#51a22e]'
              }`}
            >
              {src === 'all' ? 'All' : src === 'Medicine' ? '🩺 Medicine' : '💄 Cosmetics'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Loading ────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#51a22e] animate-spin" />
            <p className="text-sm font-semibold text-[#5b5b5b]/50">Scanning inventory…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-white/50 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#51a22e]/5 flex items-center justify-center mb-4 text-[#51a22e]">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#5b5b5b]">
            {alerts.length === 0 ? 'No Alerts Found' : 'No Matching Results'}
          </h3>
          <p className="text-[#5b5b5b]/60 mt-2 max-w-md">
            {alerts.length === 0 
              ? 'All items in your inventory have safe expiration dates. Great job!'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        /* ─── Alert List ────────────────────────────── */
        <div className="space-y-3">
          {filtered.map(alert => (
            <div
              key={`${alert.source}-${alert.id}`}
              className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border shadow-sm hover:shadow-md transition-all ${
                alert.status === 'expired' ? 'border-red-200 border-l-4 border-l-red-500'
                : alert.status === 'critical' ? 'border-orange-200 border-l-4 border-l-orange-500'
                : 'border-amber-200 border-l-4 border-l-amber-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 flex-shrink-0 p-2 rounded-lg ${
                    alert.source === 'Medicine' ? 'bg-[#51a22e]/10 text-[#51a22e]' : 'bg-purple-100 text-purple-500'
                  }`}>
                    {alert.source === 'Medicine' ? <Pill className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-[#51a22e]">{alert.itemCode}</span>
                      <span className="text-gray-200 text-xs">|</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        alert.source === 'Medicine' 
                          ? 'bg-[#51a22e]/10 text-[#51a22e] border border-[#51a22e]/20'
                          : 'bg-purple-50 text-purple-500 border border-purple-200'
                      }`}>
                        {alert.source}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#5b5b5b] mt-0.5 truncate">{alert.itemName}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[#5b5b5b]/40 font-medium">
                      {alert.category && <span>📂 {alert.category}</span>}
                      {alert.batchNumber && <span>🏷️ {alert.batchNumber}</span>}
                      <span>📦 Qty: {alert.currentQuantity}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status */}
                <div className="flex items-center gap-3 flex-shrink-0 self-start sm:self-center">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Expires</p>
                    <p className="text-xs font-bold text-[#5b5b5b]">
                      {alert.expireDate ? new Date(alert.expireDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    alert.status === 'expired' ? 'bg-red-100 text-red-600'
                    : alert.status === 'critical' ? 'bg-orange-100 text-orange-600'
                    : 'bg-amber-100 text-amber-600'
                  }`}>
                    {alert.status === 'expired' ? (
                      <><XCircle className="w-3 h-3" /> Expired</>
                    ) : alert.status === 'critical' ? (
                      <><AlertTriangle className="w-3 h-3" /> {alert.monthsLeft}m left</>
                    ) : (
                      <><Clock className="w-3 h-3" /> {alert.monthsLeft}m left</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;
