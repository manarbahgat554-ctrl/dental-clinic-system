import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, Patient } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';

export function generateInvoicePDF(invoice: Invoice, patient?: Patient) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DentaSuite', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dental Clinic Invoice', pageWidth - 14, 18, { align: 'right' });

  // Invoice info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 14, 45);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 53);
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, 14, 59);
  if (invoice.dueDate) doc.text(`Due: ${formatDate(invoice.dueDate)}`, 14, 65);

  // Patient info
  if (patient) {
    doc.text('Bill To:', pageWidth - 14, 45, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${patient.firstName} ${patient.lastName}`, pageWidth - 14, 51, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    if (patient.phone) doc.text(patient.phone, pageWidth - 14, 57, { align: 'right' });
    if (patient.email) doc.text(patient.email, pageWidth - 14, 63, { align: 'right' });
  }

  // Items table
  autoTable(doc, {
    startY: 80,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: invoice.items.map((item) => [
      item.description,
      String(item.quantity),
      formatCurrency(item.unitPrice),
      formatCurrency(item.total),
    ]),
    theme: 'striped',
    headStyles: { fillColor: [20, 184, 166] },
  });

  // Totals
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, pageWidth - 14, finalY, { align: 'right' });
  doc.text(`Tax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount)}`, pageWidth - 14, finalY + 6, { align: 'right' });
  if (invoice.discount > 0) {
    doc.text(`Discount: -${formatCurrency(invoice.discount)}`, pageWidth - 14, finalY + 12, { align: 'right' });
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total: ${formatCurrency(invoice.total)}`, pageWidth - 14, finalY + 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Paid: ${formatCurrency(invoice.paidAmount)}`, pageWidth - 14, finalY + 26, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text(`Balance: ${formatCurrency(invoice.total - invoice.paidAmount)}`, pageWidth - 14, finalY + 32, { align: 'right' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Thank you for choosing DentaSuite. Payment is due within 30 days.', pageWidth / 2, finalY + 48, { align: 'center' });

  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}
