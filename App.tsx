
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UserStatus, 
  UserRole, 
  VolunteerProfile, 
  Shift, 
  ShiftPeriod,
  VolunteerType,
  AttendanceRecord,
  Announcement
} from './types';
import Layout from './components/Layout';
import ShiftCalendar from './components/ShiftCalendar';
import AdminDashboard from './components/AdminDashboard';
import AttendanceView from './components/AttendanceView';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  where,
  getDocs,
  orderBy
} from '@firebase/firestore';
import { 
  format, 
  isSameMonth, 
  isValid,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  getYear,
  getMonth,
  startOfMonth
} from 'date-fns';
import { es } from 'date-fns/locale/es';
import { 
  Mail, 
  Phone, 
  Search,
  X,
  Camera,
  ImageIcon,
  Loader2,
  Clock,
  Edit2,
  Sun,
  Moon,
  Save,
  Users,
  AlertCircle,
  Calendar as CalendarIcon,
  MapPin,
  Briefcase,
  Activity,
  Instagram,
  Send,
  MessageCircle,
  ShieldCheck,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';

const ROLE_ORDER = [VolunteerType.VTP, VolunteerType.VTC, VolunteerType.BASE];
const STORAGE_KEY = 'voluapp_user_session';

// --- HELPER COMPONENTS ---

const startOfWeekManual = (date: Date, options?: { weekStartsOn?: number }) => {
  const d = new Date(date);
  const day = d.getDay();
  const weekStartsOn = options?.weekStartsOn ?? 0;
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatBirthday = (dateStr: string) => {
  if (!dateStr) return 'No especificado';
  const date = new Date(dateStr);
  return isValid(date) ? format(date, 'dd/MM/yyyy') : dateStr;
};

const sanitizePhone = (phone: string) => phone.replace(/\D/g, '');

const CustomDatePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label?: string;
}> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;
  const days = useMemo(() => {
    const start = startOfWeekManual(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const handleSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const years = Array.from({ length: 80 }, (_, i) => getYear(new Date()) - i);
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{label}</label>}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-base font-bold outline-none focus-within:border-indigo-500 transition-all cursor-pointer flex items-center justify-between"
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400 font-medium'}>
          {value ? formatBirthday(value) : 'dd/mm/yyyy'}
        </span>
        <CalendarIcon size={18} className="text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[110] w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 animate-in fade-in zoom-in duration-200 origin-top">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <select 
                value={getMonth(viewDate)} 
                onChange={(e) => {
                    const d = new Date(viewDate);
                    d.setMonth(parseInt(e.target.value));
                    setViewDate(d);
                }}
                className="bg-transparent font-black text-xs uppercase tracking-wider outline-none text-indigo-600"
              >
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select 
                value={getYear(viewDate)} 
                onChange={(e) => {
                    const d = new Date(viewDate);
                    d.setFullYear(parseInt(e.target.value));
                    setViewDate(d);
                }}
                className="bg-transparent font-black text-xs uppercase tracking-wider outline-none text-indigo-600"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-300 py-1">{d}</div>
              ))}
              {days.map((day, i) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, viewDate);
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(day)}
                    className={`h-8 w-8 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : isCurrentMonth ? 'text-slate-700 hover:bg-slate-50' : 'text-slate-200'
                    }`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ImageCapture: React.FC<{
  currentImage: string;
  onImageChange: (dataUrl: string) => void;
  label?: string;
  disabled?: boolean;
}> = ({ currentImage, onImageChange, label = "Foto de Perfil", disabled = false }) => {
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const resizeImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width, height = img.height;
        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resized = await resizeImage(reader.result as string);
        onImageChange(resized);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {label && <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>}
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          {isProcessing ? (
            <div className="w-full h-full rounded-2xl bg-slate-100 flex items-center justify-center border border-indigo-100"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
          ) : (
            <img src={currentImage || 'https://picsum.photos/seed/placeholder/200/200'} className="w-full h-full rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md" alt="Previsualización" />
          )}
        </div>
        {!disabled && (
          <div className="flex flex-col gap-2.5">
            <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all active:scale-95 shadow-md"><Camera size={16} /> Tomar Foto</button>
            <button type="button" onClick={() => libraryInputRef.current?.click()} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95"><ImageIcon size={16} /> Galería</button>
          </div>
        )}
      </div>
      <input type="file" ref={libraryInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="user" onChange={handleFileChange} />
    </div>
  );
};

const ProfileForm: React.FC<{
  formData: any;
  onChange: (updates: any) => void;
  isAdminEditing?: boolean;
}> = ({ formData, onChange, isAdminEditing }) => {
  const dayLabels = ['D','L','M','X','J','V','S'];
  const dayOrder = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ImageCapture currentImage={formData.photoUrl || ''} onImageChange={(url) => onChange({ photoUrl: url })} label="Foto de Perfil" />
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Nombre Completo</label>
            <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all" value={formData.name || ''} onChange={e => onChange({ name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Correo Electrónico</label>
            <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all" value={formData.email || ''} onChange={e => onChange({ email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2"><Instagram size={14} /> Usuario Instagram</label>
            <input placeholder="@usuario" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all" value={formData.instagram || ''} onChange={e => onChange({ instagram: e.target.value })} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Teléfono</label>
            <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all" value={formData.phone || ''} onChange={e => onChange({ phone: e.target.value })} />
          </div>
          <CustomDatePicker label="Cumpleaños" value={formData.birthday || ''} onChange={val => onChange({ birthday: val })} />
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2"><Send size={14} /> Usuario Telegram</label>
            <input placeholder="@usuario" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all" value={formData.telegram || ''} onChange={e => onChange({ telegram: e.target.value })} />
          </div>
          {isAdminEditing && (
            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2"><ShieldCheck size={14} /> Rol del Sistema</label>
                <div className="grid grid-cols-2 gap-3">
                  {[UserRole.VOLUNTEER, UserRole.ADMIN].map(r => (
                    <button key={r} type="button" onClick={() => onChange({ role: r })} className={`p-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${formData.role === r ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2"><Activity size={14} /> Estado de Cuenta</label>
                <div className="grid grid-cols-3 gap-2">
                  {[UserStatus.APPROVED, UserStatus.PENDING, UserStatus.REJECTED].map(s => (
                    <button key={s} type="button" onClick={() => onChange({ status: s })} className={`p-4 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${formData.status === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {s === UserStatus.APPROVED ? 'Activo' : s === UserStatus.PENDING ? 'Pend.' : 'Inact.'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="pt-8 border-t border-slate-100 space-y-6">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Briefcase size={18} className="text-indigo-600" /> Clasificación y Disponibilidad</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Tipo de Voluntario</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_ORDER.map(t => (
                <button key={t} type="button" onClick={() => onChange({ volunteerType: t })} className={`p-4 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${formData.volunteerType === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{t}</button>
              ))}
            </div>
            <input placeholder="Área (opcional)" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all mt-4" value={formData.area || ''} onChange={e => onChange({ area: e.target.value })} />
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sun size={14} className="text-blue-500" /> Turno de Mañana</label>
               <div className="grid grid-cols-7 gap-1.5">
                 {dayOrder.map(d => (
                   <button key={d} type="button" onClick={() => {
                     const days = formData.morningDays?.includes(d) ? formData.morningDays.filter((x: any) => x !== d) : [...(formData.morningDays || []), d];
                     onChange({ morningDays: days });
                   }} className={`h-9 rounded-xl font-black text-[10px] transition-all border-2 ${formData.morningDays?.includes(d) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{dayLabels[d]}</button>
                 ))}
               </div>
            </div>
            <div className="space-y-4">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Moon size={14} className="text-amber-500" /> Turno de Tarde</label>
               <div className="grid grid-cols-7 gap-1.5">
                 {dayOrder.map(d => (
                   <button key={d} type="button" onClick={() => {
                     const days = formData.afternoonDays?.includes(d) ? formData.afternoonDays.filter((x: any) => x !== d) : [...(formData.afternoonDays || []), d];
                     onChange({ afternoonDays: days });
                   }} className={`h-9 rounded-xl font-black text-[10px] transition-all border-2 ${formData.afternoonDays?.includes(d) ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{dayLabels[d]}</button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  const [currentUser, setCurrentUser] = useState<VolunteerProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'volunteers' | 'profile' | 'admin' | 'attendance'>('volunteers');
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerProfile | null>(null);
  const [viewingVolunteer, setViewingVolunteer] = useState<VolunteerProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const [communityFilter, setCommunityFilter] = useState<'ACTIVE' | 'INACTIVE' | 'ALL'>('ACTIVE');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', phone: '' });
  const [editForm, setEditForm] = useState<any>({});
  const [regForm, setRegForm] = useState<any>({
    name: '', email: '', phone: '', birthday: '', photoUrl: 'https://picsum.photos/seed/newmember/200/200', 
    volunteerType: VolunteerType.VTP, morningDays: [], afternoonDays: [], area: ''
  });

  useEffect(() => {
    if (currentUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(STORAGE_KEY);
  }, [currentUser]);

  useEffect(() => {
    if (!db) { setIsLoading(false); return; }
    const unsubVolunteers = onSnapshot(collection(db, "volunteers"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as VolunteerProfile));
      setVolunteers(data);
      if (currentUser) {
        const self = data.find(v => v.id === currentUser.id);
        if (self && JSON.stringify(self) !== JSON.stringify(currentUser)) setCurrentUser(self);
      }
      setIsLoading(false);
    });
    onSnapshot(collection(db, "shifts"), (snapshot) => setShifts(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Shift))));
    onSnapshot(collection(db, "attendances"), (snapshot) => setAttendances(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AttendanceRecord))));
    onSnapshot(query(collection(db, "announcements"), orderBy("publishedAt", "desc")), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Announcement)));
    });
  }, [currentUser?.id]);

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === UserRole.ADMIN) setActiveTab('admin');
      else if (currentUser.status === UserStatus.PENDING) setActiveTab('profile');
      else setActiveTab('volunteers');
    }
  }, [isLoading, currentUser?.id]);

  const handleAttendanceCheckIn = async (date: string) => {
    if (!currentUser) return;
    try { await addDoc(collection(db, "attendances"), { volunteerId: currentUser.id, date, timestamp: new Date().toISOString() }); }
    catch (e) { console.error(e); }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const user = volunteers.find(v => v.email.toLowerCase() === loginForm.email.trim().toLowerCase() && v.phone.trim() === loginForm.phone.trim());
    if (user) { 
      setCurrentUser(user); 
      setActiveTab(user.role === UserRole.ADMIN ? 'admin' : (user.status === UserStatus.APPROVED ? 'volunteers' : 'profile')); 
    } else setLoginError("Email o teléfono incorrectos.");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.phone) {
      setRegistrationMessage("Nombre, Email y Teléfono son obligatorios.");
      return;
    }
    
    try {
      const { morningDays, afternoonDays, ...profileData } = regForm;
      const docRef = await addDoc(collection(db, "volunteers"), {
        ...profileData,
        status: UserStatus.PENDING,
        role: UserRole.VOLUNTEER,
        joinedAt: new Date().toISOString()
      });

      // Guardar turnos si se seleccionaron
      if (morningDays.length > 0) await addDoc(collection(db, "shifts"), { volunteerId: docRef.id, daysOfWeek: morningDays, period: 'MORNING' });
      if (afternoonDays.length > 0) await addDoc(collection(db, "shifts"), { volunteerId: docRef.id, daysOfWeek: afternoonDays, period: 'AFTERNOON' });

      setRegistrationMessage("¡Solicitud enviada! Un administrador revisará tu perfil pronto.");
      setTimeout(() => {
        setIsRegistering(false);
        setRegistrationMessage(null);
      }, 3000);
    } catch (e) {
      console.error(e);
      setRegistrationMessage("Error al procesar el registro.");
    }
  };

  const startEditing = (volunteer: VolunteerProfile) => {
    const userShifts = shifts.filter(s => s.volunteerId === volunteer.id);
    const morningShift = userShifts.find(s => s.period === 'MORNING');
    const afternoonShift = userShifts.find(s => s.period === 'AFTERNOON');
    setEditForm({ ...volunteer, morningDays: morningShift?.daysOfWeek || [], afternoonDays: afternoonShift?.daysOfWeek || [] });
    if (volunteer.id === currentUser?.id) setIsEditingProfile(true);
    else setEditingVolunteer(volunteer);
  };

  const saveMemberChanges = async (targetId: string) => {
    try {
      const { morningDays, afternoonDays, ...profileData } = editForm;
      const cleanProfile: any = { ...profileData };
      delete cleanProfile.id; delete cleanProfile.joinedAt;
      await updateDoc(doc(db, "volunteers", targetId), cleanProfile);
      
      const shiftsRef = collection(db, "shifts");
      const q = query(shiftsRef, where("volunteerId", "==", targetId));
      const querySnap = await getDocs(q);
      const existingMorning = querySnap.docs.find(d => d.data().period === 'MORNING');
      const existingAfternoon = querySnap.docs.find(d => d.data().period === 'AFTERNOON');

      if (morningDays && morningDays.length > 0) {
        if (existingMorning) await updateDoc(doc(db, "shifts", existingMorning.id), { daysOfWeek: morningDays });
        else await addDoc(shiftsRef, { volunteerId: targetId, daysOfWeek: morningDays, period: 'MORNING' });
      } else if (existingMorning) await deleteDoc(doc(db, "shifts", existingMorning.id));

      if (afternoonDays && afternoonDays.length > 0) {
        if (existingAfternoon) await updateDoc(doc(db, "shifts", existingAfternoon.id), { daysOfWeek: afternoonDays });
        else await addDoc(shiftsRef, { volunteerId: targetId, daysOfWeek: afternoonDays, period: 'AFTERNOON' });
      } else if (existingAfternoon) await deleteDoc(doc(db, "shifts", existingAfternoon.id));

      setIsEditingProfile(false); setEditingVolunteer(null);
    } catch (e) { console.error(e); }
  };

  const handleDeleteVolunteer = async (id: string) => {
    try {
      // Delete volunteer profile
      await deleteDoc(doc(db, "volunteers", id));
      
      // Delete associated shifts
      const shiftsRef = collection(db, "shifts");
      const q = query(shiftsRef, where("volunteerId", "==", id));
      const querySnap = await getDocs(q);
      const deletePromises = querySnap.docs.map(d => deleteDoc(doc(db, "shifts", d.id)));
      await Promise.all(deletePromises);

      // Delete associated attendances
      const attendancesRef = collection(db, "attendances");
      const qAtt = query(attendancesRef, where("volunteerId", "==", id));
      const attSnap = await getDocs(qAtt);
      const attDeletePromises = attSnap.docs.map(d => deleteDoc(doc(db, "attendances", d.id)));
      await Promise.all(attDeletePromises);

      if (editingVolunteer?.id === id) setEditingVolunteer(null);
      if (viewingVolunteer?.id === id) setViewingVolunteer(null);
    } catch (e) {
      console.error("Error deleting volunteer:", e);
    }
  };

  const filteredVolunteers = useMemo(() => volunteers.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (communityFilter === 'ACTIVE') return v.status === UserStatus.APPROVED && matchesSearch;
    if (communityFilter === 'INACTIVE') return v.status === UserStatus.REJECTED && matchesSearch;
    return matchesSearch;
  }), [volunteers, searchTerm, communityFilter]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className={`w-full transition-all duration-500 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden ${isRegistering ? 'max-w-4xl' : 'max-w-md'}`}>
          <div className="bg-indigo-600 p-12 text-center relative">
            {isRegistering && (
              <button onClick={() => setIsRegistering(false)} className="absolute top-8 left-8 p-3 text-white/50 hover:text-white transition-all">
                <ArrowLeft size={24} />
              </button>
            )}
            <h1 className="text-4xl font-black text-white tracking-tighter">VoluApp</h1>
            <p className="text-indigo-100 font-bold mt-2 uppercase tracking-widest text-xs">Gestión de Voluntarios</p>
          </div>
          
          <div className="p-12">
            {isRegistering ? (
              <form onSubmit={handleRegister} className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-800">Solicitud de Registro</h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Paso 1: Información Personal</span>
                </div>
                {registrationMessage && (
                  <div className={`p-4 rounded-2xl text-sm font-bold text-center ${registrationMessage.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {registrationMessage}
                  </div>
                )}
                <ProfileForm 
                  formData={regForm} 
                  onChange={(upd: any) => setRegForm((prev: any) => ({...prev, ...upd}))} 
                  isAdminEditing={false}
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                  <PlusCircle size={20} /> Enviar Solicitud
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 text-center mb-8">Bienvenido</h2>
                {loginError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl">{loginError}</p>}
                <div className="space-y-4">
                  <input placeholder="Correo Electrónico" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
                  <input placeholder="Número de Teléfono" type="tel" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-600 transition-all" value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Acceder</button>
                <div className="pt-8 border-t border-slate-50 text-center">
                   <p className="text-slate-400 text-sm font-bold mb-4">¿No tienes una cuenta aún?</p>
                   <button type="button" onClick={() => setIsRegistering(true)} className="text-indigo-600 font-black uppercase tracking-widest text-xs hover:text-indigo-700 transition-colors">Solicitar Registro Aquí</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={(t: any) => setActiveTab(t)} 
      onLogout={() => setCurrentUser(null)} 
      role={currentUser.role} 
      status={currentUser.status} 
      userName={currentUser.name}
      announcements={announcements.filter(a => a.status === 'published')}
    >
      {activeTab === 'calendar' && (
        <ShiftCalendar 
          shifts={shifts.filter(s => volunteers.find(v => v.id === s.volunteerId)?.status === UserStatus.APPROVED)} 
          volunteers={volunteers} 
          currentUser={currentUser} 
          onAddShift={(d) => addDoc(collection(db, "shifts"), {...d, volunteerId: currentUser.id})} 
          onUpdateShift={(id, upd) => updateDoc(doc(db, "shifts", id), upd)} 
          onRemoveShift={(id) => deleteDoc(doc(db, "shifts", id))} 
          onViewVolunteer={setViewingVolunteer} 
        />
      )}
      {activeTab === 'attendance' && <AttendanceView currentUser={currentUser} volunteers={volunteers} attendances={attendances} onCheckIn={handleAttendanceCheckIn} />}
      {activeTab === 'volunteers' && (
        <div className="space-y-10">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black">Comunidad</h2>
            <div className="flex gap-4">
               <select value={communityFilter} onChange={(e: any) => setCommunityFilter(e.target.value)} className="p-4 bg-white border-2 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none">
                  <option value="ACTIVE">Activos</option>
                  <option value="INACTIVE">Inactivos</option>
                  <option value="ALL">Todos</option>
               </select>
               <input placeholder="Buscar miembro..." className="p-4 bg-white border-2 rounded-2xl w-64 outline-none focus:border-indigo-600" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredVolunteers.map(v => (
              <div key={v.id} onClick={() => currentUser.role === UserRole.ADMIN ? startEditing(v) : setViewingVolunteer(v)} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all">
                <img src={v.photoUrl} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50" />
                <div>
                  <h3 className="font-bold flex items-center gap-1.5 text-slate-800">{v.name} {v.role === UserRole.ADMIN && <ShieldCheck size={14} className="text-indigo-600" />}</h3>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">{v.volunteerType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto space-y-10">
           {currentUser.status === UserStatus.PENDING && (
             <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex items-start gap-4 animate-pulse">
                <div className="p-2 bg-amber-200 rounded-xl text-amber-700"><AlertCircle size={24} /></div>
                <div>
                   <h4 className="font-black text-amber-900">Perfil Pendiente de Aprobación</h4>
                   <p className="text-sm text-amber-700 font-medium">Tu solicitud está siendo revisada por los administradores. Tendrás acceso total pronto.</p>
                </div>
             </div>
           )}
           <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl space-y-10 border border-slate-100">
             <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end border-b border-slate-100 pb-10 gap-6">
               <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                 <img src={currentUser.photoUrl} className="w-32 h-32 rounded-[2.5rem] object-cover ring-8 ring-indigo-50 shadow-lg" />
                 <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight">{currentUser.name}</h2>
                   <p className="text-indigo-600 font-black uppercase text-xs tracking-[0.3em] mt-2 flex items-center justify-center sm:justify-start gap-2">
                     <ShieldCheck size={14} /> {currentUser.role}
                   </p>
                 </div>
               </div>
               <button onClick={() => isEditingProfile ? saveMemberChanges(currentUser.id) : startEditing(currentUser)} className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 ${isEditingProfile ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'}`}>
                 {isEditingProfile ? <><Save size={20} /> Guardar Cambios</> : <><Edit2 size={20} /> Editar Mi Perfil</>}
               </button>
             </div>
             {isEditingProfile ? (
               <ProfileForm formData={editForm} onChange={(upd: any) => setEditForm((prev: any) => ({...prev, ...upd}))} isAdminEditing={currentUser.role === UserRole.ADMIN} />
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contacto Directo</label>
                       <div className="space-y-3">
                         <div className="flex items-center gap-3 font-bold text-slate-700"><Mail size={18} className="text-indigo-500" /> {currentUser.email}</div>
                         <div className="flex items-center gap-3 font-bold text-slate-700"><Phone size={18} className="text-indigo-500" /> {currentUser.phone}</div>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cumpleaños</label>
                       <p className="font-bold text-slate-700 text-lg flex items-center gap-3"><CalendarIcon size={20} className="text-indigo-500" /> {formatBirthday(currentUser.birthday)}</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-3xl">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Clasificación</label>
                       <p className="font-bold text-slate-700 text-lg flex items-center gap-3"><Briefcase size={20} className="text-indigo-500" /> {currentUser.volunteerType}</p>
                       {currentUser.area && <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider ml-8">{currentUser.area}</p>}
                    </div>
                    <div className="flex gap-4">
                       {currentUser.instagram && <a href={`https://instagram.com/${currentUser.instagram}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-tr from-amber-500 to-fuchsia-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-fuchsia-100"><Instagram size={20} /> Instagram</a>}
                       {currentUser.telegram && <a href={`https://t.me/${currentUser.telegram}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-3 py-4 bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100"><Send size={20} /> Telegram</a>}
                    </div>
                 </div>
               </div>
             )}
           </div>
        </div>
      )}
      {activeTab === 'admin' && (
        <AdminDashboard 
          volunteers={volunteers} 
          announcements={announcements}
          onUpdateStatus={(id, s) => updateDoc(doc(db, "volunteers", id), { status: s })} 
          onEditVolunteer={startEditing} 
          onDeleteVolunteer={handleDeleteVolunteer}
          onAddAnnouncement={async (msg) => {
            await addDoc(collection(db, "announcements"), { message: msg, status: 'published', publishedAt: new Date().toISOString(), createdBy: currentUser.id });
          }}
          onToggleAnnouncement={async (id, status) => {
            await updateDoc(doc(db, "announcements", id), { status });
          }}
          onDeleteAnnouncement={async (id) => {
            await deleteDoc(doc(db, "announcements", id));
          }}
        />
      )}

      {/* MEMBER POPUPS */}
      {viewingVolunteer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setViewingVolunteer(null)} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><X size={24} /></button>
            <div className="flex flex-col items-center text-center space-y-6">
              <img src={viewingVolunteer.photoUrl} className="w-32 h-32 rounded-[2.5rem] object-cover ring-8 ring-indigo-50 shadow-2xl" />
              <div>
                <h3 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2">{viewingVolunteer.name}</h3>
                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full mt-2 inline-block">{viewingVolunteer.volunteerType}</p>
              </div>
              <div className="w-full space-y-4 pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center bg-slate-50 px-5 py-4 rounded-2xl"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span><span className="font-bold text-slate-700">{viewingVolunteer.email}</span></div>
                <div className="flex justify-between items-center bg-slate-50 px-5 py-4 rounded-2xl"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</span><span className="font-bold text-slate-700">{viewingVolunteer.phone}</span></div>
                {viewingVolunteer.instagram && <div className="flex justify-between items-center bg-slate-50 px-5 py-4 rounded-2xl"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instagram</span><a href={`https://instagram.com/${viewingVolunteer.instagram}`} target="_blank" rel="noreferrer" className="font-bold text-indigo-600">@{viewingVolunteer.instagram}</a></div>}
              </div>
              <button onClick={() => setViewingVolunteer(null)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Entendido</button>
            </div>
          </div>
        </div>
      )}

      {editingVolunteer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl my-10 p-12 shadow-2xl relative animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Gestionar Miembro</h3>
              <button onClick={() => setEditingVolunteer(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
              <ProfileForm formData={editForm} onChange={(upd: any) => setEditForm((prev: any) => ({...prev, ...upd}))} isAdminEditing={true} />
            </div>
            <button onClick={() => saveMemberChanges(editingVolunteer.id)} className="w-full mt-10 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
              <Save size={20} /> Guardar todos los cambios
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
