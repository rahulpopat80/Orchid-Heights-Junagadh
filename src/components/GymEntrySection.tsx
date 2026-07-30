import React, { useState, useEffect } from 'react';
import { Dumbbell, Phone, Clock, Search, LogOut } from 'lucide-react';
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
    const q = query(collection(db, 'gym_theatre_logs'), where('amenity', '==', 'Gym'));
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
      setError('Please select a member.');
      return;
    }
    
    const flatId = `${wing}-${flatNo}`;
    
    const isAlreadyIn = logs.some(l => l.flatId === flatId && l.memberName === member && !l.checkOutTime);
    if (isAlreadyIn) {
      setError('This member is already checked into the Gym.');
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
      setSuccess('Member checked in successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to check in');
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
      alert('Failed to check out');
    }
  };

  const activeLogs = logs.filter(l => !l.checkOutTime);
  const checkedOutLogs = logs.filter(l => l.checkOutTime);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (checkIn: string, checkOut: string) => {
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffMins = Math.round(diffMs / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
          <Dumbbell className="w-6 h-6 text-indigo-600" />
          <span>Gym Entry Registration</span>
        </h3>
        
        {error && <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="mt-4 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">વિંગ (Wing)</label>
              <select value={wing} onChange={(e) => setWing(e.target.value as 'A' | 'B')} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 font-bold">
                <option value="A">Wing A</option>
                <option value="B">Wing B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ફ્લેટ નંબર (Flat)</label>
              <select value={flatNo} onChange={(e) => setFlatNo(parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 font-bold">
                {Array.from({ length: 12 }, (_, i) => i + 1).flatMap(floor => 
                  Array.from({ length: 4 }, (_, j) => floor * 100 + (j + 1))
                ).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">સભ્યનું નામ (Member Name)</label>
             <select value={member} onChange={(e) => setMember(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 font-bold">
                {flatMembers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
             </select>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 font-medium mt-4 bg-indigo-50 text-indigo-800 p-3 rounded-lg border border-indigo-100">
          ℹ️ Security Instructions: After clicking Check In, please hand over the GYM Key to the member. When they return the key, click on Check Out.
        </p>

        <button onClick={handleCheckIn} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md">
          Check In Member & Give Key
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h4 className="font-bold text-lg text-slate-800 mb-4">ચાલુ મંજૂરીઓનું લિસ્ટ (Pending Gym Entries)</h4>
        {activeLogs.length === 0 ? (
          <p className="text-slate-500 text-sm">No members currently in the gym.</p>
        ) : (
          <div className="grid gap-4">
            {activeLogs.map(log => (
              <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{log.memberName}</p>
                  <p className="text-xs text-slate-500 font-medium">Flat: {log.flatId}</p>
                  <p className="text-xs text-indigo-600 font-bold mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    In: {formatDateTime(log.checkInTime)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {log.memberPhone && (
                    <a href={`tel:${log.memberPhone}`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl transition">
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                  <button onClick={() => handleCheckOut(log.id!)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1">
                    <LogOut className="w-4 h-4" />
                    <span>Check Out</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h4 className="font-bold text-lg text-slate-800 mb-4">પૂર્ણ થયેલ એન્ટ્રી (Checked Out Entries)</h4>
        {checkedOutLogs.length === 0 ? (
          <p className="text-slate-500 text-sm">No completed logs today.</p>
        ) : (
          <div className="grid gap-3">
             {checkedOutLogs.slice(0, 10).map(log => (
               <div key={log.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                 <div>
                   <p className="font-bold text-slate-700 text-sm">{log.memberName} (Flat {log.flatId})</p>
                   <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                     In: {formatDateTime(log.checkInTime)} • 
                     Out: {log.checkOutTime ? formatDateTime(log.checkOutTime) : 'N/A'}
                   </p>
                 </div>
                 {log.checkOutTime && (
                   <div className="text-right">
                     <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold font-mono">
                       {formatDuration(log.checkInTime, log.checkOutTime)}
                     </span>
                   </div>
                 )}
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
