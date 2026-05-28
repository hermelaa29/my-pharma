import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Shield, Users, Pill, DollarSign, Calendar, ClipboardCheck, Bell, Activity, Store, ArrowLeft, Loader2 } from 'lucide-react';

/**
 * Dashboard Page Component.
 * Presents a modern glassmorphic dashboard showcasing real-time analytics widgets.
 * Renders role-specific operations panel differences (Admin vs. Coworker).
 */
const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { storeId } = useParams<{ storeId: string }>();

  const [storeData, setStoreData] = useState<{ name: string; address?: string | null } | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    if (!storeId || !token) return;
    fetch(`/api/stores`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const found = data.stores?.find((s: any) => s.id === storeId);
        if (found) setStoreData({ name: found.name, address: found.address });
      })
      .catch(() => {})
      .finally(() => setLoadingStore(false));
  }, [storeId, token]);

  if (!user) return null;

  // Static mock stats for pharmacy overview
  const stats = [
    { label: 'Today\'s Sales', value: '$2,845.50', icon: DollarSign, change: '+12.5%', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
    { label: 'Active Prescriptions', value: '48 Queue', icon: Pill, change: '12 urgent', color: 'from-emerald-500/20 to-brand-500/20 text-teal-400' },
    { label: 'Inventory Items', value: '1,280 SKUs', icon: ClipboardCheck, change: '4 low stock', color: 'from-brand-500/20 to-teal-500/20 text-brand-400' },
    { label: 'Staff Logged In', value: '6 Active', icon: Users, change: '2 admins', color: 'from-emerald-500/20 to-brand-700/20 text-emerald-400' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
        
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5b5b5b] tracking-tight">
            {storeData ? storeData.name : 'Dashboard Overview'}
          </h2>
          <p className="text-[#5b5b5b]/60 text-sm mt-1">
            Welcome back, {user.name}. Here is what is happening{storeData ? ` at ${storeData.name}` : ' at PharmaVault'} today.
          </p>
          {storeData?.address && (
            <p className="text-xs text-[#51a22e] mt-0.5 font-medium">📍 {storeData.address}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5b5b5b]/50 bg-white/60 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm self-start sm:self-center">
          <Calendar className="w-4 h-4 text-[#51a22e]" />
          <span>Last Sync: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-sm glass-card-hover rounded-2xl p-6 border border-white/50 shadow-sm transition-all duration-300 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#5b5b5b]/60">{stat.label}</span>
              <div className={`p-2.5 rounded-xl bg-[#51a22e]/10 flex items-center justify-center border border-[#51a22e]/20`}>
                <stat.icon className="w-5 h-5 text-[#51a22e]" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-extrabold text-[#5b5b5b] tracking-tight">{stat.value}</h3>
              <p className="text-xs text-[#51a22e] font-semibold flex items-center gap-1">
                <span>{stat.change}</span>
                <span className="text-[#5b5b5b]/40 font-normal">since yesterday</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Role panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main workspace (takes up 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ROLE-SPECIFIC WORKSPACE */}
          {user.role === 'ADMIN' ? (
            
            /* ADMIN WORKSPACE PANEL */
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-[#51a22e]/20 shadow-sm relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#51a22e] to-[#65c939] rounded-t-2xl"></div>
              <div className="flex items-center justify-between border-b border-gray-100/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#51a22e]/10 text-[#51a22e]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#5b5b5b]">Administrative Operations Console</h3>
                    <p className="text-xs text-[#5b5b5b]/50">High-level store configuration and security metrics</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#51a22e]/10 text-[#51a22e] border border-[#51a22e]/20 uppercase tracking-widest">
                  Admin Active
                </span>
              </div>

              {/* Database Metrics and capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#d9ead3]/40 border border-[#51a22e]/15">
                  <p className="text-xs font-semibold text-[#5b5b5b]/50">System Admin Capacity</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-[#5b5b5b]">2 / 2 Admins</span>
                    <span className="text-[10px] font-bold text-[#51a22e] bg-[#51a22e]/10 px-2 py-0.5 rounded border border-[#51a22e]/20 uppercase">
                      Max Capacity
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/50 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-[#51a22e] h-full w-full rounded-full"></div>
                  </div>
                  <p className="text-[10px] text-[#5b5b5b]/40 mt-2">
                    Constraint Active: Database prevents registration of a 3rd Admin.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#d9ead3]/40 border border-[#51a22e]/15">
                  <p className="text-xs font-semibold text-[#5b5b5b]/50">System Health Status</p>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-[#5b5b5b]">Operational</span>
                    <span className="inline-flex w-2.5 h-2.5 bg-[#51a22e] rounded-full animate-ping"></span>
                  </div>
                  <p className="text-[10px] text-[#5b5b5b]/40 mt-5">
                    PostgreSQL Connection &amp; Prisma ORM actively synced.
                  </p>
                </div>
              </div>

              {/* Audit Actions checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#51a22e] uppercase tracking-wider">
                  Executive Store Operations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Manage Pharmacy Store Inventory', 'Audit Staff & Access Permissions', 'Configure Drug Master List', 'View Financial Sales Audits'].map((action, i) => (
                    <button key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-[#51a22e]/5 border border-gray-100 hover:border-[#51a22e]/30 text-[#5b5b5b] hover:text-[#51a22e] text-left text-sm font-semibold transition-all cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-[#51a22e]"></div>
                      <span>{action}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          ) : (

            /* COWORKER WORKSPACE PANEL */
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-[#51a22e]/20 shadow-sm relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#51a22e] to-[#65c939] rounded-t-2xl"></div>
              
              <div className="flex items-center justify-between border-b border-gray-100/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#51a22e]/10 text-[#51a22e]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#5b5b5b]">Coworker Operations Workspace</h3>
                    <p className="text-xs text-[#5b5b5b]/50">Manage prescription fulfillments and daily shifts</p>
                  </div>
                </div>
              </div>

              {/* Standard staff duties grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#51a22e] uppercase tracking-wider">
                  Active Fulfillments Queue
                </h4>
                
                <div className="space-y-2">
                  {[
                    { id: 'RX-9402', patient: 'Arthur Pendragon', drug: 'Amoxicillin 500mg', status: 'Pending Review', color: 'text-amber-600 bg-amber-50 border-amber-200' },
                    { id: 'RX-8104', patient: 'Morgana Le Fay', drug: 'Metformin 850mg', status: 'Ready to Dispense', color: 'text-[#51a22e] bg-[#51a22e]/5 border-[#51a22e]/20' },
                    { id: 'RX-7729', patient: 'Guinevere Smith', drug: 'Lisinopril 10mg', status: 'In Process', color: 'text-sky-600 bg-sky-50 border-sky-200' }
                  ].map((rx, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white border border-gray-100 hover:border-[#51a22e]/20 transition-colors gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#51a22e]">{rx.id}</span>
                          <span className="text-gray-200 text-xs">|</span>
                          <span className="text-xs font-semibold text-[#5b5b5b]">{rx.patient}</span>
                        </div>
                        <p className="text-sm font-bold text-[#5b5b5b] mt-1">{rx.drug}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider self-start sm:self-center ${rx.color}`}>
                        {rx.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Standard Shared Component: General Operations Logs */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#5b5b5b]">General Pharmacy Log Feed</h3>
            <div className="space-y-3">
              {[
                { time: '14:22', text: 'Admin initialized daily backup sequence', role: 'ADMIN', user: 'System' },
                { time: '13:05', text: 'Prescription RX-8104 marked as Ready', role: 'COWORKER', user: 'Sarah Connor' },
                { time: '11:40', text: 'Low stock notification flagged for Ibuprofen 400mg', role: 'SYSTEM', user: 'Inventory Bot' }
              ].map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 text-sm border-l-2 border-[#51a22e]/30 pl-4 py-1">
                  <span className="text-[#5b5b5b]/40 text-xs font-medium font-mono mt-0.5">{log.time}</span>
                  <div>
                    <p className="text-[#5b5b5b] font-semibold">{log.text}</p>
                    <p className="text-[10px] text-[#5b5b5b]/40 mt-0.5">
                      Triggered by {log.user} ({log.role})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar details (takes up 1 column) */}
        <div className="space-y-8">
          
          {/* System Notifications sidebar panel */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100/50 pb-3">
              <h3 className="text-sm font-bold text-[#5b5b5b] uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#51a22e]" /> System Broadcasts
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#51a22e] animate-pulse"></span>
            </div>
            
            <div className="space-y-3.5">
              <div className="p-3 bg-[#51a22e]/5 rounded-xl border border-[#51a22e]/10 space-y-1">
                <p className="text-xs font-bold text-[#51a22e]">Strict Safety Checklists</p>
                <p className="text-xs text-[#5b5b5b]/60 leading-relaxed">
                  Always confirm patient identity and double-check prescriptions dosage metrics prior to dispensing any items.
                </p>
              </div>

              <div className="p-3 bg-[#d9ead3]/40 rounded-xl border border-[#51a22e]/10 space-y-1">
                <p className="text-xs font-bold text-[#51a22e]">Role Capability Details</p>
                <ul className="text-[11px] text-[#5b5b5b]/60 space-y-1 list-disc list-inside">
                  <li>Admins: Audit logs &amp; configs</li>
                  <li>Coworkers: Dispense &amp; register items</li>
                  <li>Both: Account management</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
