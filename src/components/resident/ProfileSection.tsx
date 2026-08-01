import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, Car, Phone, Lock, Eye, EyeOff, Calendar, AlertCircle, Trash2, Plus, ShieldCheck, HelpCircle, ArrowLeft, LogOut, Edit3 } from 'lucide-react';
import { FlatOwner, Vehicle, AbsenceLog, DailyHelper, UserSession } from '../../types';

interface ProfileSectionProps {
  wing: string;
  flatNo: number;
  myOwnerData: FlatOwner | null;
  savingSettings: boolean;
  settingsSuccess: string;
  settingsError: string;
  session: UserSession;

  // Family members state
  newMember: string;
  setNewMember: (text: string) => void;
  newMemberPhone: string;
  setNewMemberPhone: (text: string) => void;
  editingMemberIdx?: number | null;
  setEditingMemberIdx?: (idx: number | null) => void;
  handleAddMember: (e: React.FormEvent) => void;
  handleRemoveMember: (idx: number) => void;
  handleEditMember: (idx: number) => void;

  // Vehicles state
  vType: 'twowheeler' | 'fourwheeler';
  setVType: (type: 'twowheeler' | 'fourwheeler') => void;
  vPlate: string;
  setVPlate: (text: string) => void;
  vModel: string;
  setVModel: (text: string) => void;
  vParkingPlot: string;
  setVParkingPlot: (text: string) => void;
  editingVehicleId?: string | null;
  setEditingVehicleId?: (id: string | null) => void;
  handleAddVehicle: (e: React.FormEvent) => void;
  handleRemoveVehicle: (id: string) => void;
  handleEditVehicle: (id: string) => void;

  // Security alternate contact & Password state
  altContact: string;
  setAltContact: (text: string) => void;
  showPass: boolean;
  setShowPass: (show: boolean) => void;
  newPassword: string;
  setNewPassword: (text: string) => void;
  handleSaveGeneral: (e: React.FormEvent) => void;

  // Absence/Redirection state
  absenceLogs: AbsenceLog[];
  dailyHelpers: DailyHelper[];
  absDateFrom: string;
  setAbsDateFrom: (text: string) => void;
  absDateTo: string;
  setAbsDateTo: (text: string) => void;
  absMilkRedirect: string;
  setAbsMilkRedirect: (text: string) => void;
  absNewspaperRedirect: string;
  setAbsNewspaperRedirect: (text: string) => void;
  absParcelRedirect: string;
  setAbsParcelRedirect: (text: string) => void;
  absenceSuccess: string;
  absenceError: string;
  handleSaveAbsence: (e: React.FormEvent) => void;
  handleCancelAbsence: () => void;
  onLogout?: () => void;
}

