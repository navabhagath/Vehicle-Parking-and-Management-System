import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../env/evironment';
import { Wallet } from '../../models/Wallet.model';
import { Transaction } from '../../models/transaction.model';
 
export type TransactionType = 'RECHARGE' | 'WITHDRAWAL';
 
@Injectable({
  providedIn: 'root',
})
export class WalletDao {
  private api = environment.apiUrl;
  private api2 = environment.apiUrl2;
 
  constructor(private http: HttpClient) {}
 
  /**
   * Updates wallet balance and creates a SUCCESS transaction record.
   * On wallet update failure, logs a FAILED transaction instead.
   */
  updateWalletWithTransaction(
    walletId: string,
    amount: number,
    newBalance: number,
    type: TransactionType = 'RECHARGE'
  ): Observable<Transaction> {
    const patchData: Partial<Wallet> = { balance: newBalance };
 
    return this.http.patch<Wallet>(`${this.api2}/customer/wallet/${walletId}`, patchData).pipe(
      switchMap(() => {
        return this.createTransaction(walletId, amount, 'SUCCESS', type);
      }),
      catchError((err) => {
        return this.createTransaction(walletId, amount, 'FAILED', type).pipe(
          switchMap(() => throwError(() => err))
        );
      })
    );
  }
 
  /**
   * Logs a failed transaction without touching the wallet balance.
   * Used when Razorpay payment itself fails (before we ever update the wallet).
   */
  logFailedTransaction(
    walletId: string,
    amount: number,
    type: TransactionType
  ): Observable<Transaction> {
    return this.createTransaction(walletId, amount, 'FAILED', type);
  }
 
  private createTransaction(
    walletId: string,
    amount: number,
    status: 'SUCCESS' | 'FAILED',
    type: TransactionType,
  ): Observable<Transaction> {
    const transactionData: Partial<Transaction> = {
      id: `txn_${Date.now()}`,
      walletId,
      bookingId: null,
      type,
      amount,
      status,
      timestamp: new Date().toISOString(),
    };
 
    return this.http.post<Transaction>(`${this.api2}/customer/transactions`, transactionData);
  }
 
  getWalletByUser(userId: string): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(`${this.api2}/customer/wallet?userId=${userId}`);
  }
}
 
 