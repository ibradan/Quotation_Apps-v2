import React, { useState } from 'react';
import QuotationPDFExporter from './QuotationPDFExporter';
import { useSettings } from '../hooks/useSettings';
import './ExportPDFMenu.css';

const ExportPDFMenu = ({ quotation, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { settings } = useSettings();
  const { generateQuotationPDF } = QuotationPDFExporter();

  const handleExportPDF = async () => {
    if (!quotation) return;
    
    setIsExporting(true);
    try {
      const pdf = await generateQuotationPDF(quotation, settings);
      pdf.save(`quotation_${quotation.quotation_number || quotation.id}.pdf`);
      onClose?.();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Gagal export PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (!quotation) return;
    
    setIsExporting(true);
    try {
      const pdf = await generateQuotationPDF(quotation, settings);
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      onClose?.();
    } catch (error) {
      console.error('Error previewing PDF:', error);
      alert('Gagal preview PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-pdf-menu">
      <div className="export-pdf-overlay" onClick={onClose}></div>
      <div className="export-pdf-content">
        <div className="export-pdf-header">
          <h3>Export PDF Quotation</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="export-pdf-body">
          <div className="quotation-info">
            <div className="info-item">
              <span className="label">No. Quotation:</span>
              <span className="value">{quotation?.quotation_number || quotation?.id}</span>
            </div>
            <div className="info-item">
              <span className="label">Customer:</span>
              <span className="value">{quotation?.customer}</span>
            </div>
            <div className="info-item">
              <span className="label">Total:</span>
              <span className="value">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(quotation?.total || 0)}
              </span>
            </div>
          </div>
          
          <div className="export-actions">
            <button 
              className="btn-preview"
              onClick={handlePreviewPDF}
              disabled={isExporting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {isExporting ? 'Loading...' : 'Preview PDF'}
            </button>
            
            <button 
              className="btn-download"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {isExporting ? 'Exporting...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPDFMenu;