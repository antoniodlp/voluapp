import React, { useState } from 'react';
import { 
  format, 
  isSameMonth, 
  isSameYear, 
  addMonths, 
} from 'date-fns';
import { es } from 'date-fns/locale/es';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ClipboardCheck,
  AlertCircle,
  Search,
  History,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { AttendanceRecord, VolunteerProfile, UserRole } from '../types';

interface AttendanceViewProps {
  currentUser: VolunteerProfile;
  volunteers: VolunteerProfile[];
  attendances: AttendanceRecord[];
  onCheckIn: (date: string) => void;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ 
  currentUser, 
  volunteers, 
  attendances, 
  onCheckIn 
}) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingMonth, setViewingMonth] = useState(new Date());
  const [copied, setCopied] = useState(false);
  
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  const userAttendances = attendances.filter(a => a.volunteerId === currentUser.id);
  const alreadyCheckedIn = userAttendances.some(a => a.date === selectedDate);

  const displayAttendances = (isAdmin ? attendances : userAttendances)
    .filter(a => {
      if (isAdmin && searchTerm) {
        const vol = volunteers.find(v => v.id === a.volunteerId);
        if (!vol?.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      }
      const recordDate = new Date(a.date);
      return isSameMonth(recordDate, viewingMonth) && isSameYear(recordDate, viewingMonth);
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const getVolunteer = (id: string) => volunteers.find(v => v.id === id);
  
  // Generamos una URL que incluya el hash #check-in para que App.tsx lo detecte al cargar
  const qrCheckInUrl = `${window.location.origin}${window.location.pathname}${window.location.search}#check-in`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrCheckInUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Asistencia</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Fecha del Turno</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" />
            </div>

            <button 
              onClick={() => !alreadyCheckedIn && onCheckIn(selectedDate)}
              disabled={alreadyCheckedIn}
              className={`w-full py-8 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all active:scale-95 ${alreadyCheckedIn ? 'bg-green-50 text-green-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              <ClipboardCheck size={36} />
              <span className="text-xl font-black">{alreadyCheckedIn ? 'Registrado' : 'Marcar Entrada'}</span>
            </button>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
            <h4 className="font-black text-slate-800 text-sm flex items-center gap-2"><QrCode size={18} /> Check-In vía QR</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Copia este enlace para crear un código QR. Al escanearlo (estando logueado), se marcará la asistencia de hoy automáticamente.</p>
            <div className="flex gap-2">
              <input readOnly value={qrCheckInUrl} className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-400 overflow-hidden text-ellipsis" />
              <button onClick={handleCopyLink} className={`p-2.5 rounded-lg text-white transition-all flex-shrink-0 ${copied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800">Historial de Registros</h3>
            {isAdmin && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm w-40 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <button onClick={() => setViewingMonth(addMonths(viewingMonth, -1))} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><ChevronLeft size={24} /></button>
            <span className="text-base font-black text-slate-800 tracking-tight uppercase">{format(viewingMonth, 'MMMM yyyy', { locale: es })}</span>
            <button onClick={() => setViewingMonth(addMonths(viewingMonth, 1))} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><ChevronRight size={24} /></button>
          </div>

          <div className="space-y-4">
            {displayAttendances.length === 0 ? (
              <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-200 text-center text-sm font-bold text-slate-400">
                No hay registros este mes
              </div>
            ) : (
              displayAttendances.map(record => {
                const vol = getVolunteer(record.volunteerId);
                return (
                  <div key={record.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-5">
                      <img src={vol?.photoUrl} className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-50" alt={vol?.name} />
                      <div>
                        <p className="text-sm font-black text-slate-800">{isAdmin ? vol?.name : format(new Date(record.date), 'MMMM do', { locale: es })}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                          {format(new Date(record.timestamp), 'hh:mm a')}
                          {isAdmin && ` • ${format(new Date(record.date), 'd MMM', { locale: es })}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full">
                       <CheckCircle2 size={14} />
                       <span className="text-[10px] font-black uppercase tracking-wider">Presente</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;