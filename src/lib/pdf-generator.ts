import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface InvoiceData {
    invoiceNumber: string;
    clientName: string;
    companyName: string;
    service: string;
    amount: number;
    dueDate: string;
    isAdvance: boolean;
}

export function generateInvoicePDF(data: InvoiceData) {
    const doc = new jsPDF() as any;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text("Creo AI Studio", 20, 30);
    doc.text("Internal Operations", 20, 35);
    doc.text("finance@creoai.studio", 20, 40);

    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${data.invoiceNumber}`, 140, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 35);
    doc.text(`Due Date: ${data.dueDate}`, 140, 40);

    // Bill To
    doc.setFontSize(12);
    doc.text("BILL TO:", 20, 60);
    doc.setFontSize(10);
    doc.text(data.clientName, 20, 65);
    doc.text(data.companyName, 20, 70);

    // Table
    const tableData = [
        [
            data.isAdvance ? "Advance Payment (40%)" : "Final Payment (60%)",
            data.service,
            `$${data.amount.toLocaleString()}`
        ]
    ];

    doc.autoTable({
        startY: 85,
        head: [['Description', 'Service Category', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Total
    doc.setFontSize(12);
    doc.text(`Total Amount: $${data.amount.toLocaleString()}`, 140, finalY);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Thank you for your business!", 105, 280, { align: "center" });

    doc.save(`Invoice_${data.invoiceNumber}.pdf`);
}
