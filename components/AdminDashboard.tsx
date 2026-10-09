import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Mail, 
  Phone, 
  AlertCircle, 
  UserCheck, 
  UserX, 
  Clock, 
  Edit2, 
  Filter, 
  Eye, 
  EyeOff, 
  Users,
  Power,
  MapPin,
  Tag,
  ShieldCheck,
  User,
  Search,
  CalendarDays,
  Bell,
  Plus,
  Trash2,
  Megaphone
} from 'lucide-react';
import { VolunteerProfile, UserStatus, UserRole, VolunteerType, Announcement } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

interface AdminDashboardProps {
  volunteers: VolunteerProfile[];
  announcements: Announcement[];
  onUpdateStatus: (id: string, status: UserStatus) => void;
  onEditVolunteer: (volunteer: VolunteerProfile) => void;
  onDeleteVolunteer: (id: string) => void;
  onAddAnnouncement: (msg: string) => void;
  onToggleAnnouncement: (id: string, status: 'published' | 'hidden') => void;
  onDeleteAnnouncement: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  volunteers, 
  announcements,
  onUpdateStatus, 
  onEditVolunteer,
  onDeleteVolunteer,
  onAddAnnouncement,
  onToggleAnnouncement,
  onDeleteAnnouncement
}) => {
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [volunteerToDelete, setVolunteerToDelete] = useState<VolunteerProfile | null>(null);
  
  const pending = volunteers.filter(v => v.status === UserStatus.PENDING);
  const managed = volunteers.filter(v => {
    const isApproved = v.status === UserStatus.APPROVED;
    const isRejected = v.status === UserStatus.REJECTED;
    const matchesStatus = showInactive ? (isApproved || isRejected) : isApproved;
    const matchesName = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesName;
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    onAddAnnouncement(newAnnouncement.trim());
    setNewAnnouncement('');
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Administración</h2>
          <p className="text-slate-500 text-base font-medium">Gestión global del sistema y avisos</p>
        </div>
      </div>

      {/* Avisos Management Section */}
      <section className="space-y-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Megaphone size={28} /></div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">Gestión de Avisos</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Comunicación directa con el equipo</p>
          </div>
        </div>

        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <textarea 
            placeholder="Escribe un nuevo aviso para toda la comunidad..." 
            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl font-medium outline-none focus:border-indigo-600 transition-all min-h-[120px]"
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
            >
              <Plus size={20} /> Publicar Aviso
            </button>
          </div>
        </form>

        <div className="space-y-4 pt-6 border-t border-slate-50">
          {announcements.length === 0 ? (
            <p className="text-center py-10 text-slate-400 font-bold italic">No hay avisos registrados</p>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className={`p-6 rounded-2xl border flex items-center justify-between gap-6 transition-all ${ann.status === 'published' ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${ann.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {ann.status === 'published' ? 'Publicado' : 'Oculto'}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      {format(new Date(ann.publishedAt), "d MMM, yyyy", { locale: es })}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{ann.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onToggleAnnouncement(ann.id, ann.status === 'published' ? 'hidden' : 'published')}
                    className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    title={ann.status === 'published' ? 'Ocultar' : 'Publicar'}
                  >
                    {ann.status === 'published' ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button 
                    onClick={() => onDeleteAnnouncement(ann.id)}
                    className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><AlertCircle size={28} /></div>
          <h3 className="text-2xl font-black text-slate-800">Nuevas Solicitudes</h3>
        </div>
        {pending.length === 0 ? (
          <div className="bg-slate-50/50 p-12 rounded-3xl border border-dashed border-slate-200 text-center text-sm font-bold text-slate-400">
            Todas las solicitudes han sido procesadas
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map(volunteer => (
              <div key={volunteer.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
                <img src={volunteer.photoUrl} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-50" alt={volunteer.name} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 text-lg truncate">{volunteer.name}</h4>
                  <p className="text-sm text-slate-400 font-bold truncate mb-2">{volunteer.email}</p>
                  <span className="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">{volunteer.volunteerType}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => onUpdateStatus(volunteer.id, UserStatus.APPROVED)} className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm" title="Aprobar"><Check size={24} /></button>
                  <button onClick={() => onUpdateStatus(volunteer.id, UserStatus.REJECTED)} className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm" title="Rechazar"><X size={24} /></button>
                  <button onClick={() => setVolunteerToDelete(volunteer)} className="p-3 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm" title="Eliminar Permanentemente"><Trash2 size={24} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Users size={28} /></div>
            <h3 className="text-2xl font-black text-slate-800">Directorio del Equipo</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="Buscar por nombre..." 
                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl w-full font-bold outline-none focus:border-indigo-600"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setShowInactive(!showInactive)} className="px-6 py-3.5 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 transition-all">
              {showInactive ? 'Ocultar Inactivos' : 'Ver Todo'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b">
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Miembro</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {managed.map(volunteer => (
                  <tr key={volunteer.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={volunteer.photoUrl} className="w-14 h-14 rounded-xl object-cover" />
                        <div>
                          <p className="text-base font-black text-slate-800">{volunteer.name}</p>
                          <span className="text-xs text-slate-400 font-bold uppercase">{volunteer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEditVolunteer(volunteer)} className="p-3 bg-white border text-slate-400 hover:text-indigo-600 rounded-xl transition-all" title="Editar">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => setVolunteerToDelete(volunteer)} className="p-3 bg-white border text-slate-400 hover:text-red-600 rounded-xl transition-all" title="Eliminar">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Custom Confirmation Modal */}
      {volunteerToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                <Trash2 size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">¿Eliminar Miembro?</h3>
                <p className="text-slate-500 font-medium mt-2">
                  Estás a punto de eliminar a <span className="font-black text-slate-900">{volunteerToDelete.name}</span>. 
                  Esta acción borrará permanentemente su perfil, turnos y registros de asistencia.
                </p>
              </div>
              <div className="w-full grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => setVolunteerToDelete(null)}
                  className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    onDeleteVolunteer(volunteerToDelete.id);
                    setVolunteerToDelete(null);
                  }}
                  className="py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;