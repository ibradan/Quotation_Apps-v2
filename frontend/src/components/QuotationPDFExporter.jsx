import React from 'react';

const QuotationPDFExporter = () => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const generateQuotationPDF = async (quotation, settings = {}) => {
    try {
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const containerWidth = 180;
      const containerX = (pageWidth - containerWidth) / 2;
      const containerY = 20;
      
      // Background
      pdf.setFillColor(25, 55, 109); // Biru dongker untuk quotation
      pdf.rect(0, 0, pageWidth, 297, 'F');
      
      // White container
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(containerX, containerY, containerWidth, 250, 3, 3, 'F');
      
      // Header
      let y = containerY + 15;
      const barColors = [
        [25, 55, 109], [35, 75, 139], [45, 95, 169], [55, 115, 199] // Variasi biru dongker ke terang
      ];
      
      let x = containerX + 15;
      barColors.forEach((color, index) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(x + (index * 3), y, 2, 8, 'F');
      });
      
      // Company info
      pdf.setFontSize(18);
      pdf.setTextColor(51, 51, 51);
      pdf.setFont('helvetica', 'bold');
      pdf.text(settings.company_name || 'Quotation Apps', x + 20, y + 6);
      
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.setFont('helvetica', 'normal');
      pdf.text(settings.company_address || 'Solusi Penawaran Profesional', x + 20, y + 12);
      
      // Quotation header
      const headerBoxWidth = 65;
      const headerBoxX = containerX + containerWidth - headerBoxWidth - 15;
      
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(headerBoxX, y - 5, headerBoxWidth, 40, 2, 2, 'F');
      
      pdf.setFontSize(16);
      pdf.setTextColor(51, 51, 51);
      pdf.setFont('helvetica', 'bold');
      pdf.text('QUOTATION', headerBoxX + headerBoxWidth/2, y + 2, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text('Penawaran Harga', headerBoxX + headerBoxWidth/2, y + 8, { align: 'center' });
      
      pdf.setFontSize(8);
      pdf.setTextColor(102, 102, 102);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`No. Quotation: ${quotation.quotation_number || 'QT-' + quotation.id}`, headerBoxX + 5, y + 16);
      pdf.text(`Tanggal: ${new Date(quotation.date || quotation.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, headerBoxX + 5, y + 19);
      pdf.text(`Status: ${quotation.status || 'Draft'}`, headerBoxX + 5, y + 22);
      
      pdf.setFontSize(12);
      pdf.setTextColor(25, 55, 109); // Biru dongker untuk total
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total: ${formatCurrency(quotation.total || 0)}`, headerBoxX + headerBoxWidth/2, y + 30, { align: 'center' });
      
      // Content
      y += 45;
      pdf.setDrawColor(240, 240, 240);
      pdf.line(containerX + 15, y, containerX + containerWidth - 15, y);
      
      y += 15;
      const leftX = containerX + 15;
      const rightX = containerX + containerWidth/2 + 5;
      
      // Customer info
      pdf.setFontSize(12);
      pdf.setTextColor(25, 55, 109); // Biru dongker untuk section headers
      pdf.setFont('helvetica', 'bold');
      pdf.text('Ditujukan Kepada', leftX, y);
      
      y += 8;
      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51);
      pdf.setFont('helvetica', 'bold');
      pdf.text(quotation.customer || 'Nama Customer', leftX, y);
      
      y += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('Calon Pelanggan', leftX, y);
      y += 4;
      pdf.text('Telepon: -', leftX, y);
      y += 4;
      pdf.text('Email: -', leftX, y);
      
      // Project info
      y -= 18;
      pdf.setTextColor(25, 55, 109); // Biru dongker untuk section headers
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detail Proyek', rightX, y);
      
      y += 8;
      pdf.setTextColor(51, 51, 51);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Penawaran harga untuk layanan profesional dan solusi yang akan disediakan sesuai dengan kebutuhan klien.', rightX, y, { maxWidth: 70 });
      
      y += 8;
      pdf.setDrawColor(240, 240, 240);
      pdf.line(rightX, y, rightX + 70, y);
      y += 4;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const validDate = new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      pdf.text(`Valid hingga: ${validDate}`, rightX, y);
      y += 4;
      pdf.text(`Referensi: QT-${quotation.id || Math.floor(Math.random() * 1000000)}`, rightX, y);
      
      // Table
      y += 15;
      pdf.setDrawColor(224, 224, 224);
      pdf.line(containerX + 15, y, containerX + containerWidth - 15, y);
      
      y += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);
      pdf.setFont('helvetica', 'bold');
      
      const colWidths = [12, 65, 18, 28, 28];
      let colX = containerX + 15;
      
      pdf.text('NO', colX, y);
      colX += colWidths[0];
      pdf.text('DESKRIPSI ITEM', colX, y);
      colX += colWidths[1];
      pdf.text('QTY', colX, y);
      colX += colWidths[2];
      pdf.text('HARGA', colX, y);
      colX += colWidths[3];
      pdf.text('JUMLAH', colX, y);
      
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      // Render items
      const items = quotation.items || [];
      if (items.length > 0) {
        items.forEach((item, index) => {
          colX = containerX + 15;
          pdf.text((index + 1).toString(), colX, y);
          colX += colWidths[0];
          pdf.setFont('helvetica', 'bold');
          pdf.text(item.name || item.description || 'Item', colX, y);
          pdf.setFont('helvetica', 'normal');
          if (item.description && item.name) {
            y += 3;
            pdf.setFontSize(8);
            pdf.setTextColor(102, 102, 102);
            pdf.text(item.description, colX, y, { maxWidth: 60 });
            pdf.setFontSize(9);
            pdf.setTextColor(51, 51, 51);
            y -= 3;
          }
          colX += colWidths[1];
          pdf.text((item.quantity || 1).toString(), colX, y);
          colX += colWidths[2];
          pdf.text(formatCurrency(item.price || 0), colX, y);
          colX += colWidths[3];
          pdf.setFont('helvetica', 'bold');
          pdf.text(formatCurrency((item.quantity || 1) * (item.price || 0)), colX, y);
          pdf.setFont('helvetica', 'normal');
          y += 6;
        });
      } else {
        // Default item if no items provided
        colX = containerX + 15;
        pdf.text('1', colX, y);
        colX += colWidths[0];
        pdf.setFont('helvetica', 'bold');
        pdf.text('Layanan Profesional', colX, y);
        colX += colWidths[1];
        pdf.setFont('helvetica', 'normal');
        pdf.text('1', colX, y);
        colX += colWidths[2];
        pdf.text(formatCurrency(quotation.total || 0), colX, y);
        colX += colWidths[3];
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatCurrency(quotation.total || 0), colX, y);
        y += 6;
      }
      
      // Summary
      y += 15;
      
      pdf.setFontSize(10);
      pdf.setTextColor(25, 55, 109); // Biru dongker untuk section headers
      pdf.setFont('helvetica', 'bold');
      pdf.text('Syarat & Ketentuan', leftX, y);
      
      y += 6;
      let barX = leftX;
      barColors.forEach((color, index) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(barX, y, 4, 3, 'F');
        barX += 5;
      });
      
      y += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(51, 51, 51);
      pdf.text('• Penawaran berlaku selama 30 hari kalender', leftX, y);
      y += 4;
      pdf.text('• Pembayaran: 50% DP, 50% setelah selesai', leftX, y);
      y += 4;
      pdf.text('• Harga belum termasuk pajak (PPN 11%)', leftX, y);
      
      // Summary calculation section - positioned properly
      const summaryStartY = y - 12; // Align with terms section
      const summaryX = rightX;
      
      pdf.setFontSize(8);
      pdf.setTextColor(51, 51, 51);
      pdf.setFont('helvetica', 'normal');
      
      const subtotal = quotation.total || 0;
      const tax = subtotal * 0.11;
      const discount = quotation.discount && quotation.discount > 0 ? quotation.discount : 0;
      const total = subtotal + tax - discount;
      
      let summaryY = summaryStartY;
      
      // Sub-Total
      pdf.text('Sub-Total:', summaryX, summaryY);
      pdf.text(formatCurrency(subtotal), summaryX + 45, summaryY, { align: 'right' });
      summaryY += 4;
      
      // Pajak
      pdf.text('Pajak (11%):', summaryX, summaryY);
      pdf.text(formatCurrency(tax), summaryX + 45, summaryY, { align: 'right' });
      summaryY += 4;
      
      // Diskon - hanya tampilkan jika > 0
      if (discount > 0) {
        pdf.text('Diskon:', summaryX, summaryY);
        pdf.text(`-${formatCurrency(discount)}`, summaryX + 45, summaryY, { align: 'right' });
        summaryY += 4;
      }
      
      // Line separator
      summaryY += 2;
      pdf.setDrawColor(224, 224, 224);
      pdf.line(summaryX, summaryY, summaryX + 55, summaryY);
      summaryY += 5;
      
      // Total
      pdf.setFontSize(9);
      pdf.setTextColor(25, 55, 109); // Biru dongker untuk total
      pdf.setFont('helvetica', 'bold');
      pdf.text('TOTAL PENAWARAN:', summaryX, summaryY);
      pdf.text(formatCurrency(total), summaryX + 45, summaryY, { align: 'right' });
      
      // Adjust y for footer based on whichever section is lower
      y = Math.max(y, summaryY) + 8;
      
      // Footer
      y += 10;
      pdf.setFillColor(248, 249, 250);
      pdf.rect(containerX + 15, y, containerWidth - 30, 35, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Terima Kasih Atas Kepercayaan Anda!', leftX, y + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Kami siap memberikan solusi terbaik untuk kebutuhan bisnis Anda. Silakan hubungi kami untuk diskusi lebih lanjut mengenai penawaran ini dan proses implementasinya.', leftX, y + 15, { maxWidth: 70 });
      
      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Hormat Kami', rightX, y + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(102, 102, 102);
      pdf.text(settings.company_name || 'Tim Quotation Apps', rightX, y + 15);
      pdf.text('Sales Manager', rightX, y + 19);
      
      barX = rightX + 40;
      barColors.forEach((color, index) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(barX + (index * 3), y + 12, 2, 8, 'F');
      });
      
      return pdf;
      
    } catch (error) {
      console.error('Error generating quotation PDF:', error);
      throw error;
    }
  };

  return { generateQuotationPDF };
};

export default QuotationPDFExporter;
