import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface FinalInvoiceData {
    invoiceNumber: string;
    clientName: string;
    companyName: string;
    projectTitle: string;
    quotedPrice: number;
    advancePaid: number;
    balanceDue: number;
    issuedDate: string;
}

export function generateInvoicePDF(data: FinalInvoiceData) {
    const doc = new jsPDF() as any;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("FINAL INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text("Creo AI Studio", 20, 30);
    doc.text("Internal Operations", 20, 35);
    doc.text("finance@creoai.studio", 20, 40);

    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${data.invoiceNumber}`, 140, 30);
    doc.text(`Date: ${data.issuedDate}`, 140, 35);
    doc.text(`Project: ${data.projectTitle}`, 140, 40);

    // Bill To
    doc.setFontSize(12);
    doc.text("BILL TO:", 20, 60);
    doc.setFontSize(10);
    doc.text(data.clientName, 20, 65);
    doc.text(data.companyName, 20, 70);

    // Table with invoice details
    const tableData = [
        ['Quoted Price', '$' + data.quotedPrice.toLocaleString()],
        ['Advance Paid (received)', '-$' + data.advancePaid.toLocaleString()],
        ['Balance Due', '$' + data.balanceDue.toLocaleString()],
    ];

    doc.autoTable({
        startY: 85,
        head: [['Description', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 50 } },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Total Due
    doc.setFontSize(12);
    doc.setTextColor(200, 0, 0);
    doc.text(`Total Due: $${data.balanceDue.toLocaleString()}`, 140, finalY);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });

    doc.save(`FinalInvoice_${data.invoiceNumber}.pdf`);
}
