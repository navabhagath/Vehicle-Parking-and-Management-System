import { Component, inject, Input, OnInit } from '@angular/core';
import { User } from '../../../models/User.model';
import { CustomerDao } from '../../../shared/customer.dao';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TransactionDao } from '../../../shared/recent-transaction/recent-transaction.dao';
 
@Component({
  selector: 'app-dashboard-wallet',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgClass],
  templateUrl: './dashboard-wallet.component.html',
  styleUrl: './dashboard-wallet.component.scss',
})
export class DashboardWalletComponent implements OnInit {
  @Input({ required: true }) user!: User;
  walletValue = 0;
  isDownloading = false;
  private dao = inject(CustomerDao);
  private transactionDao = inject(TransactionDao);
  private datePipe = new DatePipe('en-IN');
 
  ngOnInit(): void {
    this.dao.wallet$.subscribe((wallet) => {
      if (wallet) this.walletValue = wallet.balance;
    });
    this.dao.getWalletByUser(this.user.id).subscribe();
  }
 
  downloadTransactionsPdf(): void {
    this.isDownloading = true;
    this.transactionDao.getTransactionsByUser(this.user.id, 1, 20).subscribe({
      next: (transactions) => {
        this.generatePdf(transactions);
        this.isDownloading = false;
      },
      error: () => (this.isDownloading = false),
    });
  }
 
  private generatePdf(transactions: any[]): void {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
 
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Statement', pw / 2, 20, { align: 'center' });
 
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Account: ${this.user.name || this.user.id}`, 14, 32);
    doc.text(`Date: ${this.datePipe.transform(new Date(), 'dd MMM yyyy, hh:mm a')}`, 14, 38);
    doc.text(`Wallet Balance: Rs. ${this.walletValue.toFixed(2)}`, 14, 44);
 
    // Divider line
    doc.setDrawColor(200);
    doc.line(14, 48, pw - 14, 48);
 
    // Table
    const rows = transactions.map((t, i) => [
      i + 1,
      this.getTypeLabel(t.type),
      `Rs. ${t.amount.toFixed(2)}`,
      t.status,
      t.bookingId || '—',
      this.datePipe.transform(t.timestamp, 'dd MMM yy, hh:mm a') || t.timestamp,
    ]);
 
    autoTable(doc, {
      startY: 52,
      head: [['#', 'Type', 'Amount', 'Status', 'Booking ID', 'Date']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], halign: 'center', fontSize: 9 },
      bodyStyles: { fontSize: 8.5, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 13},
        2: { halign: 'left' },
      },
      margin: { left: 14, right: 14 },
    });
 
    // Footer
    const ph = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('System-generated statement', pw / 2, ph - 10, { align: 'center' });
 
    doc.save(`Transactions_${this.datePipe.transform(new Date(), 'ddMMyyyy_HHmm')}.pdf`);
  }
 
  private getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      RECHARGE: 'Recharge',
      SENT: 'Sent',
      RECIEVED: 'Received',
      DEDUCT: 'Deducted',
    };
    return map[type] || type;
  }
}
 