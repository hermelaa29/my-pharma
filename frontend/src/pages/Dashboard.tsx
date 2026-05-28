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
  const { user, token, logout } = useAuth();
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

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

  // Return empty page if user is not resolved yet
  if (!user) return null;

  // Static mock stats for pharmacy overview
  const stats = [
    { label: 'Today\'s Sales', value: '$2,845.50', icon: DollarSign, change: '+12.5%', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
    { label: 'Active Prescriptions', value: '48 Queue', icon: Pill, change: '12 urgent', color: 'from-emerald-500/20 to-brand-500/20 text-teal-400' },
    { label: 'Inventory Items', value: '1,280 SKUs', icon: ClipboardCheck, change: '4 low stock', color: 'from-brand-500/20 to-teal-500/20 text-brand-400' },
    { label: 'Staff Logged In', value: '6 Active', icon: Users, change: '2 admins', color: 'from-emerald-500/20 to-brand-700/20 text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-[#d9ead3] text-[#5b5b5b] relative overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#51a22e05_1px,transparent_1px),linear-gradient(to_bottom,#51a22e05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Main Top Header */}
      <header className="border-b border-[#51a22e]/15 bg-white/70 backdrop-blur-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Back + Brand + Store Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/stores')}
              className="p-2 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200 text-gray-400 hover:text-[#51a22e] transition-all cursor-pointer"
              title="Back to Stores"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#51a22e]/10 border border-[#51a22e]/25 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#51a22e]" />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-base tracking-tight text-[#5b5b5b]">
                  Pharma<span className="text-[#51a22e]">Vault</span>
                </span>
                {storeData && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#5b5b5b]/50 font-medium">
                    <Store className="w-2.5 h-2.5" />
                    <span>{storeData.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-4">
            
            {/* User Profile Badge */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center text-[#51a22e]">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-[#5b5b5b] leading-tight">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {user.role === 'ADMIN' ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#51a22e]/10 text-[#51a22e] border border-[#51a22e]/20 uppercase tracking-wider">
                      <Shield className="w-2 h-2 mr-0.5" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-400 border border-gray-200 uppercase tracking-wider">
                      Coworker
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-white hover:bg-red-50 border border-gray-200 text-gray-400 hover:text-red-500 transition-all cursor-pointer shadow-sm"
              title="Logout Session"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>

        </div>
      </header>

      {/* Main Core Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 space-y-8">
        
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
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5b5b5b]/50 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-sm self-start sm:self-center">
            <Calendar className="w-4 h-4 text-[#51a22e]" />
            <span>Last Sync: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white glass-card-hover rounded-2xl p-6 border border-gray-200 shadow-sm transition-all duration-300 relative overflow-hidden group">
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
              <div className="bg-white rounded-2xl p-6 border border-[#51a22e]/20 shadow-sm relative overflow-hidden space-y-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#51a22e] to-[#65c939] rounded-t-2xl"></div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
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
                  
                  <div className="p-4 rounded-xl bg-[#d9ead3]/60 border border-[#51a22e]/15">
                    <p className="text-xs font-semibold text-[#5b5b5b]/50">System Admin Capacity</p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-2xl font-black text-[#5b5b5b]">2 / 2 Admins</span>
                      <span className="text-[10px] font-bold text-[#51a22e] bg-[#51a22e]/10 px-2 py-0.5 rounded border border-[#51a22e]/20 uppercase">
                        Max Capacity
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-[#51a22e] h-full w-full rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-[#5b5b5b]/40 mt-2">
                      Constraint Active: Database prevents registration of a 3rd Admin.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#d9ead3]/60 border border-[#51a22e]/15">
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
                      <button key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#d9ead3]/50 hover:bg-[#51a22e]/10 border border-gray-200 hover:border-[#51a22e]/30 text-[#5b5b5b] hover:text-[#51a22e] text-left text-sm font-semibold transition-all cursor-pointer">
                        <div className="w-2 h-2 rounded-full bg-[#51a22e]"></div>
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            ) : (

              /* COWORKER WORKSPACE PANEL */
              <div className="bg-white rounded-2xl p-6 border border-[#51a22e]/20 shadow-sm relative overflow-hidden space-y-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#51a22e] to-[#65c939] rounded-t-2xl"></div>
                
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
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
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#d9ead3]/40 border border-gray-200 gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#51a22e]">{rx.id}</span>
                            <span className="text-gray-300 text-xs">|</span>
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
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
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
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-[#5b5b5b] uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#51a22e]" /> System Broadcasts
                </h3>
                <span className="w-2 h-2 rounded-full bg-[#51a22e] animate-pulse"></span>
              </div>
              
              <div className="space-y-3.5">
                
                <div className="p-3 bg-[#51a22e]/5 rounded-xl border border-[#51a22e]/10 space-y-1">
                  <p className="text-xs font-bold text-[#51a22e]">Strict Safety Checklists</p>
                  <p className="text-xs text-[#5b5b5b]/50 leading-relaxed">
                    Always confirm patient identity and double-check prescriptions dosage metrics prior to dispensing any items.
                  </p>
                </div>

                <div className="p-3 bg-[#d9ead3]/60 rounded-xl border border-[#51a22e]/10 space-y-1">
                  <p className="text-xs font-bold text-[#51a22e]">Role Capability Details</p>
                  <ul className="text-[11px] text-[#5b5b5b]/50 space-y-1 list-disc list-inside">
                    <li>Admins: Audit logs &amp; configs</li>
                    <li>Coworkers: Dispense &amp; register items</li>
                    <li>Both: Account management</li>
                  </ul>
                </div>

              </div>

            </div>

            {/* Profile snapshot information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#51a22e]/5 to-transparent pointer-events-none"></div>
              
              <div className="w-16 h-16 rounded-full bg-[#51a22e]/10 border border-[#51a22e]/25 flex items-center justify-center text-[#51a22e] mx-auto mb-4">
                <UserIcon className="w-8 h-8" />
              </div>
              
              <h4 className="text-lg font-bold text-[#5b5b5b]">{user.name}</h4>
              <p className="text-xs text-[#5b5b5b]/50 mt-1">{user.email}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-around text-left">
                <div>
                  <span className="block text-[10px] font-bold text-[#5b5b5b]/40 uppercase">System Role</span>
                  <span className="text-xs font-bold text-[#51a22e] mt-0.5 block">{user.role}</span>
                </div>
                <div className="border-l border-gray-100"></div>
                <div>
                  <span className="block text-[10px] font-bold text-[#5b5b5b]/40 uppercase">Active Status</span>
                  <span className="text-xs font-bold text-[#51a22e] mt-0.5 block">Online</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;
