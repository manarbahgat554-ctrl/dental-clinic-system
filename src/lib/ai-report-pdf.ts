import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AIReport } from '@/types/ai';
import { RISK_COLORS, URGENCY_COLORS } from '@/types/ai';
import { formatDate } from '@/lib/format';

export function generateAIReportPDF(report: AIReport, patientName: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(20, 184, 166);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Radiology Analysis Report', 14, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatDate(report.createdAt, 'MMM d, yyyy h:mm a')}`, pageWidth - 14, 18, { align: 'right' });

  // Patient info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Patient: ${patientName}`, 14, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Image Type: ${report.imageType}`, 14, 49);
  doc.text(`Report ID: ${report.id}`, 14, 55);

  // Scores
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(14, 62, pageWidth - 28, 22, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Analysis Scores', 18, 70);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Image Quality: ${report.imageQualityScore}%`, 18, 77);
  doc.text(`Confidence: ${report.confidenceScore}%`, 18, 81);
  const riskColor = RISK_COLORS[report.riskLevel];
  doc.setTextColor(riskColor === '#22c55e' ? 34 : riskColor === '#f59e0b' ? 245 : riskColor === '#f97316' ? 249 : 239, riskColor === '#22c55e' ? 197 : 158, riskColor === '#22c55e' ? 94 : 11);
  doc.text(`Risk Level: ${report.riskLevel.toUpperCase()}`, pageWidth / 2, 77);
  doc.setTextColor(0, 0, 0);
  const urgColor = URGENCY_COLORS[report.urgencyLevel];
  doc.text(`Urgency: ${report.urgencyLevel.toUpperCase()}`, pageWidth / 2, 81);

  // Findings table
  autoTable(doc, {
    startY: 90,
    head: [['#', 'Finding', 'Tooth', 'Severity', 'Confidence']],
    body: report.findings.map((f, i) => [
      String(i + 1),
      f.label,
      f.toothNumber ? String(f.toothNumber) : '—',
      f.severity,
      `${f.confidence}%`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [20, 184, 166] },
  });

  // Recommendations
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendations', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  report.recommendations.forEach((rec, i) => {
    doc.text(`${i + 1}. ${rec}`, 16, finalY + 6 + i * 6);
  });

  // Treatment plan
  const planY = finalY + 6 + report.recommendations.length * 6 + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Suggested Treatment Plan', 14, planY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const planLines = doc.splitTextToSize(report.suggestedTreatmentPlan, pageWidth - 28);
  doc.text(planLines, 14, planY + 6);

  // Summary
  const summaryY = planY + 6 + planLines.length * 5 + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Summary', 14, summaryY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summaryLines = doc.splitTextToSize(report.reportSummary, pageWidth - 28);
  doc.text(summaryLines, 14, summaryY + 6);

  // Next appointment
  if (report.suggestedNextAppointment) {
    const apptY = summaryY + 6 + summaryLines.length * 5 + 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Suggested Next Appointment: ${formatDate(report.suggestedNextAppointment)}`, 14, apptY);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('This AI-generated report is for assistance only and does not replace professional clinical diagnosis.', pageWidth / 2, 285, { align: 'center' });

  doc.save(`ai-report-${patientName.replace(/\s/g, '-')}.pdf`);
}
