// Refactored quotation PDF exporter with helpers, constants, and cleaner layout
// Keeps the same API: default export is a function returning { generateQuotationPDF }

// No React import needed; this is a utility, not a component

const NAVY = {
  bg: [25, 55, 109],          // container/page accent
  accent1: [25, 55, 109],
  accent2: [35, 75, 139],
  accent3: [45, 95, 169],
  accent4: [55, 115, 199],
  text: [25, 55, 109]
};

const GREY = {
  text: [51, 51, 51],
  subtle: [102, 102, 102],
  border: [224, 224, 224],
  divider: [240, 240, 240],
  panel: [248, 249, 250]
};

const SIZES = {
  pageHeight: 297, // A4 height in mm
  containerWidth: 180,
  containerY: 20,
  cornerRadius: 3,
  padding: 15,
  rowGap: 6
};

// Helpers
const formatCurrency = (amount) => {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Math.round(safe));
};

const setText = (pdf, size, color, font = 'normal') => {
  pdf.setFont('helvetica', font);
  pdf.setFontSize(size);
  pdf.setTextColor(color[0], color[1], color[2]);
};

const drawDivider = (pdf, x1, y, x2) => {
  pdf.setDrawColor(GREY.divider[0], GREY.divider[1], GREY.divider[2]);
  pdf.line(x1, y, x2, y);
};

const drawColoredBars = (pdf, x, y, colors, width = 2, gap = 3, height = 8) => {
  colors.forEach((c, i) => {
    pdf.setFillColor(c[0], c[1], c[2]);
    pdf.rect(x + (i * (width + gap)), y, width, height, 'F');
  });
};

const textRight = (pdf, text, xRight, y) => {
  pdf.text(String(text), xRight, y, { align: 'right' });
};

// Compute financials, prefer items when available
const computeTotals = (quotation, items, taxRate, discount) => {
  const subtotalFromItems = Array.isArray(items) && items.length > 0
    ? items.reduce((sum, it) => sum + (Number(it.quantity || it.qty || 0) * Number(it.price || 0)), 0)
    : 0;
  const baseSubtotal = subtotalFromItems > 0 ? subtotalFromItems : Number(quotation.total || 0);
  const safeSubtotal = Math.max(0, baseSubtotal);
  const safeTaxRate = Number.isFinite(taxRate) ? Math.max(0, taxRate) : 0;
  const tax = Math.round(safeSubtotal * safeTaxRate);
  const safeDiscount = Number.isFinite(discount) && discount > 0 ? Math.min(discount, safeSubtotal) : 0;
  const total = Math.max(0, safeSubtotal + tax - safeDiscount);
  return { subtotal: safeSubtotal, tax, discount: safeDiscount, total };
};

