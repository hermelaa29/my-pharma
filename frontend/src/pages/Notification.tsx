import React from 'react';
import { Bell } from 'lucide-react';

const Notification: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center gap-4 border-b border-[#51a22e]/20 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#51a22e]/10 border border-[#51a22e]/20 flex items-center justify-center shadow-sm">
          <Bell className="w-6 h-6 text-[#51a22e]" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-[#5b5b5b] tracking-tight">System Notifications</h2>
          <p className="text-[#5b5b5b]/60 text-sm mt-1">View alerts, low-stock warnings, and system announcements.</p>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-white/50 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
          <Bell className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#5b5b5b]">Notification Module Ready</h3>
        <p className="text-[#5b5b5b]/60 mt-2 max-w-md">This page is correctly routed. You can build out the notification inbox functionality here.</p>
      </div>
    </div>
  );
};

export default Notification;
