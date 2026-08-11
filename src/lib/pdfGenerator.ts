import jsPDF from 'jspdf';
import { Visitor, GymTheatreLog, AmenityBooking } from '../types';
import { downloadChunkedFile } from './fileStorage';

const gujaratiToLatinMap: Record<string, string> = {
  // Vowels
  'અ': 'a', 'આ': 'aa', 'ઇ': 'i', 'ઈ': 'ii', 'ઉ': 'u', 'ઊ': 'uu',
  'ઋ': 'ru', 'ૠ': 'ru', 'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au',
  // Consonants
  'ક': 'k', 'ખ': 'kh', 'ગ': 'g', 'ઘ': 'gh', 'ઙ': 'ng',
  'ચ': 'ch', 'છ': 'chh', 'જ': 'j', 'ઝ': 'z', 'ઞ': 'ny',
  'ટ': 't', 'ઠ': 'th', 'ડ': 'd', 'ઢ': 'dh', 'ણ': 'n',
  'ત': 't', 'થ': 'th', 'દ': 'd', 'ધ': 'dh', 'ન': 'n',
  'પ': 'p', 'ફ': 'f', 'બ': 'b', 'ભ': 'bh', 'મ': 'm',
  'ય': 'y', 'ર': 'r', 'લ': 'l', 'ળ': 'l', 'વ': 'v',
  'શ': 'sh', 'ષ': 'sh', 'સ': 's', 'હ': 'h',
  // Vowel Signs
  'ા': 'a', 'િ': 'i', 'ી': 'i', 'ુ': 'u', 'ૂ': 'u',
  'ૃ': 'ru', 'ૄ': 'ru', 'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au',
  // Other
  'ં': 'n', 'ઃ': 'h', '્': '', 'ૐ': 'om'
};

const transliterateGujarati = (str: string): string => {
  if (!str) return '';
  let res = '';
  for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (gujaratiToLatinMap[char] !== undefined) {
          res += gujaratiToLatinMap[char];
      } else {
          res += char;
      }
  }
  return res.split(' ').map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ');
};

const sanitizeText = (str: string, fallback: string = 'Resident') => {
  if (!str) return fallback;
  
  // First transliterate Gujarati to Latin
  let processed = transliterateGujarati(str);

  // jsPDF default fonts only support ASCII. We must strip remaining non-ASCII characters 
  const clean = processed.replace(/[^\x00-\x7F]/g, '').trim();
  return clean || fallback;
};

const getBase64ImageFromURL = async (url: string): Promise<string> => {
  if (url.startsWith('file_')) {
    try {
      const chunked = await downloadChunkedFile(url);
      return chunked.base64;
    } catch (e) {
      throw new Error('Failed to load chunked image');
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Failed to create canvas context'));
      }
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
};

const drawPDFHeader = async (doc: jsPDF, title: string, subtitle: string, pageWidth: number) => {
  doc.setFillColor(255, 255, 255); // White
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  try {
    const logoBase64 = await getBase64ImageFromURL('https://i.ibb.co/zT5tpcdY/1000296229-1.png');
    doc.addImage(logoBase64, 'PNG', 10, 4, 20, 20);
  } catch (err) {
    console.warn('Could not load logo for PDF', err);
  }

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ORCHID HEIGHTS GATEKEEPER', pageWidth / 2, 12, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(title, pageWidth / 2, 18, { align: 'center' });
  
  // Pink accent line below header
  doc.setDrawColor(216, 27, 96); // #d81b60
  doc.setLineWidth(0.5);
  doc.line(0, 28, pageWidth, 28);
  doc.setLineWidth(0.2); // reset

  // Subtitle
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFontSize(9);
  doc.text(`${subtitle} | Generated: ${new Date().toLocaleString('en-IN')}`, 15, 35);
  
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(15, 38, pageWidth - 15, 38);
};

export const generateVisitorPDF = async (logs: Visitor[], title: string, subtitle: string, isAdmin: boolean = false, owners: any[] = []) => {
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
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, startY, contentWidth, cardHeight, 3, 3, 'FD');

      const photoSize = 50;
      const photoX = margin + 5;
      const photoY = startY + 5;
      doc.setDrawColor(226, 232, 240);
      doc.rect(photoX, photoY, photoSize, photoSize);
      
      try {
        if (log.photoUrl) {
          const base64Img = log.photoUrl.startsWith('data:image') ? log.photoUrl : await getBase64ImageFromURL(log.photoUrl);
          const imgProps = doc.getImageProperties(base64Img);
          const scale = Math.min(photoSize / imgProps.width, photoSize / imgProps.height);
          doc.addImage(base64Img, imgProps.fileType, photoX + (photoSize - imgProps.width * scale) / 2, photoY + (photoSize - imgProps.height * scale) / 2, imgProps.width * scale, imgProps.height * scale);
        } else {
          doc.setTextColor(156, 163, 175);
          doc.setFontSize(8);
          doc.text('No Photo', photoX + photoSize / 2, photoY + photoSize / 2, { align: 'center' });
        }
      } catch (err) {
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(8);
        doc.text('No Photo', photoX + photoSize / 2, photoY + photoSize / 2, { align: 'center' });
      }

      const sepX = photoX + photoSize + 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(sepX, startY + 5, sepX, startY + cardHeight - 5);

      const textX = sepX + 8;
      let currY = startY + 12;

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      const truncatedVisitorName = log.fullName.length > 18 ? log.fullName.substring(0, 18) + '...' : log.fullName;
      doc.text(`${currentLogIndex + 1}. ` + sanitizeText(truncatedVisitorName, 'Visitor').toUpperCase(), textX, currY);

      currY += 5.5;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Mobile: ${log.mobileNumber}`, textX, currY);
      
      currY += 4.5;
      const typeStr = log.isPreEntry 
        ? `Type: ${sanitizeText(log.guestType).toUpperCase()} (PRE-ENTRY)`
        : `Type: ${sanitizeText(log.guestType).toUpperCase()}`;
      doc.text(typeStr, textX, currY);

      currY += 4.5;
      const truncatedReason = (log.reason || 'General Visit').length > 20 ? (log.reason || 'General Visit').substring(0, 20) + '...' : (log.reason || 'General Visit');
      doc.text(`Reason: ${sanitizeText(truncatedReason)}`, textX, currY);
      
      currY += 4.5;
      const ownerMatch = owners.find(o => `${o.wing}-${o.flatNo}` === `${log.wing}-${log.flatNo}`);
      const ownerName = ownerMatch ? ownerMatch.nameEn : (log.flatOwnerName || 'Resident');
      const responder = log.respondedBy ? log.respondedBy.toUpperCase() : ownerName;
      const truncatedResponder = responder.length > 40 ? responder.substring(0, 40) + '...' : responder;
      doc.text(`Target: Flat ${log.wing}-${log.flatNo} (${sanitizeText(truncatedResponder)})`, textX, currY);

      currY += 4.5;
      doc.text(`Visitors: ${log.visitorCount || 1} Person(s)`, textX, currY);

      if (log.exited && log.exitTime) {
        currY += 4.5;
        doc.setTextColor(225, 29, 72); // Rose-600
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`Exit: ${new Date(log.exitTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })} (${log.duration || 'N/A'})`, textX, currY);
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
      }

      const rightX = pageWidth - margin - 5;
      currY = startY + 12;

      let displayStatus = log.exited ? 'EXITED' : log.status.toUpperCase();
      let statusColor = [226, 232, 240];
      let statusTextColor = [100, 116, 139];
      if (log.exited) { statusColor = [241, 245, 249]; statusTextColor = [71, 85, 105]; }
      else if (log.status === 'approved' || log.status === 'Entered') { statusColor = [209, 250, 229]; statusTextColor = [4, 120, 87]; }
      else if (log.status === 'rejected') { statusColor = [254, 226, 226]; statusTextColor = [185, 28, 28]; }
      else if (log.status === 'pending') { statusColor = [254, 243, 199]; statusTextColor = [180, 83, 9]; }

      // Status badge at far right
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(rightX - 25, currY - 6, 25, 8, 2, 2, 'F');
      doc.setTextColor(statusTextColor[0], statusTextColor[1], statusTextColor[2]);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(displayStatus, rightX - 12.5, currY - 0.5, { align: 'center' });

      // If Pre-Entry, place PRE-ENTRY badge directly beside Status badge (at rightX - 53)
      if (log.isPreEntry) {
        doc.setFillColor(219, 234, 254); // Blue-100
        doc.roundedRect(rightX - 53, currY - 6, 26, 8, 2, 2, 'F');
        doc.setTextColor(30, 64, 175); // Blue-800
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('PRE-ENTRY', rightX - 40, currY - 0.5, { align: 'center' });
      } else if (log.respondedBy?.includes('Through Call')) {
        doc.setFillColor(243, 232, 255); // Purple-100
        doc.roundedRect(rightX - 53, currY - 6, 26, 8, 2, 2, 'F');
        doc.setTextColor(107, 33, 168); // Purple-800
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('CALL (GATE)', rightX - 40, currY - 0.5, { align: 'center' });
      }

      currY += 10;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('CHECK-IN:', rightX, currY, { align: 'right' });
      
      currY += 5;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date(log.requestTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), rightX, currY, { align: 'right' });

      currY += 8;
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('RESPONSE TIME:', rightX, currY, { align: 'right' });
      
      currY += 5;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(log.respondedTime ? new Date(log.respondedTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Waiting...', rightX, currY, { align: 'right' });

      if (isAdmin && (log.ipAddress || log.deviceImei)) {
        currY += 7;
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(`IP: ${log.ipAddress || 'N/A'} | SN: ${log.deviceImei || 'N/A'}`, rightX, currY, { align: 'right' });
      }

      startY += cardHeight + cardSpacing;
      currentLogIndex++;
    }
    
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  if (logs.length === 0) {
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(12);
    doc.text('No visitor records found for the selected criteria.', pageWidth / 2, 80, { align: 'center' });
  }

  doc.save(`Orchid_Heights_Visitors_${new Date().getTime()}.pdf`);
};

export const generateGymTheatrePDF = async (logs: GymTheatreLog[], title: string, subtitle: string, isAdmin: boolean = false, owners: any[] = []) => {
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
      const ownerMatch = owners.find(o => `${o.wing}-${o.flatNo}` === log.flatId);
      const ownerName = ownerMatch ? ownerMatch.nameEn : 'Resident';
      const displayName = log.memberName ? `${ownerName} [${log.memberName}]` : ownerName;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, startY, contentWidth, cardHeight, 3, 3, 'FD');

      const photoSize = 50;
      const photoX = margin + 5;
      const photoY = startY + 5;
      doc.setDrawColor(226, 232, 240);
      doc.rect(photoX, photoY, photoSize, photoSize);
      
      try {
        if (log.exitPhotoUrl) {
          const base64Img = log.exitPhotoUrl.startsWith('data:image') ? log.exitPhotoUrl : await getBase64ImageFromURL(log.exitPhotoUrl);
          const imgProps = doc.getImageProperties(base64Img);
          const scale = Math.min(photoSize / imgProps.width, photoSize / imgProps.height);
          doc.addImage(base64Img, imgProps.fileType, photoX + (photoSize - imgProps.width * scale) / 2, photoY + (photoSize - imgProps.height * scale) / 2, imgProps.width * scale, imgProps.height * scale);
        } else {
          doc.setTextColor(156, 163, 175);
          doc.setFontSize(8);
          doc.text('No Exit Photo', photoX + photoSize / 2, photoY + photoSize / 2, { align: 'center' });
        }
      } catch (err) {
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(8);
        doc.text('No Exit Photo', photoX + photoSize / 2, photoY + photoSize / 2, { align: 'center' });
      }

      const sepX = photoX + photoSize + 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(sepX, startY + 5, sepX, startY + cardHeight - 5);

      const textX = sepX + 8;
      let currY = startY + 12;

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(sanitizeText(log.amenity).toUpperCase() + ' ACCESS', textX, currY);

      currY += 7;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Flat: ${log.flatId} (${sanitizeText(ownerName)})`, textX, currY);
      
      if (log.memberName) {
        currY += 5;
        doc.setFont('helvetica', 'bold');
        doc.text(`Member: ${sanitizeText(log.memberName)}`, textX, currY);
        doc.setFont('helvetica', 'normal');
      }

      currY += 6;
      doc.text(`Duration: ${log.durationMinutes ? log.durationMinutes + ' mins' : 'In Progress'}`, textX, currY);

      const rightX = pageWidth - margin - 5;
      currY = startY + 12;

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('CHECK-IN:', rightX, currY, { align: 'right' });
      
      currY += 5;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(new Date(log.checkInTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), rightX, currY, { align: 'right' });

      currY += 8;
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('CHECK-OUT:', rightX, currY, { align: 'right' });
      
      currY += 5;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(log.checkOutTime ? new Date(log.checkOutTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '---', rightX, currY, { align: 'right' });

      if (isAdmin && (log.ipAddress || log.deviceImei)) {
        currY += 7;
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(`IP: ${log.ipAddress || 'N/A'} | SN: ${log.deviceImei || 'N/A'}`, rightX, currY, { align: 'right' });
      }

      startY += cardHeight + cardSpacing;
      currentLogIndex++;
    }
    
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  if (logs.length === 0) {
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(12);
    doc.text('No logs found for the selected criteria.', pageWidth / 2, 80, { align: 'center' });
  }

  doc.save(`Orchid_Heights_GymTheatre_${new Date().getTime()}.pdf`);
};

export const generateMoviePDF = async (logs: any[], title: string, subtitle: string, isAdmin: boolean = false, owners: any[] = []) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const logsPerPage = 2; // Reduced to fit more details like Synopsis
  const cardHeight = 110;
  const cardSpacing = 5;

  let currentLogIndex = 0;
  
  while (currentLogIndex < logs.length) {
    if (currentLogIndex > 0) doc.addPage();
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    let startY = 43;

    for (let i = 0; i < logsPerPage && currentLogIndex < logs.length; i++) {
      const log = logs[currentLogIndex];
      // Note: Movie schedule uses `postedBy` to store flatId (e.g., 'A-101')
      const flatId = log.postedBy || log.hostFlat; 
      const ownerMatch = owners.find(o => `${o.wing}-${o.flatNo}` === flatId);
      const ownerName = ownerMatch ? ownerMatch.nameEn : 'Resident';

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, startY, contentWidth, cardHeight, 3, 3, 'FD');

      const photoSize = 75;
      const photoX = margin + 5;
      const photoY = startY + 5;
      doc.setDrawColor(226, 232, 240);
      doc.rect(photoX, photoY, photoSize, photoSize);
      
      try {
        if (log.posterUrl) {
          const base64Img = log.posterUrl.startsWith('data:image') ? log.posterUrl : await getBase64ImageFromURL(log.posterUrl);
          const imgProps = doc.getImageProperties(base64Img);
          const scale = Math.min(photoSize / imgProps.width, photoSize / imgProps.height);
          doc.addImage(base64Img, imgProps.fileType, photoX + (photoSize - imgProps.width * scale) / 2, photoY + (photoSize - imgProps.height * scale) / 2, imgProps.width * scale, imgProps.height * scale);
        } else {
          doc.setTextColor(156, 163, 175);
          doc.setFontSize(10);
          doc.text('No Poster', photoX + photoSize / 2, photoY + photoSize / 2, { align: 'center' });
        }
      } catch (err) {
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(10);
        doc.text('No Poster', photoX + photoSize / 2, photoY + photoSize / 2, { align: 'center' });
      }

      const sepX = photoX + photoSize + 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(sepX, startY + 5, sepX, startY + cardHeight - 5);

      const textX = sepX + 8;
      let currY = startY + 12;

      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(sanitizeText(log.title, 'Movie/Event').toUpperCase(), textX, currY);

      // Genre & Rating
      currY += 7;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${sanitizeText(log.genre) || 'Entertainment'} | Rating: ${sanitizeText(log.rating) || 'UA'}`, textX, currY);

      // Date & Time
      currY += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`Scheduled: ${sanitizeText(log.date)} (${sanitizeText(log.day)}) at ${sanitizeText(log.timing)}`, textX, currY);

      // Duration
      currY += 6;
      doc.text(`Duration: ${sanitizeText(log.length) || 'N/A'}`, textX, currY);
      
      // Flat Info
      currY += 6;
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(`Hosted By: Flat ${flatId} (${sanitizeText(ownerName)})`, textX, currY);

      // Synopsis Title
      currY += 8;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SYNOPSIS', textX, currY);
      
      // Synopsis Content (Wrapped)
      currY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      const synopsisLines = doc.splitTextToSize(sanitizeText(log.synopsis) || 'No synopsis provided.', contentWidth - (textX - margin) - 10);
      // Limit to 4 lines maximum to avoid overflow
      const maxLines = 4;
      const truncatedLines = synopsisLines.slice(0, maxLines);
      if (synopsisLines.length > maxLines) {
          truncatedLines[maxLines - 1] = truncatedLines[maxLines - 1].substring(0, truncatedLines[maxLines - 1].length - 3) + '...';
      }
      doc.text(truncatedLines, textX, currY);

      // Trailer Link Status
      const rightX = pageWidth - margin - 5;
      if (log.trailerUrl) {
        doc.setTextColor(37, 99, 235);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Trailer Available', rightX, startY + cardHeight - 8, { align: 'right' });
      }

      startY += cardHeight + cardSpacing;
      currentLogIndex++;
    }
    
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  if (logs.length === 0) {
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(12);
    doc.text('No movies found for the selected criteria.', pageWidth / 2, 80, { align: 'center' });
  }

  doc.save(`Orchid_Heights_Movies_${new Date().getTime()}.pdf`);
};


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
      const ownerMatch = owners.find((o: any) => `${o.wing}-${o.flatNo}` === log.flatId);
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
      doc.text(`Flat: ${log.flatId} (${sanitizeText(ownerName)})`, textX, currY);
      
      currY += 6;
      doc.text(`Reason: ${sanitizeText(log.reason)}`, textX, currY);
      
      currY += 6;
      doc.text(`Status: ${sanitizeText(log.status).toUpperCase()}`, textX, currY);

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
    doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  if (logs.length === 0) {
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(12);
    doc.text('No amenity bookings found.', pageWidth / 2, 80, { align: 'center' });
  }

  doc.save(`Orchid_Heights_Amenities_${new Date().getTime()}.pdf`);
};

export const generateDeviceHistoryPDF = async (sessions: any[], title: string, subtitle: string, ownerName: string) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const logsPerPage = 4;
  const cardHeight = 55;
  const cardSpacing = 5;

  let currentLogIndex = 0;

  while (currentLogIndex < sessions.length) {
    if (currentLogIndex > 0) doc.addPage();
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    
    let startY = 43;
    for (let i = 0; i < logsPerPage && currentLogIndex < sessions.length; i++) {
      const session = sessions[currentLogIndex];
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, startY, contentWidth, cardHeight, 3, 3, 'FD');

      const textX = margin + 5;
      let currY = startY + 10;
      
      const deviceType = session.os === 'Android' || session.os === 'iOS' ? 'Phone' : 'Laptop';
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      
      const phoneDisplay = session.phoneNumber ? `(${session.phoneNumber})` : '';
      const name = session.memberName || ownerName;
      const isMobile = session.os === 'Android' || session.os === 'iOS';
      const icon = isMobile ? 'Mobile: ' : 'PC: ';
      
      doc.text(`${icon}${sanitizeText(name).toUpperCase()} ${phoneDisplay}`, textX, currY);

      currY += 7;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${session.os || 'Unknown OS'} • ${session.browser || 'Unknown Browser'} • ${isMobile ? 'Phone' : 'Laptop'}`, textX, currY);
      
      currY += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`IMEI: ${session.imei || 'N/A'}`, textX, currY);
      
      currY += 5;
      doc.text(`IP: ${session.ipAddress || 'Unknown'}`, textX, currY);

      currY += 5;
      doc.text(`Login: ${new Date(session.lastLogin).toLocaleString('en-IN')}`, textX, currY);
      
      currY += 5;
      const logoutText = session.logoutTime ? new Date(session.logoutTime).toLocaleString('en-IN') : '........';
      doc.text(`Logout: ${logoutText}`, textX, currY);

      startY += cardHeight + cardSpacing;
      currentLogIndex++;
    }

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  if (sessions.length === 0) {
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(12);
    doc.text('No device session history found.', pageWidth / 2, 80, { align: 'center' });
  }
  
  doc.save(`Orchid_Heights_Devices_${new Date().getTime()}.pdf`);
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
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  while (currentLogIndex < logs.length) {
    if (currentLogIndex > 0) doc.addPage();
    await drawPDFHeader(doc, title, subtitle, pageWidth);

    let startY = 43;

    for (let i = 0; i < logsPerPage && currentLogIndex < logs.length; i++) {
      const log = logs[currentLogIndex];
      const ownerMatch = owners.find((o: any) => `${o.wing}-${o.flatNo}` === log.flatId);
      const ownerName = ownerMatch ? ownerMatch.nameEn : 'Resident';
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, startY, contentWidth, cardHeight, 3, 3, 'FD');

      let headerName = ownerName;
      if (log.memberPhone) {
        if (ownerMatch && ownerMatch.phone === log.memberPhone) {
          headerName = `${ownerName} (${log.memberPhone})`;
        } else if (ownerMatch && ownerMatch.members) {
          const matchedMember = ownerMatch.members.find((m: string) => m.includes(log.memberPhone));
          if (matchedMember) {
            headerName = matchedMember;
          } else {
            headerName = `${sanitizeText(log.memberName, ownerName)} (${log.memberPhone})`;
          }
        } else {
          headerName = `${sanitizeText(log.memberName, ownerName)} (${log.memberPhone})`;
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
      doc.text(`Flat: ${log.flatId} (${sanitizeText(ownerName)})`, textX, currY);
      
      if (ownerMatch && ownerMatch.phone) {
          currY += 5;
          doc.text(`Phone: ${ownerMatch.phone}`, textX, currY);
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
          doc.text(`OUT: ${new Date(log.checkOutTime).toLocaleString('en-IN')} (${formatDuration(log.checkInTime, log.checkOutTime)})`, rightX, currY, { align: 'right' });
      } else {
          doc.text('OUT: PENDING', rightX, currY, { align: 'right' });
      }

      startY += cardHeight + cardSpacing;
      currentLogIndex++;
    }

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${doc.internal.pages.length - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  if (logs.length === 0) {
    await drawPDFHeader(doc, title, subtitle, pageWidth);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(12);
    doc.text('No gym records found.', pageWidth / 2, 80, { align: 'center' });
  }

  doc.save(`Orchid_Heights_Gym_${new Date().getTime()}.pdf`);
};