function QuotationPDFExporter() {
  const generateQuotationPDF = async (quotation, settings = {}) => {
    const { jsPDF } = await import('jspdf');

    // Setup
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const containerX = (pageWidth - SIZES.containerWidth) / 2;
    const containerY = SIZES.containerY;
    const innerX = containerX + SIZES.padding;
    const innerWidth = SIZES.containerWidth - (SIZES.padding * 2);

    // Background
    pdf.setFillColor(NAVY.bg[0], NAVY.bg[1], NAVY.bg[2]);
    pdf.rect(0, 0, pageWidth, SIZES.pageHeight, 'F');

    // White container
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(containerX, containerY, SIZES.containerWidth, 250, SIZES.cornerRadius, SIZES.cornerRadius, 'F');

    // Header bars + company
    let y = containerY + 15;
    drawColoredBars(pdf, innerX, y, [NAVY.accent1, NAVY.accent2, NAVY.accent3, NAVY.accent4]);

    setText(pdf, 18, GREY.text, 'bold');
    pdf.text(settings.company_name || 'Quotation Apps', innerX + 20, y + 6);

    setText(pdf, 10, GREY.subtle);
    pdf.text(settings.company_address || 'Solusi Penawaran Profesional', innerX + 20, y + 12);

    // Quotation header box
    const headerBoxWidth = 65;
    const headerBoxX = containerX + SIZES.containerWidth - headerBoxWidth - SIZES.padding;

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(headerBoxX, y - 5, headerBoxWidth, 40, 2, 2, 'F');

    setText(pdf, 16, GREY.text, 'bold');
    pdf.text('QUOTATION', headerBoxX + headerBoxWidth / 2, y + 2, { align: 'center' });

    setText(pdf, 10, GREY.text);
    pdf.text('Penawaran Harga', headerBoxX + headerBoxWidth / 2, y + 8, { align: 'center' });

    setText(pdf, 8, GREY.subtle);
    const numberStr = quotation.quotation_number || (quotation.id ? `QT-${quotation.id}` : 'QT-XXXX');
    const dateStr = new Date(quotation.date || quotation.created_at || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const statusStr = (quotation.status || 'Draft');
    pdf.text(`No. Quotation: ${numberStr}`, headerBoxX + 5, y + 16);
    pdf.text(`Tanggal: ${dateStr}`, headerBoxX + 5, y + 19);
    pdf.text(`Status: ${statusStr}`, headerBoxX + 5, y + 22);

    setText(pdf, 12, NAVY.text, 'bold');
    pdf.text(`Total: ${formatCurrency(Number(quotation.total || 0))}`, headerBoxX + headerBoxWidth / 2, y + 30, { align: 'center' });

    // Content divider
    y += 45;
    drawDivider(pdf, containerX + SIZES.padding, y, containerX + SIZES.containerWidth - SIZES.padding);

    // Two columns
    y += 15;
    const leftX = innerX;
    const rightX = containerX + (SIZES.containerWidth / 2) + 5;

    // Customer info
    setText(pdf, 12, NAVY.text, 'bold');
    pdf.text('Ditujukan Kepada', leftX, y);

    y += 8;
    setText(pdf, 12, GREY.text, 'bold');
    const customerName = quotation.customer || quotation.customer_name || 'Nama Customer';
    pdf.text(customerName, leftX, y);

    y += 6;
    setText(pdf, 9, GREY.text);
    pdf.text('Calon Pelanggan', leftX, y); y += 4;
    pdf.text(`Telepon: ${quotation.customer_phone || '-'}`, leftX, y); y += 4;
    pdf.text(`Email: ${quotation.customer_email || '-'}`, leftX, y);

    // Project info (right)
    let yRight = (y - 18); // align titles
    setText(pdf, 12, NAVY.text, 'bold');
    pdf.text('Detail Proyek', rightX, yRight);

    yRight += 8;
    setText(pdf, 9, GREY.text);
    pdf.text('Penawaran harga untuk layanan profesional dan solusi yang akan disediakan sesuai kebutuhan klien.', rightX, yRight, { maxWidth: 70 });

    yRight += 8;
    drawDivider(pdf, rightX, yRight, rightX + 70);
    yRight += 4;

    setText(pdf, 9, GREY.text);
    const validDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    pdf.text(`Valid hingga: ${validDate}`, rightX, yRight); yRight += 4;
    pdf.text(`Referensi: ${numberStr.replace('QT-', 'QT-')}`, rightX, yRight);

    // Items table
    let yTable = Math.max(y, yRight) + 15;
    pdf.setDrawColor(GREY.border[0], GREY.border[1], GREY.border[2]);
    drawDivider(pdf, containerX + SIZES.padding, yTable, containerX + SIZES.containerWidth - SIZES.padding);

    yTable += 8;
    setText(pdf, 10, GREY.text, 'bold');
    const colWidths = [12, 65, 18, 28, 28];
    let colX = containerX + SIZES.padding;
    const headers = ['NO', 'DESKRIPSI ITEM', 'QTY', 'HARGA', 'JUMLAH'];
    [headers[0], headers[1], headers[2], headers[3], headers[4]].forEach((h, i) => {
      pdf.text(h, colX, yTable);
      colX += colWidths[i];
    });

    yTable += 8;
    setText(pdf, 9, GREY.text);

    const items = Array.isArray(quotation.items) ? quotation.items : [];
    const bottomLimit = containerY + 250 - 60; // keep room for summary & footer

    if (items.length > 0) {
      items.forEach((item, index) => {
        if (yTable > bottomLimit) return; // simple clamp to avoid overflow
        colX = containerX + SIZES.padding;
        pdf.text(String(index + 1), colX, yTable);
        colX += colWidths[0];

        // Name and optional description (wrap)
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.name || item.description || 'Item', colX, yTable, { maxWidth: 60 });
        pdf.setFont('helvetica', 'normal');

        colX += colWidths[1];
        pdf.text(String(item.quantity || item.qty || 1), colX, yTable);
        colX += colWidths[2];
        pdf.text(formatCurrency(Number(item.price || 0)), colX, yTable);
        colX += colWidths[3];
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatCurrency((Number(item.quantity || item.qty || 1) * Number(item.price || 0))), colX, yTable);
        pdf.setFont('helvetica', 'normal');

        yTable += SIZES.rowGap;
      });
    } else {
      // Fallback single row when no items
      colX = containerX + SIZES.padding;
      pdf.text('1', colX, yTable); colX += colWidths[0];
      pdf.setFont('helvetica', 'bold'); pdf.text('Layanan Profesional', colX, yTable); pdf.setFont('helvetica', 'normal');
      colX += colWidths[1]; pdf.text('1', colX, yTable);
      colX += colWidths[2]; pdf.text(formatCurrency(Number(quotation.total || 0)), colX, yTable);
      colX += colWidths[3]; pdf.setFont('helvetica', 'bold'); pdf.text(formatCurrency(Number(quotation.total || 0)), colX, yTable); pdf.setFont('helvetica', 'normal');
      yTable += SIZES.rowGap;
    }

    // Summary & Terms
    let ySummaryTop = yTable + 15;

    // Left: Syarat & Ketentuan
    setText(pdf, 12, NAVY.text, 'bold');
    pdf.text('Syarat & Ketentuan', leftX, ySummaryTop);

    let yBars = ySummaryTop + 6;
    drawColoredBars(pdf, leftX, yBars, [NAVY.accent1, NAVY.accent2, NAVY.accent3, NAVY.accent4], 8, 6, 8);

    let yTerms = yBars + 10;
    setText(pdf, 8, GREY.text);
    pdf.text('• Penawaran berlaku selama 30 hari kalender', leftX, yTerms);
    yTerms += 4; pdf.text('• Pembayaran: 50% DP, 50% setelah selesai', leftX, yTerms);
    yTerms += 4; pdf.text('• Harga belum termasuk pajak (PPN 11%)', leftX, yTerms);

    // Right: Summary calculation
    const taxRate = Number.isFinite(quotation.taxRate) ? quotation.taxRate : (Number.isFinite(settings.tax_rate) ? settings.tax_rate : 0.11);
    const discount = Number.isFinite(quotation.discount) && quotation.discount > 0 ? quotation.discount : 0;
    const { subtotal, tax, discount: safeDiscount, total } = computeTotals(quotation, items, taxRate, discount);

    const summaryX = rightX;
    let summaryY = ySummaryTop + 2; // align with left title

    setText(pdf, 8, GREY.text);
    pdf.text('Sub-Total:', summaryX, summaryY);
    textRight(pdf, formatCurrency(subtotal), summaryX + 55, summaryY);
    summaryY += 4;

    pdf.text(`Pajak (${Math.round(taxRate * 100)}%):`, summaryX, summaryY);
    textRight(pdf, formatCurrency(tax), summaryX + 55, summaryY);
    summaryY += 4;

    if (safeDiscount > 0) {
      pdf.text('Diskon:', summaryX, summaryY);
      textRight(pdf, `-${formatCurrency(safeDiscount)}`, summaryX + 55, summaryY);
      summaryY += 4;
    }

    summaryY += 2;
    pdf.setDrawColor(GREY.border[0], GREY.border[1], GREY.border[2]);
    pdf.line(summaryX, summaryY, summaryX + 55, summaryY);
    summaryY += 5;

    setText(pdf, 10, NAVY.text, 'bold');
    pdf.text('TOTAL PENAWARAN:', summaryX, summaryY);
    textRight(pdf, formatCurrency(total), summaryX + 55, summaryY);

    // Footer (ensure spacing below the lowest section)
    y = Math.max(yTerms, summaryY) + 10;
    pdf.setFillColor(GREY.panel[0], GREY.panel[1], GREY.panel[2]);
    pdf.rect(containerX + SIZES.padding, y, innerWidth, 35, 'F');

    setText(pdf, 10, GREY.text, 'bold');
    pdf.text('Terima Kasih Atas Kepercayaan Anda!', leftX, y + 8);

    setText(pdf, 7, GREY.subtle);
    pdf.text('Kami siap memberikan solusi terbaik untuk kebutuhan bisnis Anda. Silakan hubungi kami untuk diskusi lebih lanjut mengenai penawaran ini dan proses implementasinya.', leftX, y + 15, { maxWidth: 70 });

    setText(pdf, 10, GREY.text, 'bold');
    pdf.text('Hormat Kami', rightX, y + 8);

    setText(pdf, 8, GREY.subtle);
    pdf.text(settings.company_name || 'Tim Quotation Apps', rightX, y + 15);
    pdf.text('Sales Manager', rightX, y + 19);

    drawColoredBars(pdf, rightX + 40, y + 12, [NAVY.accent1, NAVY.accent2, NAVY.accent3, NAVY.accent4], 2, 3, 8);

    return pdf;
  };

  return { generateQuotationPDF };
}

export default QuotationPDFExporter;
