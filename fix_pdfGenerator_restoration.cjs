const fs = require('fs');

let code = fs.readFileSync('src/lib/pdfGenerator.ts', 'utf8');

// The botched code starts from export const generateAmenityPDF
// and goes to the end of the file.
const amenRegex = /export const generateAmenityPDF[\s\S]*/;

code = code.replace(amenRegex, '');

const correctCode = `
export const generateAmenityPDF = async (logs: AmenityBooking[], title: string, subtitle: string, isAdmin: boolean = false, owners: any[] = []) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const logsPerPage = 4;
  const cardHeight = 60;
  const cardSpacing = 5;

  let currentLogIndex = 0;

  while (currentLogIndex < logs.length) {
    if (currentLogIndex > 0) doc.addPage();
    await drawPDFHeader(doc, title, subtitle, pageWidth);

    let startY = 43;

    for (let i = 0; i < logsPerPage && currentLogIndex < logs.length; i++) {
      const log = logs[currentLogIndex];
      const ownerMatch = owners.find((o: any) => \`\${o.wing}-\${o.flatNo}\` === log.flatId);
      const ownerName = ownerMatch ? ownerMatch.nameEn : 'Resident';
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, startY, contentWidth, cardHeight, 3, 3, 'FD');

      const textX = margin + 5;
      let currY = startY + 10;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(sanitizeText(log.propertyName).toUpperCase(), textX, currY);
      
      currY += 8;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(\`Flat: \${log.flatId} (\${sanitizeText(ownerName)})\`, textX, currY);
      
      currY += 6;
      doc.text(\`Reason: \${sanitizeText(log.reason)}\`, textX, currY);
      
      currY += 6;
      doc.text(\`Status: \${sanitizeText(log.status).toUpperCase()}\`, textX, currY);

      const rightX = pageWidth - margin - 5;
      currY = startY + 10;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text('FROM:', rightX, currY, { align: 'right' });
      
      currY += 5;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date(log.dateFrom).toLocaleString('en-IN'), rightX, currY, { align: 'right' });

      currY += 8;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('TO:', rightX, currY, { align: 'right' });
      
      currY += 5;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date(log.dateTo).toLocaleString('en-IN'), rightX, currY, { align: 'right' });

      startY += cardHeight + cardSpacing;
      currentLogIndex++;
    }

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(\`Page \${doc.internal.pages.length - 1}\`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  if (logs.length === 0) {
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(12);
    doc.text('No amenity bookings found.', pageWidth / 2, 80, { align: 'center' });
  }

  doc.save(\`Orchid_Heights_Amenities_\${new Date().getTime()}.pdf\`);
};

export const generateGymEntryPDF = async (logs: any[], title: string, subtitle: string, owners: any[] = []) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const logsPerPage = 7;
  const cardHeight = 30;
  const cardSpacing = 5;

  let currentLogIndex = 0;

  const formatDuration = (checkIn: string, checkOut: string) => {
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const diffMins = Math.round(diffMs / 60000);
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hrs > 0) return \`\${hrs}h \${mins}m\`;
    return \`\${mins}m\`;
  };

  while (currentLogIndex < logs.length) {
    if (currentLogIndex > 0) doc.addPage();
    await drawPDFHeader(doc, title, subtitle, pageWidth);

    let startY = 43;

    for (let i = 0; i < logsPerPage && currentLogIndex < logs.length; i++) {
      const log = logs[currentLogIndex];
      const ownerMatch = owners.find((o: any) => \`\${o.wing}-\${o.flatNo}\` === log.flatId);
      const ownerName = ownerMatch ? ownerMatch.nameEn : 'Resident';
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, startY, contentWidth, cardHeight, 3, 3, 'FD');

      let headerName = ownerName;
      if (log.memberPhone) {
        if (ownerMatch && ownerMatch.phone === log.memberPhone) {
          headerName = \`\${ownerName} (\${log.memberPhone})\`;
        } else if (ownerMatch && ownerMatch.members) {
          const matchedMember = ownerMatch.members.find((m: string) => m.includes(log.memberPhone));
          if (matchedMember) {
            headerName = matchedMember;
          } else {
            headerName = \`\${sanitizeText(log.memberName, ownerName)} (\${log.memberPhone})\`;
          }
        } else {
          headerName = \`\${sanitizeText(log.memberName, ownerName)} (\${log.memberPhone})\`;
        }
      } else {
        headerName = sanitizeText(log.memberName, ownerName);
      }
      
      // Fallback sanitize for the full headerName just in case it contains Gujarati
      headerName = sanitizeText(headerName, ownerName);

      const textX = margin + 5;
      let currY = startY + 10;
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(headerName.toUpperCase(), textX, currY);
      
      currY += 6;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(\`Flat: \${log.flatId} (\${sanitizeText(ownerName)})\`, textX, currY);
      
      if (ownerMatch && ownerMatch.phone) {
          currY += 5;
          doc.text(\`Phone: \${ownerMatch.phone}\`, textX, currY);
      }

      const rightX = pageWidth - margin - 5;
      currY = startY + 10;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text('CHECK IN:', rightX, currY, { align: 'right' });
      
      currY += 5;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date(log.checkInTime).toLocaleString('en-IN'), rightX, currY, { align: 'right' });

      currY += 6;
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      if (log.checkOutTime) {
          doc.text(\`OUT: \${new Date(log.checkOutTime).toLocaleString('en-IN')} (\${formatDuration(log.checkInTime, log.checkOutTime)})\`, rightX, currY, { align: 'right' });
      } else {
          doc.text('OUT: PENDING', rightX, currY, { align: 'right' });
      }

      startY += cardHeight + cardSpacing;
      currentLogIndex++;
    }

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(\`Page \${doc.internal.pages.length - 1}\`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  if (logs.length === 0) {
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(12);
    doc.text('No gym records found.', pageWidth / 2, 80, { align: 'center' });
  }

  doc.save(\`Orchid_Heights_Gym_\${new Date().getTime()}.pdf\`);
};
`;

code = code + correctCode;

fs.writeFileSync('src/lib/pdfGenerator.ts', code);
console.log("Restored generateAmenityPDF and generateGymEntryPDF");
