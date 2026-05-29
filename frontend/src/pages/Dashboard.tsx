import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import {
  Pill, Sparkles, Users, Shield, Calendar, Bell, Activity,
  TrendingUp, AlertTriangle, Package, Loader2, UserCheck
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StockStats {
  totalItems: number;
  totalQty: number;
  totalPurchaseValue: number;
  redFlaggedCount: number;
}

interface DashboardData {
  store: { id: string; name: string; address?: string | null; description?: string | null; createdBy: { id: string; name: string; email: string } };
  team: TeamMember[];
  medicineStats: StockStats;
  cosmeticStats: StockStats;
  totalRedFlagged: number;
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { storeId } = useParams<{ storeId: string }>();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId || !token) return;
    fetch(`/api/stores/${storeId}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId, token]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#51a22e] animate-spin" />
          <p className="text-sm font-semibold text-[#5b5b5b]/50">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const medicineStats = data?.medicineStats ?? { totalItems: 0, totalQty: 0, totalPurchaseValue: 0, redFlaggedCount: 0 };
  const cosmeticStats = data?.cosmeticStats ?? { totalItems: 0, totalQty: 0, totalPurchaseValue: 0, redFlaggedCount: 0 };
  const team = data?.team ?? [];
  const totalRedFlagged = data?.totalRedFlagged ?? 0;
  const storeName = data?.store?.name ?? 'Dashboard';
  const storeAddress = data?.store?.address;

  const admins = team.filter(t => t.role === 'ADMIN');
  const coworkers = team.filter(t => t.role === 'COWORKER');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
        
      {/* ─── Welcome Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5b5b5b] tracking-tight">
            {storeName}
          </h2>
          <p className="text-[#5b5b5b]/60 text-sm mt-1">
            Welcome back, {user.name}. Here is an overview of your store.
          </p>
          {storeAddress && (
            <p className="text-xs text-[#51a22e] mt-0.5 font-medium">📍 {storeAddress}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5b5b5b]/50 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm self-start sm:self-center">
          <Calendar className="w-4 h-4 text-[#51a22e]" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* ─── Stock Overview Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Medicine Stock */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm transition-all duration-300 relative overflow-hidden group hover:shadow-md">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#51a22e]/5 rounded-full blur-2xl group-hover:bg-[#51a22e]/10 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#5b5b5b]/60">Medicine Stock</span>
              <div className="p-2.5 rounded-xl bg-[#51a22e]/10 flex items-center justify-center border border-[#51a22e]/20">
                <Pill className="w-5 h-5 text-[#51a22e]" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <h3 className="text-3xl font-extrabold text-[#5b5b5b] tracking-tight">{medicineStats.totalItems.toLocaleString()}</h3>
              <p className="text-[11px] text-[#5b5b5b]/40 font-bold uppercase tracking-wider">Total Items Registered</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Total Qty</p>
                  <p className="text-lg font-black text-[#5b5b5b]">{medicineStats.totalQty.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Purchase Value</p>
                  <p className="text-sm font-extrabold text-[#51a22e] flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3" />
                    ${medicineStats.totalPurchaseValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cosmetics Stock */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm transition-all duration-300 relative overflow-hidden group hover:shadow-md">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#5b5b5b]/60">Cosmetics Stock</span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <h3 className="text-3xl font-extrabold text-[#5b5b5b] tracking-tight">{cosmeticStats.totalItems.toLocaleString()}</h3>
              <p className="text-[11px] text-[#5b5b5b]/40 font-bold uppercase tracking-wider">Total Items Registered</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Total Qty</p>
                  <p className="text-lg font-black text-[#5b5b5b]">{cosmeticStats.totalQty.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Purchase Value</p>
                  <p className="text-sm font-extrabold text-purple-500 flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3" />
                    ${cosmeticStats.totalPurchaseValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Overview */}
        <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 border shadow-sm transition-all duration-300 relative overflow-hidden group hover:shadow-md ${
          totalRedFlagged > 0 ? 'border-red-200' : 'border-white/50'
        }`}>
          <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl transition-colors ${
            totalRedFlagged > 0 ? 'bg-red-500/5 group-hover:bg-red-500/10' : 'bg-gray-500/5 group-hover:bg-gray-500/10'
          }`}></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#5b5b5b]/60">Expiry Alerts</span>
              <div className={`p-2.5 rounded-xl flex items-center justify-center border ${
                totalRedFlagged > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${totalRedFlagged > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <h3 className={`text-3xl font-extrabold tracking-tight ${totalRedFlagged > 0 ? 'text-red-500' : 'text-[#5b5b5b]'}`}>
                {totalRedFlagged}
              </h3>
              <p className="text-[11px] text-[#5b5b5b]/40 font-bold uppercase tracking-wider">
                Items Expired or Expiring Soon
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Pill className="w-3 h-3 text-[#51a22e]" />
                  <span className="text-xs font-bold text-[#5b5b5b]">{medicineStats.redFlaggedCount} Medicine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span className="text-xs font-bold text-[#5b5b5b]">{cosmeticStats.redFlaggedCount} Cosmetics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Team & Operations ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Team Panel (2 cols) */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-[#51a22e]/15 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#51a22e] to-[#65c939] rounded-t-2xl"></div>
          
          <div className="flex items-center justify-between border-b border-gray-100/50 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#51a22e]/10 text-[#51a22e]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#5b5b5b]">Store Team</h3>
                <p className="text-xs text-[#5b5b5b]/50">{team.length} member{team.length !== 1 ? 's' : ''} with access to this store</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#51a22e]/10 text-[#51a22e] text-[10px] font-extrabold rounded-lg border border-[#51a22e]/20 uppercase tracking-wider">
              <UserCheck className="w-3 h-3" />
              {team.length} Active
            </div>
          </div>

          {/* Admins Section */}
          {admins.length > 0 && (
            <div className="mb-6">
              <h4 className="text-[11px] font-black text-[#51a22e] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Administrators ({admins.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-[#51a22e]/5 to-transparent border border-[#51a22e]/15 hover:border-[#51a22e]/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#51a22e]/15 border border-[#51a22e]/25 flex items-center justify-center text-[#51a22e] flex-shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#5b5b5b] truncate">{admin.name}</p>
                      <p className="text-[11px] text-[#5b5b5b]/40 truncate">{admin.email}</p>
                    </div>
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-[#51a22e]/10 text-[#51a22e] border border-[#51a22e]/20 uppercase tracking-wider flex-shrink-0">
                      Admin
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coworkers Section */}
          {coworkers.length > 0 && (
            <div>
              <h4 className="text-[11px] font-black text-[#5b5b5b]/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Coworkers ({coworkers.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coworkers.map(cw => (
                  <div key={cw.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-[#51a22e]/20 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#5b5b5b] truncate">{cw.name}</p>
                      <p className="text-[11px] text-[#5b5b5b]/40 truncate">{cw.email}</p>
                    </div>
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wider flex-shrink-0">
                      Coworker
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {team.length === 0 && (
            <div className="text-center py-8 text-sm text-[#5b5b5b]/40">
              No team members found for this store.
            </div>
          )}
        </div>

        {/* Right sidebar: Quick Info */}
        <div className="space-y-6">
          
          {/* Store Info */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100/50 pb-3">
              <h3 className="text-sm font-bold text-[#5b5b5b] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#51a22e]" />
                Store Overview
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#51a22e] animate-pulse"></span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#51a22e]/5 rounded-xl border border-[#51a22e]/10">
                <p className="text-[10px] font-bold text-[#51a22e] uppercase tracking-wider mb-1">Store Name</p>
                <p className="text-sm font-bold text-[#5b5b5b]">{storeName}</p>
              </div>
              {storeAddress && (
                <div className="p-3 bg-[#d9ead3]/40 rounded-xl border border-[#51a22e]/10">
                  <p className="text-[10px] font-bold text-[#51a22e] uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm font-bold text-[#5b5b5b]">{storeAddress}</p>
                </div>
              )}
              {data?.store?.description && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-xs text-[#5b5b5b]/60 leading-relaxed">{data.store.description}</p>
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Created By</p>
                <p className="text-sm font-bold text-[#5b5b5b]">{data?.store?.createdBy?.name ?? '—'}</p>
                <p className="text-[10px] text-[#5b5b5b]/40">{data?.store?.createdBy?.email ?? ''}</p>
              </div>
            </div>
          </div>

          {/* Alerts Summary */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100/50 pb-3">
              <h3 className="text-sm font-bold text-[#5b5b5b] uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#51a22e]" />
                Notifications
              </h3>
              {totalRedFlagged > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black">
                  {totalRedFlagged > 9 ? '9+' : totalRedFlagged}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              {totalRedFlagged > 0 ? (
                <>
                  {medicineStats.redFlaggedCount > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <Pill className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-red-600">{medicineStats.redFlaggedCount} Medicine{medicineStats.redFlaggedCount > 1 ? 's' : ''}</p>
                        <p className="text-[10px] text-red-400">Expired or expiring within 3 months</p>
                      </div>
                    </div>
                  )}
                  {cosmeticStats.redFlaggedCount > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <Sparkles className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-red-600">{cosmeticStats.redFlaggedCount} Cosmetic{cosmeticStats.redFlaggedCount > 1 ? 's' : ''}</p>
                        <p className="text-[10px] text-red-400">Expired or expiring within 3 months</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-[#51a22e]/5 rounded-xl border border-[#51a22e]/10 text-center">
                  <p className="text-xs font-bold text-[#51a22e]">✓ All Clear</p>
                  <p className="text-[10px] text-[#5b5b5b]/40 mt-1">No expiring items detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Role Badge */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              user.role === 'ADMIN' ? 'bg-[#51a22e]/10 text-[#51a22e] border border-[#51a22e]/20' : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
              {user.role === 'ADMIN' ? <Shield className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-sm font-bold text-[#5b5b5b]">{user.name}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1 ${
                user.role === 'ADMIN' 
                  ? 'bg-[#51a22e]/10 text-[#51a22e] border border-[#51a22e]/20' 
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
