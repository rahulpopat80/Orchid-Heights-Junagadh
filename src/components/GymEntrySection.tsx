import React, { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Phone, Clock, Search, LogOut } from 'lucide-react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, doc } from '../lib/firebase';
import { GymTheatreLog, FlatOwner } from '../types';
import { transliterateToGujarati } from '../lib/transliterate';

interface GymEntrySectionProps {
  owners: FlatOwner[];
}

export default function GymEntrySection({ owners }: GymEntrySectionProps) {
  const [wing, setWing] = useState<'A' | 'B'>('A');
  const [flatNo, setFlatNo] = useState<number>(101);
  const [member, setMember] = useState<string>('');
  const [translatedMembers, setTranslatedMembers] = useState<string[]>([]);
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

  const currentOwner = useMemo(() => owners.find(o => o.wing === wing && o.flatNo === flatNo), [owners, wing, flatNo]);
  
  const rawFlatMembers = useMemo(() => {
    return currentOwner ? [
      `${currentOwner.nameGu || currentOwner.nameEn || `ફ્લેટ (Flat) ${wing}-${flatNo}`}${currentOwner.phone ? ` (${currentOwner.phone})` : ''}`,
      ...(currentOwner.members || [])
    ] : [];
  }, [currentOwner, wing, flatNo]);

  useEffect(() => {
    const fetchTranslations = async () => {
      if (rawFlatMembers.length === 0) {
        setTranslatedMembers([]);
        setMember('');
        return;
      }
      const translated = await Promise.all(rawFlatMembers.map(async m => {
         const phoneMatch = m.match(/\(([\d\s\+\-]+)\)$/);
         let namePart = m;
         let phonePart = '';
         if (phoneMatch) {
            namePart = m.replace(/\s*\([\d\s\+\-]+\)$/, '').trim();
            phonePart = ` (${phoneMatch[1]})`;
         }
         const tName = await transliterateToGujarati(namePart);
         return tName + phonePart;
      }));
      setTranslatedMembers(translated);
      if (translated.length > 0) {
        setMember(translated[0]);
      }
    };
    fetchTranslations();
  }, [rawFlatMembers]);

  const handleCheckIn = async () => {
    setError('');
    setSuccess('');
    if (!member) {
      setError('કૃપા કરીને સભ્ય પસંદ કરો (Please select a member).');
      return;
    }
    
    let extractedPhone = '';
    let cleanMemberName = member;
    const phoneMatch = member.match(/\(([\d\s\+\-]+)\)$/);
    if (phoneMatch) {
      extractedPhone = phoneMatch[1].replace(/[\s\+\-]/g, '');
      cleanMemberName = member.replace(/\s*\([\d\s\+\-]+\)$/, '').trim();
    } else {
      if (translatedMembers.length > 0 && member === translatedMembers[0]) {
         extractedPhone = currentOwner?.phone || '';
      }
    }
    
    const flatId = `${wing}-${flatNo}`;
    
    const isAlreadyIn = logs.some(l => l.flatId === flatId && l.memberName === cleanMemberName && !l.checkOutTime);
    if (isAlreadyIn) {
      setError('આ સભ્ય પહેલેથી જ જીમમાં છે (Member already in Gym).');
      return;
    }

    try {
      await addDoc(collection(db, 'gym_theatre_logs'), {
        flatId,
        amenity: 'Gym',
        memberName: cleanMemberName,
        memberPhone: extractedPhone,
        checkInTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      setSuccess('સભ્યની એન્ટ્રી સફળતાપૂર્વક થઈ ગઈ (Checked in successfully).');
    } catch (e: any) {
      setError(e.message || 'એન્ટ્રી નિષ્ફળ (Failed to check in)');
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
      alert('ચેક આઉટ નિષ્ફળ (Failed to check out)');
    }
  };

  const activeLogs = logs.filter(l => !l.checkOutTime);
  
  // Only last 24 hours checked out logs
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  const checkedOutLogs = logs.filter(l => l.checkOutTime && new Date(l.checkOutTime) >= twentyFourHoursAgo);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('gu-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDurationLines = (checkIn: string, checkOut: string) => {
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffMins = Math.round(diffMs / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs > 0) return `${hrs} કલાક\n${mins} મિનિટ`;
    return `${mins}\nમિનિટ`;
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
          <Dumbbell className="w-6 h-6 text-indigo-600" />
          <span>જીમ એન્ટ્રી (Gym Entry)</span>
        </h3>
        
        {error && <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="mt-4 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">વિંગ</label>
              <select value={wing} onChange={(e) => setWing(e.target.value as 'A' | 'B')} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 font-bold truncate">
                <option value="A">વિંગ એ (Wing A)</option>
                <option value="B">વિંગ બી (Wing B)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ફ્લેટ નંબર</label>
              <select value={flatNo} onChange={(e) => setFlatNo(parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 font-bold truncate">
                {Array.from({ length: 12 }, (_, i) => i + 1).flatMap(floor => 
                  Array.from({ length: 4 }, (_, j) => floor * 100 + (j + 1))
                ).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2">સભ્યનું નામ</label>
             <select value={member} onChange={(e) => setMember(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 font-bold truncate">
                {translatedMembers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
             </select>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 font-medium mt-4 bg-indigo-50 text-indigo-800 p-3 rounded-lg border border-indigo-100">
          સૂચના: સભ્યની એન્ટ્રી કર્યા પછી, તેમને જીમની ચાવી આપો. જ્યારે તેઓ ચાવી પાછી આપે, ત્યારે 'ચેક આઉટ' પર ક્લિક કરો.
        </p>

        <button onClick={handleCheckIn} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md">
          એન્ટ્રી કરો અને ચાવી આપો (Check In)
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6">
        <h4 className="font-bold text-lg text-slate-800 mb-4">ચાલુ જીમ એન્ટ્રીઓ (Active Gym Entries)</h4>
        {activeLogs.length === 0 ? (
          <p className="text-slate-500 text-sm">હાલમાં કોઈ જીમમાં નથી.</p>
        ) : (
          <div className="grid gap-4">
            {activeLogs.map(log => (
              <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800">{log.memberName}</p>
                  <p className="text-xs text-slate-500 font-medium">ફ્લેટ (Flat): {log.flatId}</p>
                  <p className="text-xs text-indigo-600 font-bold mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    પ્રવેશ (In): {formatDateTime(log.checkInTime)}
                  </p>
                </div>
                <div className="flex w-full sm:w-auto gap-2 mt-3 sm:mt-0">
                  {log.memberPhone && (
                    <a href={`tel:${log.memberPhone}`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition shrink-0 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                  <button onClick={() => handleCheckOut(log.id!)} className="flex-1 sm:flex-none sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shrink-0">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">ચેક આઉટ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6">
        <h4 className="font-bold text-lg text-slate-800 mb-4">પૂર્ણ થયેલ એન્ટ્રી (Past 24 Hours)</h4>
        {checkedOutLogs.length === 0 ? (
          <p className="text-slate-500 text-sm">છેલ્લા 24 કલાકમાં કોઈ પૂર્ણ એન્ટ્રી નથી.</p>
        ) : (
          <div className="grid gap-3">
             {checkedOutLogs.slice(0, 15).map(log => (
               <div key={log.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between gap-2">
                 <div className="flex-1 min-w-0">
                   <p className="font-bold text-slate-800 text-sm truncate">
                     {log.memberName}
                   </p>
                   <p className="text-xs text-slate-600 font-semibold mb-2">(ફ્લેટ {log.flatId})</p>
                   <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                     <p>પ્રવેશ: {formatDateTime(log.checkInTime)}</p>
                     <p>બહાર: {log.checkOutTime ? formatDateTime(log.checkOutTime) : 'N/A'}</p>
                   </div>
                 </div>
                 {log.checkOutTime && (
                   <div className="flex items-center justify-center shrink-0">
                     <span className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold font-mono text-center whitespace-pre-wrap leading-tight">
                       {formatDurationLines(log.checkInTime, log.checkOutTime)}
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
