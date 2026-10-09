
import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  UserCircle, 
  LogOut, 
  LayoutDashboard,
  Heart,
  Menu,
  X,
  ClipboardCheck,
  Bell,
  Info
} from 'lucide-react';
import { UserRole, UserStatus, Announcement } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  role: UserRole;
  status: UserStatus;
  userName: string;
  announcements?: Announcement[];
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  onLogout, 
  role,
  status,
  userName,
  announcements = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = role === UserRole.ADMIN;
  const isApproved = status === UserStatus.APPROVED || isAdmin;

  const navItems = [
    ...(isAdmin ? [{ id: 'admin', label: 'Panel de Control', icon: LayoutDashboard }] : []),
    ...(isApproved ? [
      { id: 'calendar', label: 'Horario', icon: Calendar },
      { id: 'attendance', label: 'Asistencia', icon: ClipboardCheck },
      { id: 'volunteers', label: 'Comunidad', icon: Users },
    ] : []),
    { id: 'profile', label: 'Mi Perfil', icon: UserCircle },
  ];

  const currentNavItem = navItems.find(i => i.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-slate-600">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Heart size={20} fill="currentColor" />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tight hidden sm:block">VoluApp</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isApproved ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="text-sm font-bold text-slate-600 truncate max-w-[150px]">{userName}</span>
          </div>
          <button onClick={onLogout} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* Global Announcements Section */}
      {announcements.length > 0 && (
        <div className="bg-white border-b border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="max-w-6xl mx-auto px-6 py-4 space-y-3">
            {announcements.map((ann, idx) => (
              <div 
                key={ann.id} 
                className={`p-4 rounded-2xl flex items-start gap-4 transition-all ${
                  idx === 0 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${idx === 0 ? 'bg-white/20' : 'bg-indigo-200/50'}`}>
                  <Bell size={20} className={idx === 0 ? 'animate-bounce' : ''} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold leading-relaxed ${idx === 0 ? 'text-white' : 'text-indigo-900'}`}>{ann.message}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 opacity-60`}>
                    Publicado: {format(new Date(ann.publishedAt), "d 'de' MMMM", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[55] bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-[73px] left-0 bottom-0 w-80 bg-white z-[56] border-r border-slate-200 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <nav className="flex-1 p-6 space-y-2">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-3">Navegación</p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
                    activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="font-bold text-base">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      <main className="flex-1">
        <div className="max-w-6xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
