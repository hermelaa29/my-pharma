import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Pill,
  Sparkles,
  ArrowRightLeft,
  Bell,
  LogOut,
  User as UserIcon,
  Store,
  ArrowLeft,
  Activity,
  Shield,
  Menu,
  X
} from 'lucide-react';

const StoreLayout: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState<string>('Loading...');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch the store name for the sidebar
  useEffect(() => {
    if (!storeId || !token) return;
    fetch(`/api/stores`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const found = data.stores?.find((s: any) => s.id === storeId);
        if (found) setStoreName(found.name);
      })
      .catch(() => setStoreName('Pharmacy Store'));
  }, [storeId, token]);

  // Fetch notification count from the dashboard endpoint
  useEffect(() => {
    if (!storeId || !token) return;
    fetch(`/api/stores/${storeId}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (typeof data.totalRedFlagged === 'number') {
          setNotificationCount(data.totalRedFlagged);
        }
      })
      .catch(() => {});
  }, [storeId, token]);

  if (!user) return null;

  const navLinks = [
    { to: `/dashboard/${storeId}`, label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: `/dashboard/${storeId}/medicine`, label: 'Medicine', icon: Pill },
    { to: `/dashboard/${storeId}/cosmetics`, label: 'Cosmetics', icon: Sparkles },
    { to: `/dashboard/${storeId}/transaction`, label: 'Transaction', icon: ArrowRightLeft },
    { to: `/dashboard/${storeId}/notification`, label: 'Notification', icon: Bell, badge: notificationCount },
  ];

  return (
    <div className="min-h-screen bg-[#d9ead3] flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Background decorations for the entire layout */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#51a22e05_1px,transparent_1px),linear-gradient(to_bottom,#51a22e05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      {/* MOBILE HEADER (Visible only on small screens) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#51a22e]/15 h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#51a22e]/10 border border-[#51a22e]/25 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#51a22e]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#5b5b5b]">
            Pharma<span className="text-[#51a22e]">Vault</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:text-[#51a22e] hover:bg-[#51a22e]/10 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white/95 md:bg-white/80 backdrop-blur-md border-r border-[#51a22e]/15 
        flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#51a22e]/10 border border-[#51a22e]/25 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-[#51a22e]" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-lg tracking-tight text-[#5b5b5b] truncate">
                Pharma<span className="text-[#51a22e]">Vault</span>
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-[#5b5b5b]/50 font-medium truncate">
                <Store className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{storeName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Stores Button */}
        <div className="px-4 pt-4">
          <button
            onClick={() => navigate('/stores')}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-[#51a22e] hover:bg-[#51a22e]/5 transition-all cursor-pointer border border-transparent hover:border-[#51a22e]/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Stores
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={(link as any).exact}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative ${
                  isActive
                    ? 'bg-[#51a22e] text-white shadow-md shadow-[#51a22e]/20 translate-x-1'
                    : 'text-[#5b5b5b]/70 hover:bg-[#51a22e]/10 hover:text-[#51a22e]'
                }`
              }
            >
              <link.icon className={`w-5 h-5 ${'badge' in link && (link as any).badge > 0 ? 'animate-bounce' : ''}`} style={'badge' in link && (link as any).badge > 0 ? { animationDuration: '2s', animationIterationCount: 3 } : undefined} />
              {link.label}
              {'badge' in link && (link as any).badge > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-sm">
                  {(link as any).badge > 99 ? '99+' : (link as any).badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer: User Info & Logout */}
        <div className="p-4 border-t border-gray-100/50 bg-white/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center text-[#51a22e] flex-shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-[#5b5b5b] truncate">{user.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {user.role === 'ADMIN' ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#51a22e]/10 text-[#51a22e] border border-[#51a22e]/20 uppercase tracking-wider">
                    <Shield className="w-2 h-2 mr-0.5" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wider">
                    Coworker
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-bold text-sm transition-all shadow-sm cursor-pointer border border-red-100 hover:border-red-500"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 relative z-10 overflow-y-auto h-[calc(100vh-4rem)] md:h-screen scroll-smooth">
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default StoreLayout;
