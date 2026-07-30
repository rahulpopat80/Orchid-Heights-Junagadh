import React, { useState, useEffect } from 'react';
import { Dumbbell, Phone, Clock, LogOut } from 'lucide-react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, doc } from '../lib/firebase';
import { GymTheatreLog, FlatOwner } from '../types';

interface GymEntrySectionProps {
  owners: FlatOwner[];
}

export default function GymEntrySection({ owners }: GymEntrySectionProps) {
  const [wing, setWing] = useState<'A' | 'B'>('A');
  const [flatNo, setFlatNo] = useState<number>(101);
  const [member, setMember] = useState<string>('');
  const [logs, setLogs] = useState<GymTheatreLog[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const q = query(
      collection(db, 'gym_theatre_logs'), 
      where('amenity', '==', 'Gym'),
      where('createdAt', '>=', twentyFourHoursAgo.toISOString())
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: GymTheatreLog[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as GymTheatreLog));
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setLogs(list);
    });
    return () => unsub();
  }, []);

  const currentOwner = owners.find(o => o.wing === wing && o.flatNo === flatNo);
  const flatMembers = currentOwner ? [
    currentOwner.nameGu || currentOwner.nameEn || `Flat ${wing}-${flatNo}`,
    ...(currentOwner.members || [])
  ] : [];

  // Reset member selection if flat changes and old member not in list
  useEffect(() => {
    if (flatMembers.length > 0 && !flatMembers.includes(member)) {
      setMember(flatMembers[0]);
    } else if (flatMembers.length === 0) {
      setMember('');
    }
  }, [wing, flatNo, currentOwner]);

  const handleCheckIn = async () => {
    setError('');
    setSuccess('');
    if (!member) {
      setError('કૃપા કરીને સભ્ય પસંદ કરો.');
      return;
    }
    
    const flatId = `${wing}-${flatNo}`;
    
    const isAlreadyIn = logs.some(l => l.flatId === flatId && l.memberName === member && !l.checkOutTime);
    if (isAlreadyIn) {
      setError('આ સભ્ય પહેલેથી જ જીમમાં છે.');
      return;
    }

    try {
      await addDoc(collection(db, 'gym_theatre_logs'), {
        flatId,
        amenity: 'Gym',
        memberName: member,
        memberPhone: currentOwner?.phone || '',
        checkInTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      setSuccess('સભ્યને સફળતાપૂર્વક જીમમાં દાખલ કરવામાં આવ્યા.');
    } catch (e: any) {
      setError(e.message || 'Check-in નિષ્ફળ ગયું');
    }
  };

  const handleCheckOut = async (logId: string) => {
    try {
      const now = new Date();
      await updateDoc(doc(db, 'gym_theatre_logs', logId), {
        checkOutTime: now.toISOString()
      });
    } catch (e: any) {
      console.error(e);
      alert('Check-out નિષ્ફળ ગયું');
    }
  };

  const activeLogs = logs.filter(l => !l.checkOutTime);
  const checkedOutLogs = logs.filter(l => l.checkOutTime);

  const calculateDuration = (checkIn: string, checkOut: string) => {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours} hr ${minutes % 60} min`;
    return `${minutes} min`;
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
          <Dumbbell className="w-6 h-6 text-indigo-600" />
          <span>નવી જીમ એન્ટ્રી (Gym Entry)</span>
        </h3>
        
        {error && <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="mt-4 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">વિંગ</label>
              <select value={wing} onChange={(e) => setWing(e.target.value as 'A' | 'B')} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 font-bold">
                <option value="A">Wing A</option>
                <option value="B">Wing B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ફ્લેટ નંબર</label>
              <select value={flatNo} onChange={(e) => setFlatNo(parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 font-bold">
                {Array.from({ length: 12 }, (_, i) => i + 1).flatMap(floor => 
                  Array.from({ length: 4 }, (_, j) => floor * 100 + (j + 1))
                ).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">રહેવાસી (Household Member)</label>
             <select value={member} onChange={(e) => setMember(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 font-bold truncate">
                {flatMembers.map(m => (
                  <option key={m} value={m}>{m} {currentOwner?.phone ? `(${currentOwner.phone})` : ''}</option>
                ))}
             </select>
          </div>
        </div>
        
        <button onClick={handleCheckIn} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-lg">
          Check In (પ્રવેશ આપો)
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h4 className="font-bold text-lg text-slate-800 mb-4">ચાલુ મંજૂરીઓનું લિસ્ટ (Pending Gym Entries)</h4>
        {activeLogs.length === 0 ? (
          <p className="text-slate-500 text-sm italic">કોઈ બાકી વિનંતી નથી (No pending entries).</p>
        ) : (
          <div className="grid gap-4">
            {activeLogs.map(log => (
              <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-base">{log.memberName}</p>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">Flat: {log.flatId}</p>
                  <p className="text-xs text-indigo-600 font-bold mt-1.5 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    In: {new Date(log.checkInTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {log.memberPhone && (
                    <a href={`tel:${log.memberPhone}`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl transition">
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                  <button onClick={() => handleCheckOut(log.id!)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-3 rounded-xl transition flex items-center space-x-1 shadow-sm">
                    <LogOut className="w-4 h-4" />
                    <span>Check Out</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h4 className="font-bold text-lg text-slate-800 mb-4">પૂર્ણ થયેલ એન્ટ્રી (Checked Out Entries - Last 24 Hrs)</h4>
        {checkedOutLogs.length === 0 ? (
          <p className="text-slate-500 text-sm italic">કોઈ પૂર્ણ થયેલ એન્ટ્રી નથી (No completed logs today).</p>
        ) : (
          <div className="grid gap-3">
             {checkedOutLogs.slice(0, 15).map(log => (
               <div key={log.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                 <div>
                   <p className="font-bold text-slate-700 text-base">{log.memberName} <span className="text-slate-500 font-medium text-sm">(Flat {log.flatId})</span></p>
                   <div className="text-xs text-slate-500 mt-1.5 space-y-0.5 font-mono">
                     <p>In: {new Date(log.checkInTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
                     <p>Out: {log.checkOutTime ? new Date(log.checkOutTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }) : 'N/A'}</p>
                   </div>
                 </div>
                 <div className="text-right">
                    {log.checkOutTime && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-mono font-bold">
                        {calculateDuration(log.checkInTime, log.checkOutTime)}
                      </span>
                    )}
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
