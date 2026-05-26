// src/app/customer/recent-transactions/recent-transaction.dao.ts
 
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../env/evironment';
 
import { UserObjectService } from '../services/user-object.service';
import { User } from '../../models/User.model';
import { Wallet } from '../../models/Wallet.model';
import { Transaction } from '../../models/transaction.model';
import { AuthService } from '../../core/services/auth.service';
 
@Injectable({ providedIn: 'root' })
export class TransactionDao {
  private api = environment.apiUrl;
  private api2 = environment.apiUrl2;
private auth  = inject(AuthService)
 
  constructor(private http: HttpClient) {}
 
  get currentUser$(): Observable<User | null> {
    return this.auth.currentUser$;
  }
 
 
  getWalletByUser(userId: string): Observable<Wallet[]> {
    return this.http.get<Wallet[]>(`${this.api2}/customer/wallet?userId=${userId}`);
  }
 
 
  getTransactionsByUser(userId: string, page: number, limit: number): Observable<Transaction[]> {
    console.log('Fetching transactions for user ID:', userId);
    return this.getWalletByUser(userId).pipe(
      switchMap((wallets) => {
        const walletId = wallets[0]?.id;
        console.log('Using wallet ID:', wallets);
        return this.http.get<Transaction[]>(
          `${this.api2}/customer/transactions?walletId=${walletId}&_page=${page}&_limit=${limit}`
        );
      })
    );
  }
}
 