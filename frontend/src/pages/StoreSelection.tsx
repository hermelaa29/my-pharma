import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Plus,
  MapPin,
  LogOut,
  Activity,
  User as UserIcon,
  Shield,
  Loader2,
  X,
  ChevronRight,
  Calendar,
  FileText,
  Users,
  UserMinus,
  Settings,
  Check
} from 'lucide-react';

interface PharmacyStore {
  id: string;
  name: string;
  address?: string | null;
  description?: string | null;
  createdAt: string;
  createdBy: { id: string; name: string; email: string };
}

interface Coworker {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  assignedStores: { id: string; name: string }[];
}

const StoreSelection: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Stores State
  const [stores, setStores] = useState<PharmacyStore[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Coworkers State (Admin only)
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [loadingCoworkers, setLoadingCoworkers] = useState(false);

  // Create Store Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', description: '' });

  // Assign Stores Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCoworker, setSelectedCoworker] = useState<Coworker | null>(null);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoadingStores(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/stores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load stores.');
      setStores(data.stores);
    } catch (err: any) {
      setFetchError(err.message || 'Connection error.');
    } finally {
      setLoadingStores(false);
    }
  }, [token]);

  const fetchCoworkers = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    setLoadingCoworkers(true);
    try {
      const res = await fetch('/api/users/coworkers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCoworkers(data.coworkers);
    } catch (err) {
      console.error('Failed to load coworkers:', err);
    } finally {
      setLoadingCoworkers(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchStores();
    fetchCoworkers();
  }, [fetchStores, fetchCoworkers]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.errors ? data.errors.join(', ') : (data.error || 'Failed to create store.');
        throw new Error(errMsg);
      }
      setStores(prev => [data.store, ...prev]);
      setShowCreateModal(false);
      setFormData({ name: '', address: '', description: '' });
    } catch (err: any) {
      setCreateError(err.message || 'Creation failed.');
    } finally {
      setCreating(false);
    }
  };

  const handleStoreClick = (storeId: string) => {
    navigate(`/dashboard/${storeId}`);
  };

  const handleRemoveCoworker = async (coworkerId: string) => {
    if (!window.confirm('Are you sure you want to permanently revoke access for this coworker?')) return;
    try {
      const res = await fetch(`/api/users/${coworkerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCoworkers(prev => prev.filter(c => c.id !== coworkerId));
      } else {
        alert('Failed to revoke access.');
      }
    } catch (err) {
      alert('Error revoking access.');
    }
  };

  const openAssignModal = (coworker: Coworker) => {
    setSelectedCoworker(coworker);
    setSelectedStoreIds(new Set(coworker.assignedStores.map(s => s.id)));
    setShowAssignModal(true);
  };

  const toggleStoreSelection = (storeId: string) => {
    const next = new Set(selectedStoreIds);
    if (next.has(storeId)) next.delete(storeId);
    else next.add(storeId);
    setSelectedStoreIds(next);
  };

  const handleAssignStores = async () => {
    if (!selectedCoworker) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/users/${selectedCoworker.id}/stores`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeIds: Array.from(selectedStoreIds) }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoworkers(prev => prev.map(c => c.id === selectedCoworker.id ? data.coworker : c));
        setShowAssignModal(false);
      } else {
        alert('Failed to update assignments.');
      }
    } catch (err) {
      alert('Error updating assignments.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#51a22e]/15 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#51a22e]/10 border border-[#51a22e]/25 flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#51a22e]" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#5b5b5b]">
              Pharma<span className="text-[#51a22e]">Vault</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-[#51a22e]" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-[#5b5b5b] leading-tight">{user?.name}</p>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${user?.role === 'ADMIN' ? 'text-[#51a22e]' : 'text-gray-400'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-white hover:bg-red-50 border border-gray-200 text-gray-400 hover:text-red-500 transition-all cursor-pointer shadow-sm"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Page body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* === PHARMACY STORES SECTION === */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#51a22e] uppercase tracking-widest mb-1">
                {user?.role === 'ADMIN' ? 'Admin Portal' : 'Store Access'}
              </p>
              <h1 className="text-3xl font-extrabold text-[#5b5b5b] tracking-tight">
                Your Pharmacy Stores
              </h1>
              <p className="text-sm text-[#5b5b5b]/60 mt-1">
                {user?.role === 'ADMIN'
                  ? 'Manage and access your pharmacy locations. Click a store to open its dashboard.'
                  : 'Select a store below to access its dashboard. If you don\'t see your store, contact your Admin.'}
              </p>
            </div>

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#51a22e] hover:bg-[#418225] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-[0_0_20px_rgba(81,162,46,0.3)] transition-all duration-200 active:scale-[0.97] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Store
              </button>
            )}
          </div>

          {loadingStores && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-8 h-8 text-[#51a22e] animate-spin" />
              <p className="text-sm text-[#5b5b5b]/60">Loading your stores…</p>
            </div>
          )}

          {fetchError && !loadingStores && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              <X className="w-5 h-5 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {!loadingStores && !fetchError && (
            <div className="flex flex-wrap gap-6">
              {stores.map(store => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store.id)}
                  className="group relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#51a22e]/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#51a22e] to-[#65c939] rounded-t-2xl" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#51a22e]/20 transition-colors">
                          <Store className="w-5 h-5 text-[#51a22e]" />
                        </div>
                        <div>
                          <h2 className="font-bold text-[#5b5b5b] text-base leading-tight group-hover:text-[#51a22e] transition-colors">
                            {store.name}
                          </h2>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
                            Pharmacy Store
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#51a22e] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                    </div>

                    {store.address && (
                      <div className="flex items-start gap-2 mb-3 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-[#51a22e]/60 flex-shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </div>
                    )}

                    {store.description && (
                      <div className="flex items-start gap-2 mb-3 text-xs text-gray-500">
                        <FileText className="w-3.5 h-3.5 text-[#51a22e]/60 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{store.description}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(store.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Shield className="w-3 h-3 text-[#51a22e]/50" />
                        <span>by {store.createdBy.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {stores.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-16 text-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="w-20 h-20 rounded-2xl bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center">
                    <Store className="w-9 h-9 text-[#51a22e]/50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#5b5b5b]">No stores yet</h3>
                    <p className="text-sm text-[#5b5b5b]/50 mt-1">
                      {user?.role === 'ADMIN'
                        ? 'Create your first pharmacy store using the button above.'
                        : 'You have not been assigned to any pharmacy stores yet. Please contact an admin.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* === COWORKER MANAGEMENT SECTION (ADMIN ONLY) === */}
        {user?.role === 'ADMIN' && (
          <section className="pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-[#5b5b5b] tracking-tight flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#51a22e]" />
                  Coworker Management
                </h2>
                <p className="text-sm text-[#5b5b5b]/60 mt-1">
                  Assign coworkers to multiple stores or revoke their access to the system.
                </p>
              </div>
            </div>

            {loadingCoworkers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#51a22e] animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {coworkers.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-[#5b5b5b] font-medium">No coworkers registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-4">Coworker</th>
                          <th className="px-6 py-4">Assigned Stores</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {coworkers.map(cw => (
                          <tr key={cw.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#51a22e]/10 text-[#51a22e] flex items-center justify-center font-bold text-xs">
                                  {cw.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#5b5b5b]">{cw.name}</p>
                                  <p className="text-xs text-gray-500">{cw.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {cw.assignedStores.length > 0 ? (
                                  cw.assignedStores.map(store => (
                                    <span key={store.id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#d9ead3] text-[#51a22e] border border-[#51a22e]/20">
                                      {store.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-red-400 italic">No stores assigned</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openAssignModal(cw)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#51a22e]/10 hover:bg-[#51a22e]/20 text-[#51a22e] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                  Assign Stores
                                </button>
                                <button
                                  onClick={() => handleRemoveCoworker(cw.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  Revoke
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* === MODALS === */}

      {/* Create Store Modal — ADMIN only */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-[#51a22e]" />
                </div>
                <div>
                  <h2 className="font-bold text-[#5b5b5b] text-base">New Pharmacy Store</h2>
                  <p className="text-xs text-gray-400">Fill in the details below to create a store</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateStore} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                  Store Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. LifeCare Pharmacy — Main Branch"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-[#5b5b5b] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 focus:border-[#51a22e] transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                  Address <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123 Main Street, Addis Ababa"
                  value={formData.address}
                  onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-[#5b5b5b] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 focus:border-[#51a22e] transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#51a22e] uppercase tracking-wider">
                  Description <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  placeholder="Short description of this pharmacy location…"
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-[#5b5b5b] placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#51a22e]/40 focus:border-[#51a22e] transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-[#5b5b5b] text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.name.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#51a22e] hover:bg-[#418225] text-white text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97]"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Create Store</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Stores Modal — ADMIN only */}
      {showAssignModal && selectedCoworker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowAssignModal(false); }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-[#51a22e]" />
                </div>
                <div>
                  <h2 className="font-bold text-[#5b5b5b] text-base">Assign Stores</h2>
                  <p className="text-xs text-gray-400">For {selectedCoworker.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-3">
              {stores.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No stores available to assign.</p>
              ) : (
                stores.map(store => (
                  <label key={store.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedStoreIds.has(store.id) ? 'bg-[#51a22e]/5 border-[#51a22e]/30' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedStoreIds.has(store.id) ? 'bg-[#51a22e] border-[#51a22e]' : 'bg-white border-gray-300'}`}>
                        {selectedStoreIds.has(store.id) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-sm font-semibold text-[#5b5b5b]">{store.name}</span>
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedStoreIds.has(store.id)}
                      onChange={() => toggleStoreSelection(store.id)}
                    />
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-3 p-6 pt-2 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-[#5b5b5b] text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStores}
                disabled={assigning}
                className="flex-1 py-2.5 rounded-xl bg-[#51a22e] hover:bg-[#418225] text-white text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97]"
              >
                {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Assignments'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSelection;
