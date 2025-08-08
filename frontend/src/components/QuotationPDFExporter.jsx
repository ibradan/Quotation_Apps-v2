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
  rowGap: 6,
  // Make container height dynamic so the white panel visually reaches near the bottom consistently
  containerHeight: 297 - (20 * 2) // pageHeight - (containerY * 2)
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

// Wrapped text helpers
const drawWrappedText = (pdf, text, x, y, maxWidth, lineHeight = 4) => {
  const lines = pdf.splitTextToSize(String(text ?? ''), maxWidth);
  lines.forEach((line, i) => pdf.text(line, x, y + i * lineHeight));
  return { newY: y + lines.length * lineHeight, lines };
};

const drawBulletList = (pdf, items, x, y, maxWidth, lineHeight = 4) => {
  let cursorY = y;
  items.forEach((t) => {
    // Wrap text and draw bullet for each wrapped block
    const { lines } = drawWrappedText(pdf, t, x + 5, cursorY, maxWidth, lineHeight);
    // Bullet at first line
    pdf.text('•', x, cursorY);
    cursorY += Math.max(lineHeight, lines.length * lineHeight);
  });
  return cursorY;
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
    pdf.roundedRect(containerX, containerY, SIZES.containerWidth, SIZES.containerHeight, SIZES.cornerRadius, SIZES.cornerRadius, 'F');

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

    // Removed header total text to keep header concise and avoid clutter
    // Previously: setText(pdf, 12, NAVY.text, 'bold'); pdf.text(`Total: ${formatCurrency(...)}`, ...)

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
    // Wrap customer name and advance Y accordingly
    const wrappedName = pdf.splitTextToSize(customerName, 80);
    wrappedName.forEach((line, i) => pdf.text(line, leftX, y + i * 4));
    y += Math.max(6, wrappedName.length * 4);

    setText(pdf, 9, GREY.text);
    pdf.text('Calon Pelanggan', leftX, y); y += 4;
    const contactLines = [];
    if (quotation.customer_phone) contactLines.push(`Telepon: ${quotation.customer_phone}`);
    if (quotation.customer_email) contactLines.push(`Email: ${quotation.customer_email}`);
    contactLines.forEach((line) => { pdf.text(line, leftX, y); y += 4; });

    // Project info (right)
    let yRight = (y - 18); // align titles
    setText(pdf, 12, NAVY.text, 'bold');
    pdf.text('Detail Proyek', rightX, yRight);

    yRight += 8;
    setText(pdf, 9, GREY.text);
    // Wrap project description and move yRight based on lines
    const projectDesc = 'Penawaran harga untuk layanan profesional dan solusi yang akan disediakan sesuai kebutuhan klien.';
    const { newY: afterDescY } = drawWrappedText(pdf, projectDesc, rightX, yRight, 70, 4);
    yRight = afterDescY;

    yRight += 4;
    drawDivider(pdf, rightX, yRight, rightX + 70);
    yRight += 4;

    setText(pdf, 9, GREY.text);
    const validDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    pdf.text(`Valid hingga: ${validDate}`, rightX, yRight); yRight += 4;
    pdf.text(`Referensi: ${numberStr}`, rightX, yRight);

    // Items table
    let yTable = Math.max(y, yRight) + 15;
    pdf.setDrawColor(GREY.border[0], GREY.border[1], GREY.border[2]);
    drawDivider(pdf, containerX + SIZES.padding, yTable, containerX + SIZES.containerWidth - SIZES.padding);

    // Page helpers: scaffold and numbering
    const drawPageScaffold = (isContinuation = false) => {
      // Background + container
      pdf.setFillColor(NAVY.bg[0], NAVY.bg[1], NAVY.bg[2]);
      pdf.rect(0, 0, pageWidth, SIZES.pageHeight, 'F');
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(containerX, containerY, SIZES.containerWidth, SIZES.containerHeight, SIZES.cornerRadius, SIZES.cornerRadius, 'F');
      if (isContinuation) {
        // Small continuation label near top-left inside the container
        setText(pdf, 9, GREY.subtle, 'bold');
        pdf.text('Lanjutan', containerX + SIZES.padding, containerY + 12);
        // Decorative bars
        drawColoredBars(pdf, containerX + SIZES.padding, containerY + 15, [NAVY.accent1, NAVY.accent2, NAVY.accent3, NAVY.accent4]);
      }
    };

    const drawPageNumberFooters = () => {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        setText(pdf, 8, GREY.subtle);
        pdf.text(`Halaman ${i} dari ${pageCount}`, pageWidth / 2, SIZES.pageHeight - 8, { align: 'center' });
      }
    };

    // Helper to draw a new continuation page with container and table header
    const addContinuationPage = () => {
      pdf.addPage();
      drawPageScaffold(true);
      // Start new table area
      yTable = containerY + 20;
      pdf.setDrawColor(GREY.border[0], GREY.border[1], GREY.border[2]);
      drawDivider(pdf, containerX + SIZES.padding, yTable, containerX + SIZES.containerWidth - SIZES.padding);
      yTable += 8;
      setText(pdf, 10, GREY.text, 'bold');
      let hx = containerX + SIZES.padding;
      ['NO', 'DESKRIPSI ITEM', 'QTY', 'HARGA', 'JUMLAH'].forEach((h, i) => {
        pdf.text(h, hx, yTable);
        hx += colWidths[i];
      });
      yTable += 8;
      setText(pdf, 9, GREY.text);
    };

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
    const bottomLimit = containerY + SIZES.containerHeight - 60; // keep room for summary & footer

    // Precompute right edges for numeric columns
    const startX = containerX + SIZES.padding;
    const priceColLeft = startX + colWidths[0] + colWidths[1] + colWidths[2];
    const amountColLeft = priceColLeft + colWidths[3];
    const priceColRight = priceColLeft + colWidths[3] - 2;
    const amountColRight = amountColLeft + colWidths[4] - 2;

    if (items.length > 0) {
      items.forEach((item, index) => {
        // Prepare wrapped name and row height
        const nameText = item.name || item.description || 'Item';
        const nameLines = pdf.splitTextToSize(nameText, 60);
        const lineHeight = 4;
        const rowHeight = Math.max(SIZES.rowGap, nameLines.length * lineHeight);
        // If this row would overflow, continue on a new page first
        if (yTable + rowHeight > bottomLimit) {
          addContinuationPage();
        }
        let cx = startX;
        pdf.text(String(index + 1), cx, yTable); cx += colWidths[0];

        // Name lines
        pdf.setFont('helvetica', 'bold');
        nameLines.forEach((line, i) => pdf.text(line, cx, yTable + i * lineHeight));
        pdf.setFont('helvetica', 'normal');

        cx += colWidths[1];
        pdf.text(String(item.quantity || item.qty || 1), cx, yTable);
        // Price (right-aligned)
        textRight(pdf, formatCurrency(Number(item.price || 0)), priceColRight, yTable);
        // Amount (right-aligned, bold)
        pdf.setFont('helvetica', 'bold');
        textRight(pdf, formatCurrency((Number(item.quantity || item.qty || 1) * Number(item.price || 0))), amountColRight, yTable);
        pdf.setFont('helvetica', 'normal');

        yTable += rowHeight;
      });
    } else {
      // Fallback single row when no items
      let cx = startX;
      pdf.text('1', cx, yTable); cx += colWidths[0];
      pdf.setFont('helvetica', 'bold'); pdf.text('Layanan Profesional', cx, yTable); pdf.setFont('helvetica', 'normal');
      cx += colWidths[1]; pdf.text('1', cx, yTable);
      textRight(pdf, formatCurrency(Number(quotation.total || 0)), priceColRight, yTable);
      pdf.setFont('helvetica', 'bold'); textRight(pdf, formatCurrency(Number(quotation.total || 0)), amountColRight, yTable); pdf.setFont('helvetica', 'normal');
      yTable += SIZES.rowGap;
    }

    // Summary & Terms
    let ySummaryTop = yTable + 15;

    // If summary would overflow, move to a new page
    if (ySummaryTop > bottomLimit) {
      addContinuationPage();
      ySummaryTop = containerY + 25;
    }

    // Left: Syarat & Ketentuan
    setText(pdf, 12, NAVY.text, 'bold');
    pdf.text('Syarat & Ketentuan', leftX, ySummaryTop);

    let yBars = ySummaryTop + 6;
    drawColoredBars(pdf, leftX, yBars, [NAVY.accent1, NAVY.accent2, NAVY.accent3, NAVY.accent4], 8, 6, 8);

    // Increase spacing below bars and indent bullet texts for neat layout
    let yTerms = yBars + 12;
    setText(pdf, 8, GREY.text);
    const bulletX = leftX;
    const textX = leftX + 5;
    // Dynamic tax percent label for terms
    const rawTaxForTerms = Number.isFinite(quotation.taxRate) ? quotation.taxRate : (Number.isFinite(settings.tax_rate) ? settings.tax_rate : 0.11);
    const taxRateForTerms = rawTaxForTerms > 1 ? rawTaxForTerms / 100 : rawTaxForTerms;
    const taxPercentLabel = Math.round(taxRateForTerms * 100);
    // Use wrapped bullet list; ensure it stays within left column width
    const termItems = [
      'Penawaran berlaku selama 30 hari kalender',
      'Pembayaran: 50% DP, 50% setelah selesai',
      `Harga belum termasuk pajak (PPN ${taxPercentLabel}%)`
    ];
    yTerms = drawBulletList(pdf, termItems, bulletX, yTerms, 74, 4);

    // Right: Summary calculation
    // Normalize tax rate (supports 11 and 0.11)
    const rawTaxRate = Number.isFinite(quotation.taxRate) ? quotation.taxRate : (Number.isFinite(settings.tax_rate) ? settings.tax_rate : 0.11);
    const taxRate = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
    const discount = Number.isFinite(quotation.discount) && quotation.discount > 0 ? quotation.discount : 0;
    const { subtotal, tax, discount: safeDiscount, total } = computeTotals(quotation, items, taxRate, discount);

    const summaryX = rightX;
    let summaryY = ySummaryTop + 2; // align with left title
    const summaryColWidth = 70; // widened to avoid overlap with labels

    setText(pdf, 8, GREY.text);
    pdf.text('Sub-Total:', summaryX, summaryY);
    textRight(pdf, formatCurrency(subtotal), summaryX + summaryColWidth, summaryY);
    summaryY += 4;

    pdf.text(`Pajak (${Math.round(taxRate * 100)}%):`, summaryX, summaryY);
    textRight(pdf, formatCurrency(tax), summaryX + summaryColWidth, summaryY);
    summaryY += 4;

    if (safeDiscount > 0) {
      pdf.text('Diskon:', summaryX, summaryY);
      textRight(pdf, `-${formatCurrency(safeDiscount)}`, summaryX + summaryColWidth, summaryY);
      summaryY += 4;
    }

    summaryY += 2;
    pdf.setDrawColor(GREY.border[0], GREY.border[1], GREY.border[2]);
    pdf.line(summaryX, summaryY, summaryX + summaryColWidth, summaryY);
    summaryY += 5;

    setText(pdf, 10, NAVY.text, 'bold');
    pdf.text('TOTAL PENAWARAN:', summaryX, summaryY);
    textRight(pdf, formatCurrency(total), summaryX + summaryColWidth, summaryY);

    // Footer (ensure spacing below the lowest section)
    y = Math.max(yTerms, summaryY) + 10;
    // If footer overflows, push to new page bottom
    if (y + 35 > containerY + SIZES.containerHeight - 10) {
      addContinuationPage();
      y = containerY + 20;
    }
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

    // Add page numbers to all pages
    drawPageNumberFooters();

    return pdf;
  };

  return { generateQuotationPDF };
}

export default QuotationPDFExporter;
