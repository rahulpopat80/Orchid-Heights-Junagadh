import React, { useState } from 'react';
import { Sparkles, Megaphone, Info, Check, ArrowRight, BookOpen, Clock, Users, Timer, Dumbbell, Film, Building2, Ticket, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AmenityBooking } from '../../types';

interface AmenitiesSectionProps {
  wing: string;
  flatNo: number;
  amenityBookings: AmenityBooking[];
  handleAddAmenityBooking: (e: React.FormEvent) => void;
  handleVoteAmenityBooking: (id: string) => void;
  amenityBookingSuccess: string;
  amenityBookingError: string;

  fPropertyName: string;
  setFPropertyName: (val: string) => void;
  fDateFrom: string;
  setFDateFrom: (val: string) => void;
  fDateTo: string;
  setFDateTo: (val: string) => void;
  fReason: string;
  setFReason: (val: string) => void;
  fStuffNeeded: string;
  setFStuffNeeded: (val: string) => void;
  fParkingRequest: string;
  setFParkingRequest: (val: string) => void;
}

export default function AmenitiesSection({
  wing,
  flatNo,
  amenityBookings,
  handleAddAmenityBooking,
  handleVoteAmenityBooking,
  amenityBookingSuccess,
  amenityBookingError,

  fPropertyName, setFPropertyName,
  fDateFrom, setFDateFrom,
  fDateTo, setFDateTo,
  fReason, setFReason,
  fStuffNeeded, setFStuffNeeded,
  fParkingRequest, setFParkingRequest,
}: AmenitiesSectionProps) {
  const [activeSub, setActiveSub] = useState<'menu' | 'booking' | 'movies' | 'directory'>('menu');
  const myFlatId = `${wing}-${flatNo}`;
  const THRESHOLD = 50;

  const navigateToRoute = (route: string, subView: any) => {
    setActiveSub(subView);
  };

  const activeBooking = amenityBookings.find(b => b.flatId === myFlatId && b.status === 'pending');
  const pendingVoting = amenityBookings.filter(b => b.status === 'pending' && b.flatId !== myFlatId);
  const myBookingsList = amenityBookings.filter(b => b.flatId === myFlatId);

  return (
    <div className="space-y-4 text-left">
      <AnimatePresence mode="wait">
        {activeSub === 'menu' && (
          <motion.div key="menu" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}} className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="font-display font-bold text-[11px] uppercase tracking-widest text-slate-500">Live Services & Utilities</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => navigateToRoute('/amenities/booking', 'booking')}
                className="bg-white rounded-none p-6 border shadow-sm flex flex-col items-center justify-center min-h-[140px] text-center hover:shadow-md transition cursor-pointer relative group border-slate-200/60"
              >
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center animate-pulse"></div>
                <div className="w-14 h-14 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm mb-3 group-hover:scale-105 transition-transform duration-300">
                  <Building2 className="w-7 h-7" />
                </div>
                <h4 className="font-display font-bold text-slate-800 text-sm tracking-tight leading-snug">
                  Function Hall Booking Suite
                </h4>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== SCREEN: AMENITY BOOKING SUITE ==================== */}
        {activeSub === 'booking' && (
          <motion.div key="booking" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                onClick={() => navigateToRoute('/amenities', 'menu')}
                className="flex items-center space-x-2 text-sm font-black text-indigo-700 hover:text-indigo-900 cursor-pointer transition select-none bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 -ml-1" />
                <span className="uppercase tracking-widest text-[10px]">Back</span>
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Function Hall Suite
              </span>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-black text-slate-800 text-xl tracking-tight">Reserve Community Hall</h3>
              <p className="text-[11px] text-slate-500 font-medium">Request dates for family events. Must receive {THRESHOLD} flat approvals within 48h to confirm automatically.</p>
            </div>

            {amenityBookingError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-2 shadow-sm font-sans">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{amenityBookingError}</span>
              </div>
            )}
            {amenityBookingSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 shadow-sm font-sans font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{amenityBookingSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <h4 className="font-display font-black text-[10px] uppercase tracking-wider text-slate-400 mb-4 flex items-center">
                  <span className="w-5 border-t border-slate-200 mr-2"></span>
                  New Reservation Draft
                  <span className="flex-1 border-t border-slate-200 ml-2"></span>
                </h4>
                {activeBooking ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Awaiting Confirmations</h4>
                      <p className="text-xs text-slate-500 mt-1">You already have an active pending reservation block.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left font-mono">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">Purpose</p>
                      <p className="text-xs font-bold text-slate-800 mb-4">{activeBooking.reason}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">Current Signatures</p>
                      <div className="flex items-end justify-between">
                        <p className="text-xl font-black text-emerald-600">{activeBooking.approvedFlats?.length || 0} <span className="text-xs text-slate-400">/ {THRESHOLD}</span></p>
                        <p className="text-[9px] text-slate-400 mb-1">Time ticking</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAddAmenityBooking} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Event Purpose <span className="text-rose-500">*</span></label>
                      <input type="text" name="reason" value={fReason} onChange={e=>setFReason(e.target.value)} required
                        placeholder="e.g., Son's Birthday Party, Puja"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Start Time <span className="text-rose-500">*</span></label>
                        <input type="datetime-local" name="dateFrom" value={fDateFrom} onChange={e=>setFDateFrom(e.target.value)} required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">End Time <span className="text-rose-500">*</span></label>
                        <input type="datetime-local" name="dateTo" value={fDateTo} onChange={e=>setFDateTo(e.target.value)} required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Setup Requirements <span className="text-rose-500">*</span></label>
                      <input type="text" name="stuffNeeded" value={fStuffNeeded} onChange={e=>setFStuffNeeded(e.target.value)} required
                        placeholder="e.g., 50 Chairs, 5 Tables, Catering Space"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Special Permissions (Optional)</label>
                      <input type="text" name="parkingRequest" value={fParkingRequest} onChange={e=>setFParkingRequest(e.target.value)}
                        placeholder="e.g., Need 3 visitor parking slots"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 px-6 rounded-xl text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Broadcast Proposal to Residents
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div>
                <h4 className="font-display font-black text-[10px] uppercase tracking-wider text-slate-400 mb-4 flex items-center">
                  <span className="w-5 border-t border-slate-200 mr-2"></span>
                  Neighbor Approval Queue
                  <span className="flex-1 border-t border-slate-200 ml-2"></span>
                </h4>
                
                {pendingVoting.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="bg-white p-3 rounded-full shadow-sm mb-3 text-slate-300">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Active Voting Blocks</p>
                    <p className="text-[10px] text-slate-400 mt-1">You're all caught up with community approvals.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-4">
                    {pendingVoting.map((b) => {
                      const createdAt = new Date(b.createdAt);
                      const expiresAt = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);
                      const now = new Date();
                      const timeLeftMs = expiresAt.getTime() - now.getTime();
                      const hoursLeft = Math.max(0, Math.floor(timeLeftMs / (1000 * 60 * 60)));
                      const votesCount = b.approvedFlats?.length || 0;
                      const alreadyVoted = b.approvedFlats?.includes(myFlatId);

                      return (
                        <div key={b.id} className="bg-slate-50/70 border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 hover:border-slate-300 transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-display font-black text-slate-800 text-base leading-tight">Block Reserve Request</h4>
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-1">Requested by: Flat {b.flatId}</p>
                            </div>
                            <div className="text-right">
                              {hoursLeft > 0 ? (
                                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider flex items-center shrink-0">
                                  <Timer className="w-3 h-3 mr-1" /> {hoursLeft} hrs left
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase shrink-0">
                                  Deadline Expired
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-white border border-slate-150 p-3 rounded-xl text-xs space-y-2 text-left">
                            <p className="text-slate-700 font-bold text-xs uppercase leading-tight">
                              🎯 Event Purpose: <span className="font-sans font-black text-slate-900">{b.reason}</span>
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-100 pt-1.5 mt-1">
                              <p className="text-slate-500">From: <strong className="text-slate-700 block mt-0.5">{new Date(b.dateFrom).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong></p>
                              <p className="text-slate-500">To: <strong className="text-slate-700 block mt-0.5">{new Date(b.dateTo).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</strong></p>
                            </div>

                            <div className="border-t border-slate-100 pt-1.5 space-y-1">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Setup Material List</p>
                              <p className="text-[11px] text-slate-600 font-medium font-sans leading-relaxed">🛠️ {b.stuffNeeded}</p>
                            </div>

                            <div className="border-t border-slate-100 pt-1.5 space-y-1">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Special Permissions Asked</p>
                              <p className="text-[11px] text-slate-600 font-medium font-sans leading-relaxed">🔒 {b.parkingRequest || 'None requested'}</p>
                            </div>
                          </div>

                          {/* Vote board */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200/60 p-3 rounded-xl">
                            <div className="text-left font-sans">
                              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest font-mono">Resident Approval Votes</p>
                              <p className="text-slate-800 font-extrabold text-xs mt-1">
                                🗳️ {votesCount} / {THRESHOLD} flat approvals
                              </p>
                              <p className="text-[9px] text-slate-400">
                                Requires 49 flats to vote before automatic committee confirmation triggers.
                              </p>
                            </div>
                            
                            <button
                              onClick={() => handleVoteAmenityBooking(b.id)}
                              className={`py-1.5 px-3 rounded-xl text-[10px] font-extrabold uppercase transition select-none cursor-pointer border ${
                                alreadyVoted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm'
                              }`}
                            >
                              {alreadyVoted ? 'Approved ✓' : 'Approve Reservation'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
