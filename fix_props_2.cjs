const fs = require('fs');
let amContent = fs.readFileSync('src/components/resident/AmenitiesSection.tsx', 'utf8');

const missingProps = `
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
`;

const missingDestructure = `
  fPropertyName, setFPropertyName,
  fDateFrom, setFDateFrom,
  fDateTo, setFDateTo,
  fReason, setFReason,
  fStuffNeeded, setFStuffNeeded,
  fParkingRequest, setFParkingRequest,
`;

amContent = amContent.replace(/  amenityBookingError: string;\n\}/g, "  amenityBookingError: string;\n" + missingProps + "}");
amContent = amContent.replace(/  amenityBookingError\n\}: AmenitiesSectionProps\) \{/g, "  amenityBookingError,\n" + missingDestructure + "}: AmenitiesSectionProps) {");

// Now replace the inputs with controlled ones
amContent = amContent.replace(/<input\n\s*type="text"\n\s*name="reason"\n\s*required/g, '<input type="text" name="reason" value={fReason} onChange={e=>setFReason(e.target.value)} required');
amContent = amContent.replace(/<input\n\s*type="datetime-local"\n\s*name="dateFrom"\n\s*required/g, '<input type="datetime-local" name="dateFrom" value={fDateFrom} onChange={e=>setFDateFrom(e.target.value)} required');
amContent = amContent.replace(/<input\n\s*type="datetime-local"\n\s*name="dateTo"\n\s*required/g, '<input type="datetime-local" name="dateTo" value={fDateTo} onChange={e=>setFDateTo(e.target.value)} required');
amContent = amContent.replace(/<input\n\s*type="text"\n\s*name="stuffNeeded"\n\s*required/g, '<input type="text" name="stuffNeeded" value={fStuffNeeded} onChange={e=>setFStuffNeeded(e.target.value)} required');
amContent = amContent.replace(/<input\n\s*type="text"\n\s*name="parkingRequest"/g, '<input type="text" name="parkingRequest" value={fParkingRequest} onChange={e=>setFParkingRequest(e.target.value)}');

fs.writeFileSync('src/components/resident/AmenitiesSection.tsx', amContent);
