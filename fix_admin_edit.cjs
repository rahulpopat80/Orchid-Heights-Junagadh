const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const handlersToAdd = `  const handleEditMemberInFlat = async (wing: string, flatNo: number, indexToEdit: number) => {
    const freshOwner = owners.find((o) => o.wing === wing && o.flatNo === flatNo);
    if (!freshOwner) return;
    
    const currentMember = freshOwner.members?.[indexToEdit];
    if (!currentMember) return;
    
    const newName = window.prompt("Edit Member (Name or 'Name (Phone)' format):", currentMember);
    if (newName === null || newName.trim() === '') return;
    
    const updatedMembers = [...(freshOwner.members || [])];
    updatedMembers[indexToEdit] = newName.trim();
    
    try {
      const res = await api.updateOwner(wing, flatNo, { members: updatedMembers });
      if (res.success) {
        onRefreshOwners();
      } else {
        alert(res.message || 'Failed to update member.');
      }
    } catch (e) {
      alert('Error updating member.');
    }
  };

  const handleEditVehicleInFlat = async (wing: string, flatNo: number, vehicleIdToEdit: string) => {
    const freshOwner = owners.find((o) => o.wing === wing && o.flatNo === flatNo);
    if (!freshOwner) return;
    
    const currentVehicle = freshOwner.vehicles?.find(v => v.id === vehicleIdToEdit);
    if (!currentVehicle) return;
    
    const newPlate = window.prompt("Edit Vehicle Plate Number:", currentVehicle.plateNumber);
    if (newPlate === null || newPlate.trim() === '') return;
    
    const newModel = window.prompt("Edit Vehicle Brand/Model:", currentVehicle.brandModel);
    if (newModel === null || newModel.trim() === '') return;
    
    const newParking = window.prompt("Edit Parking Plot (Leave empty if none):", currentVehicle.parkingPlot || '');
    if (newParking === null) return;
    
    const updatedVehicles = (freshOwner.vehicles || []).map(v => {
      if (v.id === vehicleIdToEdit) {
        return {
          ...v,
          plateNumber: newPlate.trim().toUpperCase(),
          brandModel: newModel.trim(),
          parkingPlot: newParking.trim() || undefined
        };
      }
      return v;
    });
    
    try {
      const res = await api.updateOwner(wing, flatNo, { vehicles: updatedVehicles });
      if (res.success) {
        onRefreshOwners();
      } else {
        alert(res.message || 'Failed to update vehicle.');
      }
    } catch (e) {
      alert('Error updating vehicle.');
    }
  };

  // Admin-side CRUD for household members`;

if (!code.includes("handleEditMemberInFlat")) {
  code = code.replace("// Admin-side CRUD for household members", handlersToAdd);
}

// Now replace the JSX to add the Edit3 button for Members
const memberJsx = `<button
                                  onClick={() => handleDeleteMemberFromFlat(selectedFlat.wing, selectedFlat.flatNo, index)}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button></div>`;

const newMemberJsx = `<div className="flex gap-1">
                                <button
                                  onClick={() => handleEditMemberInFlat(selectedFlat.wing, selectedFlat.flatNo, index)}
                                  className="text-slate-400 hover:text-indigo-600 p-1 rounded-md transition cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMemberFromFlat(selectedFlat.wing, selectedFlat.flatNo, index)}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div></div>`;

if (code.includes(memberJsx)) {
  code = code.replace(memberJsx, newMemberJsx);
  console.log("Replaced Member JSX");
}

const vehicleJsx = `<button
                                    onClick={() => handleDeleteVehicleFromFlat(selectedFlat.wing, selectedFlat.flatNo, v.id)}
                                    className="text-slate-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button></div>`;

const newVehicleJsx = `<div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditVehicleInFlat(selectedFlat.wing, selectedFlat.flatNo, v.id)}
                                    className="text-slate-400 hover:text-indigo-600 p-1 rounded-md transition cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVehicleFromFlat(selectedFlat.wing, selectedFlat.flatNo, v.id)}
                                    className="text-slate-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div></div>`;
if (code.includes(vehicleJsx)) {
  code = code.replace(vehicleJsx, newVehicleJsx);
  console.log("Replaced Vehicle JSX");
}

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
