import React, { useState } from 'react';
import { 
  format, 
  addWeeks, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  getDay,
  isToday
} from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar, Trash2, Edit2, CalendarDays, Sun, Moon, MapPin } from 'lucide-react';
import { Shift, VolunteerProfile, ShiftPeriod } from '../types';

interface ShiftCalendarProps {
  shifts: Shift[];
  volunteers: VolunteerProfile[];
  currentUser: VolunteerProfile;
  onAddShift: (shift: Omit<Shift, 'id' | 'volunteerId'>) => void;
  onUpdateShift: (id: string, updated: Partial<Shift>) => void;
  onRemoveShift: (shiftId: string) => void;
  onViewVolunteer?: (v: VolunteerProfile) => void;
}

const ShiftCalendar: React.FC<ShiftCalendarProps> = ({ 
  shifts, 
  volunteers,
  currentUser, 
  onAddShift, 
  onUpdateShift,
  onRemoveShift,
  onViewVolunteer
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  
  const [selectedPeriod, setSelectedPeriod] = useState<ShiftPeriod>('MORNING');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const weekStart = (() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getShiftsForDay = (day: Date, period?: ShiftPeriod) => {
    const dayOfWeek = getDay(day);
    return shifts.filter(s => 
      s.daysOfWeek.includes(dayOfWeek) && 
      (!period || s.period === period)
    );
  };

  const handleOpenAdd = () => {
    setEditingShiftId(null);
    setSelectedPeriod('MORNING');
    setSelectedDays([getDay(new Date())]);
    setShowModal(true);
  };

  const handleOpenEdit = (shift: Shift) => {
    setEditingShiftId(shift.id);
    setSelectedPeriod(shift.period);
    setSelectedDays([...shift.daysOfWeek]);
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedDays.length === 0) {
      alert("Por favor, selecciona al menos un día.");
      return;
    }
    if (editingShiftId) {
      onUpdateShift(editingShiftId, { period: selectedPeriod, daysOfWeek: selectedDays });
    } else {
      onAddShift({ period: selectedPeriod, daysOfWeek: selectedDays });
    }
    setShowModal(false);
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const dayNamesShort = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const dayNamesMid = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Horario Semanal</h2>
          <p className="text-slate-500 font-medium text-base">Asignaciones de voluntarios para esta semana</p>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setCurrentDate(addWeeks(currentDate, -1))} 
            className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
          >
            <ChevronLeft size={22} />
          </button>
          <span className="px-6 font-bold min-w-[220px] text-center text-slate-800 text-sm">
            {format(weekStart, 'd MMM', { locale: es })} – {format(weekEnd, 'd MMM, yyyy', { locale: es })}
          </span>
          <button 
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))} 
            className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const morningShifts = getShiftsForDay(day, 'MORNING');
          const afternoonShifts = getShiftsForDay(day, 'AFTERNOON');
          const isTodayDate = isToday(day);

          return (
            <div 
              key={idx} 
              className={`flex flex-col rounded-[2rem] border transition-all ${
                isTodayDate 
                  ? 'bg-indigo-50/30 border-indigo-200 shadow-lg shadow-indigo-100/50 ring-2 ring-indigo-500/20' 
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className={`p-4 text-center border-b ${isTodayDate ? 'border-indigo-100' : 'border-slate-100'}`}>
                <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-1 ${isTodayDate ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {format(day, 'EEE', { locale: es })}
                </p>
                <p className={`text-2xl font-black ${isTodayDate ? 'text-indigo-700' : 'text-slate-800'}`}>
                  {format(day, 'd')}
                </p>
              </div>

              <div className="flex-1 p-3 space-y-4 min-h-[220px]">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <Sun size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600/60">Mañana</span>
                  </div>
                  <div className="space-y-1.5">
                    {morningShifts.length === 0 ? (
                      <div className="py-2 text-center text-[9px] font-bold text-slate-300 italic">Vacío</div>
                    ) : (
                      morningShifts.map(s => {
                        const vol = volunteers.find(v => v.id === s.volunteerId);
                        return (
                          <button 
                            key={s.id} 
                            onClick={() => vol && onViewVolunteer?.(vol)}
                            title={vol?.name}
                            className="w-full bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-100/70 transition-all text-left group"
                          >
                            <img src={vol?.photoUrl} className="w-6 h-6 rounded-full object-cover group-hover:ring-2 ring-blue-400" alt="" />
                            <div className="flex-1 min-w-0">
                               <span className="text-[11px] font-bold text-blue-700 truncate block">{vol?.name}</span>
                               {vol?.area && <span className="text-[8px] font-medium text-blue-500/70 truncate block">{vol.area}</span>}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <Moon size={14} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600/60">Tarde</span>
                  </div>
                  <div className="space-y-1.5">
                    {afternoonShifts.length === 0 ? (
                      <div className="py-2 text-center text-[9px] font-bold text-slate-300 italic">Vacío</div>
                    ) : (
                      afternoonShifts.map(s => {
                        const vol = volunteers.find(v => v.id === s.volunteerId);
                        return (
                          <button 
                            key={s.id} 
                            onClick={() => vol && onViewVolunteer?.(vol)}
                            title={vol?.name}
                            className="w-full bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl flex items-center gap-2 hover:bg-amber-100/70 transition-all text-left group"
                          >
                            <img src={vol?.photoUrl} className="w-6 h-6 rounded-full object-cover group-hover:ring-2 ring-amber-400" alt="" />
                            <div className="flex-1 min-w-0">
                               <span className="text-[11px] font-bold text-amber-700 truncate block">{vol?.name}</span>
                               {vol?.area && <span className="text-[8px] font-medium text-amber-500/70 truncate block">{vol.area}</span>}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Mis Compromisos Recurrentes</h3>
              <p className="text-base text-slate-500 font-medium">Gestiona tu disponibilidad semanal</p>
            </div>
            <button 
              onClick={handleOpenAdd} 
              className="group flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 font-bold text-sm"
            >
              <Plus size={22} className="group-hover:rotate-90 transition-transform" /> 
              Actualizar Mi Horario
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {shifts.filter(s => s.volunteerId === currentUser.id).length === 0 ? (
              <div className="col-span-full p-16 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                  <CalendarDays size={36} />
                </div>
                <h4 className="font-bold text-slate-800 mb-1 text-lg">Sin horario definido</h4>
                <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">Añade un bloque recurrente por la mañana o tarde para ayudar a la comunidad.</p>
              </div>
            ) : (
              shifts.filter(s => s.volunteerId === currentUser.id).map(shift => (
                <div key={shift.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${
                      shift.period === 'MORNING' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <Clock size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xl">
                        {shift.period === 'MORNING' ? 'Turno de Mañana' : 'Turno de Tarde'}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {shift.daysOfWeek.sort().map(d => (
                          <span key={d} className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">
                            {dayNamesMid[d]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleOpenEdit(shift)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={20} /></button>
                    <button onClick={() => onRemoveShift(shift.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
              <Calendar size={140} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-1">Resumen Semanal</h3>
              <p className="text-slate-400 text-base font-medium mb-8">Capacidad para esta semana</p>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-black text-indigo-400 tracking-tighter">
                  {shifts.reduce((acc, s) => acc + s.daysOfWeek.length, 0)}
                </span>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Total</p>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Turnos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <h3 className="text-3xl font-black text-slate-900 mb-2">{editingShiftId ? 'Editar Horario' : 'Nuevo Horario'}</h3>
            <p className="text-slate-500 font-medium mb-10 text-base">Elige tus bloques recurrentes de disponibilidad.</p>
            
            <div className="space-y-8">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Días de la Semana</label>
                <div className="grid grid-cols-7 gap-2">
                  {[0,1,2,3,4,5,6].map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`h-11 rounded-2xl font-black text-xs transition-all border-2 ${
                        selectedDays.includes(d) 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                      }`}
                    >
                      {dayNamesShort[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Período Preferido</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setSelectedPeriod('MORNING')} 
                    className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all group ${
                      selectedPeriod === 'MORNING' 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-lg shadow-indigo-50' 
                        : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${selectedPeriod === 'MORNING' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white'}`}>
                      <Sun size={24} />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest">Mañana</span>
                  </button>
                  <button 
                    onClick={() => setSelectedPeriod('AFTERNOON')} 
                    className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all group ${
                      selectedPeriod === 'AFTERNOON' 
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-lg shadow-indigo-50' 
                        : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${selectedPeriod === 'AFTERNOON' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white'}`}>
                      <Moon size={24} />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest">Tarde</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-5 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {editingShiftId ? 'Actualizar' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftCalendar;