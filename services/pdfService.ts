import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AgendaGroup, AgendaItem, KopDinas, Pegawai, User } from '../types';
import { getAttendees } from './storageService';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';

export const generateAgendaPDF = (
  group: AgendaGroup,
  items: AgendaItem[],
  kop: KopDinas,
  author: User,
  pegawaiList: Pegawai[]
) => {
  // 1. Setup PDF F4 (Folio) Size: 215mm x 330mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [215, 330] 
  });

  let currentY = 15;
  const marginX = 20;
  const pageWidth = 215;
  
  // Header Logic
  // Shift Text Center slightly to the right to accommodate Logo on the left
  // Logo is at marginX (20). Width 25.
  // We want the text to be centered relative to the remaining space or just visually centered with offset.
  const logoWidth = 22;
  const logoHeight = 22;
  const textCenterX = marginX + logoWidth + ((pageWidth - marginX - marginX - logoWidth) / 2);

  // 2. Draw Header (Kop Dinas)
  if (kop.logoBase64) {
    try {
      // Optimasi Scale: Keep aspect ratio if needed, but here we fit into box
      doc.addImage(kop.logoBase64, 'PNG', marginX, currentY - 2, logoWidth, logoHeight);
    } catch (e) {
      console.warn("Could not load logo", e);
    }
  }

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  // Using textCenterX to shift text slightly right
  doc.text(kop.instansi_baris1.toUpperCase(), textCenterX, currentY + 6, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(kop.instansi_baris2.toUpperCase(), textCenterX, currentY + 14, { align: 'center' });

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text(kop.alamat, textCenterX, currentY + 21, { align: 'center' });
  doc.text(kop.kontak, textCenterX, currentY + 26, { align: 'center' });

  // Line separator (thick and thin)
  currentY += 32;
  doc.setLineWidth(1);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY + 1, pageWidth - marginX, currentY + 1);

  // 3. Document Title
  currentY += 10;
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("AGENDA KEGIATAN", pageWidth / 2, currentY, { align: 'center' });
  
  // Subtitle: Date
  let formattedDate = group.title;
  try {
    const dateObj = new Date(group.title);
    if(!isNaN(dateObj.getTime())) {
        formattedDate = format(dateObj, 'd MMMM yyyy', { locale: id });
    }
  } catch (e) {}

  doc.setFontSize(12);
  doc.text(formattedDate, pageWidth / 2, currentY + 6, { align: 'center' });

  currentY += 15;

  // 4. Data Preparation for AutoTable
  const tableBody = items.map(item => {
    const attendees = getAttendees(item, pegawaiList);
    
    // Construct rich "Keterangan"
    let keteranganText = "";
    
    // Add Manual Note
    if (item.manual_keterangan) {
      keteranganText += `${item.manual_keterangan}\n\n`;
    }

    // Add Attendees List
    if (attendees.length > 0) {
      keteranganText += "Hadir:\n";
      attendees.forEach(p => {
        keteranganText += `- ${p.nama} (${p.jabatan})\n`;
      });
    }

    // Pengampu Text based on User
    const pengampuText = `${author.name}\nDinas PMD Kab. Muba`;

    return [
      item.waktu,
      item.tempat,
      item.acara,
      keteranganText.trim(),
      pengampuText
    ];
  });

  // 5. Draw Table
  autoTable(doc, {
    startY: currentY,
    head: [['Waktu', 'Tempat', 'Acara', 'Keterangan', 'Pengampu']],
    body: tableBody,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 10,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      valign: 'top',
      textColor: [0,0,0]
    },
    headStyles: {
      fillColor: [255, 255, 255], 
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.1,
      lineColor: [0,0,0]
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Waktu
      1: { cellWidth: 35 }, // Tempat
      2: { cellWidth: 40 }, // Acara
      3: { cellWidth: 'auto' }, // Keterangan
      4: { cellWidth: 35 }, // Pengampu
    },
    margin: { left: marginX, right: marginX }
  });

  // 6. Footer & Signature
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  if (finalY > 280) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = finalY;
  }

  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const signatureX = pageWidth - marginX - 60;

  doc.setFont("times", "normal");
  doc.text(`${kop.kota_surat}, ${dateStr}`, signatureX, currentY);
  doc.text("Dinas PMD Kab. Muba", signatureX, currentY + 5);

  currentY += 25;

  doc.setFont("times", "bold");
  doc.text(author.name, signatureX, currentY);
  doc.setLineWidth(0.2);
  doc.line(signatureX, currentY + 1, signatureX + 50, currentY + 1); 
  
  if(author.nip && author.nip !== '-') {
      doc.setFont("times", "normal");
      doc.text(`NIP. ${author.nip}`, signatureX, currentY + 6);
  }

  // 7. Output
  window.open(doc.output('bloburl'), '_blank');
};