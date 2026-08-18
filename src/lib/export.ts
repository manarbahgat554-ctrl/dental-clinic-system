import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '@/lib/format';

export type ExportFormat = 'pdf' | 'csv' | 'excel';

export function exportReport(
  format: ExportFormat,
  reportType: string,
  headers: string[],
  rows: (string | number)[][],
  summary?: { label: string; value: string | number }[],
) {
  if (format === 'pdf') {
    exportPDF(reportType, headers, rows, summary);
  } else if (format === 'csv') {
    exportCSV(reportType, headers, rows);
  } else {
    exportExcel(reportType, headers, rows);
  }
}

function exportPDF(
  reportType: string,
  headers: string[],
  rows: (string | number)[][],
  summary?: { label: string; value: string | number }[],
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(reportType, 14, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(new Date().toISOString(), 'MMM d, yyyy h:mm a'), pageWidth - 14, 18, { align: 'right' });

  // Summary
  if (summary && summary.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let y = 42;
    summary.forEach((s) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${s.label}: `, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(s.value), 14 + doc.getTextWidth(`${s.label}: `), y);
      y += 6;
    });
  }

  // Table
  autoTable(doc, {
    startY: summary ? 42 + summary.length * 6 + 4 : 42,
    head: [headers],
    body: rows.map((r) => r.map((c) => String(c))),
    theme: 'striped',
    headStyles: { fillColor: [20, 184, 166] },
  });

  doc.save(`${reportType.replace(/\s/g, '-').toLowerCase()}.pdf`);
}

function exportCSV(reportType: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  downloadBlob(csv, `${reportType.replace(/\s/g, '-').toLowerCase()}.csv`, 'text/csv');
}

function exportExcel(reportType: string, headers: string[], rows: (string | number)[][]) {
  // Excel-compatible HTML table
  const html = `<table><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
  downloadBlob(html, `${reportType.replace(/\s/g, '-').toLowerCase()}.xls`, 'application/vnd.ms-excel');
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
