import jsPDF from 'jspdf';

export const generateInvoicePDF = (invoice, quotationData, companyInfo) => {
  try {
    console.log('Generating PDF for invoice:', invoice);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Colors - Simple and Clean
    const primaryBlue = [70, 130, 180]; // Steel Blue
    const darkGray = [60, 64, 67];
    const lightGray = [128, 134, 139];
    const borderGray = [200, 200, 200];
    
    // Company Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(companyInfo?.name || 'PT. Quotation Apps Indonesia', 20, 25);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('Jl. Technology Street No. 123', 20, 33);
    doc.text('Jakarta 12345', 20, 39);
    doc.text('Phone: +62 21 1234 5678', 20, 45);
    doc.text('Fax: [000-000-0000]', 20, 51);
    doc.text('Website: quotationapps.com', 20, 57);
    
    // INVOICE Title
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text('INVOICE', pageWidth - 20, 30, { align: 'right' });
    
    // Invoice Details Box
    const detailsY = 40;
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    
    // Create table for invoice details
    const tableData = [
      ['DATE', new Date(invoice.invoiceDate || invoice.created_at).toLocaleDateString('en-US')],
      ['INVOICE #', invoice.invoiceNumber || 'INV-202408-002'],
      ['CUSTOMER ID', '[123]'],
      ['DUE DATE', new Date(invoice.dueDate || invoice.due_date).toLocaleDateString('en-US')]
    ];
    
    let currentY = detailsY + 55;
    tableData.forEach((row, index) => {
      doc.rect(pageWidth - 80, currentY, 35, 8);
      doc.rect(pageWidth - 45, currentY, 35, 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(row[0], pageWidth - 78, currentY + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.text(row[1], pageWidth - 43, currentY + 5);
      
      currentY += 8;
    });
    
    // BILL TO Section
    const billToY = 100;
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(20, billToY, 80, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 25, billToY + 7);
    
    // Customer details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(invoice.customerName || 'CV. Sukses Makmur', 22, billToY + 18);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('[Company Name]', 22, billToY + 26);
    doc.text('[Street Address]', 22, billToY + 32);
    doc.text('[City, ST ZIP]', 22, billToY + 38);
    doc.text('[Phone]', 22, billToY + 44);
    
    // Items Table
    const tableY = 160;
    const colWidths = [85, 25, 30];
    const headers = ['DESCRIPTION', 'TAXED', 'AMOUNT'];
    
    // Table Header
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    let currentX = 20;
    headers.forEach((header, index) => {
      doc.rect(currentX, tableY, colWidths[index], 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(header, currentX + 3, tableY + 7);
      currentX += colWidths[index];
    });
    
    // Table Rows
    const items = quotationData?.items || JSON.parse(invoice.items || '[]') || [
      { name: 'Professional Services', quantity: 1, price: 1000000, description: 'Consulting and development' },
      { name: 'Design Services', quantity: 1, price: 500000, description: 'UI/UX Design' },
      { name: 'Training Services', quantity: 1, price: 300000, description: 'Staff training' }
    ];
    
    currentY = tableY + 12;
    let subtotal = 0;
    
    // Draw empty rows first (for consistent table look)
    for (let i = 0; i < 8; i++) {
      currentX = 20;
      headers.forEach((header, index) => {
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.rect(currentX, currentY + (i * 8), colWidths[index], 8);
        currentX += colWidths[index];
      });
    }
    
    // Fill with actual data
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    currentY = tableY + 16;
    items.forEach((item, index) => {
      if (index < 8) { // Limit to 8 rows
        const amount = (item.quantity || 1) * (item.price || 0);
        subtotal += amount;
        
        // Description
        doc.text(item.name || 'Service', 23, currentY);
        
        // Taxed column (show if taxable)
        if (item.taxable !== false) {
          doc.text('', 110, currentY); // Empty for now
        }
        
        // Amount
        doc.text(formatRupiah(amount), 165, currentY, { align: 'right' });
        
        currentY += 8;
      }
    });
    
    // Totals Section
    const totalsY = tableY + 80;
    const totalsX = pageWidth - 70;
    
    // Calculate totals
    const taxRate = 6.25;
    const taxableAmount = subtotal;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    // Subtotal
    doc.text('Subtotal', totalsX - 40, totalsY);
    doc.text(formatRupiah(subtotal), totalsX, totalsY, { align: 'right' });
    
    // Taxable
    doc.text('Taxable', totalsX - 40, totalsY + 8);
    doc.text(formatRupiah(taxableAmount), totalsX, totalsY + 8, { align: 'right' });
    
    // Tax rate
    doc.text('Tax rate', totalsX - 40, totalsY + 16);
    doc.text(`${taxRate.toFixed(3)}%`, totalsX, totalsY + 16, { align: 'right' });
    
    // Tax due
    doc.text('Tax due', totalsX - 40, totalsY + 24);
    doc.text(formatRupiah(taxAmount), totalsX, totalsY + 24, { align: 'right' });
    
    // Other
    doc.text('Other', totalsX - 40, totalsY + 32);
    
    // Total
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(totalsX - 45, totalsY + 38, 50, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL', totalsX - 35, totalsY + 46);
    doc.text(formatRupiah(invoice.totalAmount || total), totalsX - 5, totalsY + 46, { align: 'right' });
    
    // OTHER COMMENTS Section
    const commentsY = totalsY + 60;
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(20, commentsY, 100, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('OTHER COMMENTS', 25, commentsY + 7);
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('1. Total payment due in 30 days', 22, commentsY + 18);
    doc.text('2. Please include the invoice number', 22, commentsY + 26);
    
    // Payment info (right side)
    doc.text('Make all checks payable to', totalsX - 40, commentsY + 18);
    doc.text(companyInfo?.name || 'PT. Quotation Apps Indonesia', totalsX - 40, commentsY + 26);
    
    // Footer
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFontSize(8);
    doc.text('If you have any questions about this invoice, please contact', 60, pageHeight - 30);
    doc.text('[Name, Phone #, E-mail]', 80, pageHeight - 25);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text('Thank You For Your Business!', 70, pageHeight - 15);
    
    // Save the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
    console.log('PDF generated successfully');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};