export default function ProfileSection({
  wing,
  flatNo,
  myOwnerData,
  savingSettings,
  settingsSuccess,
  settingsError,
  session,
  newMember,
  setNewMember,
  newMemberPhone,
  setNewMemberPhone,
  editingMemberIdx,
  setEditingMemberIdx,
  handleAddMember,
  handleRemoveMember,
  handleEditMember,
  vType,
  setVType,
  vPlate,
  setVPlate,
  vModel,
  setVModel,
  vParkingPlot,
  setVParkingPlot,
  editingVehicleId,
  setEditingVehicleId,
  handleAddVehicle,
  handleRemoveVehicle,
  handleEditVehicle,
  altContact,
  setAltContact,
  showPass,
  setShowPass,
  newPassword,
  setNewPassword,
  handleSaveGeneral,
  absenceLogs,
  dailyHelpers,
  absDateFrom,
  setAbsDateFrom,
  absDateTo,
  setAbsDateTo,
  absMilkRedirect,
  setAbsMilkRedirect,
  absNewspaperRedirect,
  setAbsNewspaperRedirect,
  absParcelRedirect,
  setAbsParcelRedirect,
  absenceSuccess,
  absenceError,
  handleSaveAbsence,
  handleCancelAbsence,
  onLogout
}: ProfileSectionProps) {
  const flatId = `${wing}-${flatNo}`;
  
  // Find active absence for this flat
  const activeAbsence = absenceLogs.find((a) => a.flatId === flatId);
  
  // Find active helpers mapped to this flat
  const activeHelpers = dailyHelpers.filter((h) => h.flats.includes(flatId));

  return (
    <div className="space-y-8 text-left">
      {/* Alert banners */}
      {settingsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs">
          {settingsError}
        </div>
      )}

      {settingsSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs font-bold">
          {settingsSuccess}
        </div>
      )}



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* --- Column 1: Family & Vehicles --- */}
        <div className="space-y-6">
          {/* Box 1: Household Family Members */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <Users className="w-4.5 h-4.5 text-indigo-600" />
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">
                Household Family Members
              </h4>
            </div>

            <p className="text-[11px] text-slate-400">
              Register family members residing in this apartment for emergency gatekeeper verification, notifications and security audits.
            </p>

            {myOwnerData?.members && myOwnerData.members.length > 0 ? (
              <div className="space-y-2">
                {myOwnerData.members.map((member, idx) => {
                  const match = member.match(/^(.*?)(?:\s*\((.*?)\))?$/);
                  const memberPhone = match ? match[2]?.trim() : null;
                  
                  // Strict match primarily by phone if both have phone numbers
                  let isCurrentMember = false;
                  if (session.phone && memberPhone) {
                    isCurrentMember = session.phone === memberPhone;
                  } else {
                    // Fallback to name matching if phone is missing on either side
                    const memberName = match ? match[1]?.trim() : member;
                    isCurrentMember = session.ownerName?.toLowerCase() === memberName?.toLowerCase();
                  }
                  
                  return (
                    <div
                      key={idx}
                      className={`flex justify-between items-center border p-2.5 rounded-lg text-xs font-semibold uppercase ${
                        isCurrentMember 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>👤 {member}</span>
                        {isCurrentMember && (
                          <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditMember(idx)}
                          disabled={savingSettings}
                          title="Edit member"
                          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(idx)}
                          disabled={savingSettings || isCurrentMember}
                          title={isCurrentMember ? "Cannot remove currently logged-in member" : "Remove member"}
                          className={`p-1 rounded transition ${
                            isCurrentMember 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 border border-dashed rounded-lg text-[11px]">
                No other family members registered. Add them below!
              </div>
            )}

            {/* Form to add family member */}
            <form onSubmit={handleAddMember} className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="Full Name (e.g. Rahul Popat)"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg px-3 py-2 text-xs font-medium outline-none transition"
                />
                <input
                  type="tel"
                  placeholder="Contact No. (Optional)"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg px-3 py-2 text-xs font-medium outline-none transition w-full sm:w-40"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer text-xs"
                >
                  {editingMemberIdx !== undefined && editingMemberIdx !== null ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Update Member</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Household Member</span>
                    </>
                  )}
                </button>
                {editingMemberIdx !== undefined && editingMemberIdx !== null && setEditingMemberIdx && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMemberIdx(null);
                      setNewMember('');
                      setNewMemberPhone('');
                    }}
                    disabled={savingSettings}
                    className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg flex items-center justify-center transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Box 2: Registered Vehicles */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <Car className="w-4.5 h-4.5 text-indigo-600" />
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">
                Registered Vehicles
              </h4>
            </div>

            <p className="text-[11px] text-slate-400">
              Register vehicles to assign designated parking areas and enable automated gate scans on entries.
            </p>

            {myOwnerData?.vehicles && myOwnerData.vehicles.length > 0 ? (
              <div className="space-y-2">
                {myOwnerData.vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="flex justify-between items-center bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  >
                    <div className="flex flex-col font-mono font-bold text-slate-800 text-left">
                      <div className="flex items-center space-x-2">
                        <span>{v.type === 'fourwheeler' ? '🚗' : '🏍️'}</span>
                        <span>{v.plateNumber}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({v.brandModel})</span>
                      </div>
                      {v.type === 'fourwheeler' && v.parkingPlot && (
                        <span className="text-[10px] text-indigo-600 font-bold mt-0.5">🅿️ Plot: {v.parkingPlot}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditVehicle(v.id)}
                        disabled={savingSettings}
                        title="Edit vehicle"
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveVehicle(v.id)}
                        disabled={savingSettings}
                        title="Unregister vehicle"
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 border border-dashed rounded-lg text-[11px]">
                No vehicles registered.
              </div>
            )}

            {/* Form to add vehicle */}
            <form onSubmit={handleAddVehicle} className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-left">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVType('twowheeler')}
                  className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                    vType === 'twowheeler' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  🏍️ Two Wheeler
                </button>
                <button
                  type="button"
                  onClick={() => setVType('fourwheeler')}
                  className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                    vType === 'fourwheeler' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  🚗 Four Wheeler
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="PLATE (e.g. GJ01AB1234)"
                  value={vPlate}
                  onChange={(e) => setVPlate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 uppercase outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  required
                  placeholder="MODEL (e.g. Activa / Swift)"
                  value={vModel}
                  onChange={(e) => setVModel(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              {vType === 'fourwheeler' && (
                <div className="text-xs">
                  <input
                    type="text"
                    placeholder="Parking Plot (e.g. B-1 Basement, G-1 Ground)"
                    value={vParkingPlot}
                    onChange={(e) => setVParkingPlot(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-[10px] transition cursor-pointer uppercase tracking-wider"
                >
                  {editingVehicleId ? 'Update Vehicle' : 'Register Vehicle'}
                </button>
                {editingVehicleId && setEditingVehicleId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVehicleId(null);
                      setVPlate('');
                      setVModel('');
                      setVParkingPlot('');
                    }}
                    disabled={savingSettings}
                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg transition cursor-pointer text-[10px] uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* --- Column 2: Security & Service Redirection --- */}
        <div className="space-y-6">
          {/* Box 3: Alternate Contact & Password Security */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
              <Lock className="w-4.5 h-4.5 text-indigo-600" />
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">
                Security & Alternate Contact
              </h4>
            </div>

            <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Alternate Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  autoComplete="new-password"
                  value={altContact}
                  onChange={(e) => setAltContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg p-2.5 text-xs outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Change Log-In Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter new account password..."
                    value={newPassword}
                    autoComplete="new-password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg p-2.5 text-xs outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <VisualEyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-xs transition cursor-pointer"
              >
                {savingSettings ? 'Saving...' : 'Save Contact & Password'}
              </button>
            </form>
          </div>


          {/* Box 5: Mapped Daily helpers list */}
          {activeHelpers.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">
                  My Assigned Helpers
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeHelpers.map((h) => {
                  const cleanName = h.name.replace(/\s*\([^)]*\)\s*/gi, '').trim();
                  return (
                    <span
                      key={h.id}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full py-1 px-3 text-[10px] font-bold uppercase flex items-center"
                    >
                      👤 {cleanName} ({h.role || 'Helper'})
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Logout Section */}
          <div className="pt-2 space-y-4">
            <PWAInstallButton />
            <button
              onClick={onLogout}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl text-sm border border-red-200 transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>લોગ આઉટ (Log Out)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Help sub components
function PWAInstallButton() {
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }
  }, []);

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
      const isIos = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());
      if (isIos) {
        alert("Apple iOS does not allow direct WebApp downloads. To install on iPhone/iPad, you MUST tap the Share icon at the bottom of your screen and select 'Add to Home Screen'.");
      } else {
        alert("Native install prompt is not available right now. This usually means the app is already installed, or you are viewing it inside a preview window. Please open the app in a new dedicated browser tab to download it, or use the browser menu 'Add to Home Screen'.");
      }
      return;
    }
    // Show the install prompt
    promptEvent.prompt();
    // Wait for the user to respond to the prompt
    await promptEvent.userChoice;
    // We've used the prompt, and can't use it again, throw it away
    window.deferredPrompt = null;
  };

  return (
    <button
      onClick={handleInstallClick}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      <span>Download WebApp (PWA)</span>
    </button>
  );
}

function VisualEyeIcon() {
  return <Eye className="w-4 h-4" />;
}
