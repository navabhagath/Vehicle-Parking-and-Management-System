// src/app/customer/recent-transactions/recent-transactions.component.ts
 
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
 
import { TransactionDao } from './recent-transaction.dao';
import { Transaction } from '../../models/transaction.model';
import { User } from '../../models/User.model';
 
@Component({
  selector: 'app-recent-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-transaction.component.html',
  styleUrls: ['./recent-transaction.component.scss'],
})
export class RecentTransactionsComponent implements OnInit, OnDestroy {
  private dao = inject(TransactionDao);
  private user: User | null = null;
  private sub = new Subscription();
 
  transactions: Transaction[] = [];
  loading = false;
  hasNext = false;
  hasPrev = false;
 
  currentPage = 1;
  limit = 5;
 
  ngOnInit(): void {
    this.sub.add(
      this.dao.currentUser$.subscribe((userData) => {
        this.user = userData;
        if (userData) {
          this.currentPage = 1;
          this.loadPage();
        }
      }),
    );
  }
 
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
 
  loadPage(): void {
    if (this.loading || !this.user) return;
 
    this.loading = true;
 
    this.dao
      .getTransactionsByUser(this.user.id, this.currentPage, this.limit)
      .subscribe({
        next: (res) => {
          this.transactions = res;
          this.hasNext = res.length === this.limit;
          this.hasPrev = this.currentPage > 1;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
  }
 
  nextPage(): void {
    if (this.hasNext) {
      this.currentPage++;
      this.loadPage();
    }
  }
 
  prevPage(): void {
    if (this.hasPrev) {
      this.currentPage--;
      this.loadPage();
    }
  }
}
 
 