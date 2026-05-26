// src/app/common/wallet/wallet.component.ts
 
import { Component, Input, inject, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WalletDao } from './wallet.dao';
import { CustomerDao } from '../customer.dao';
import {
  TransactionStatusOverlayComponent,
  TransactionStatus,
} from '../transaction-status/transaction-status.component';
import { User } from '../../models/User.model';
import { Wallet } from '../../models/Wallet.model';
import { environment } from '../../env/evironment';
 
declare var Razorpay: any;
 
export type WalletMode = 'add' | 'withdraw' | 'both';
 
@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionStatusOverlayComponent],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit, OnDestroy {
 
  /**
   * Controls which mode the wallet operates in:
   *  - true      → Add Money only
   *  - false     → Withdraw Money only
   *  - undefined → Both (toggle shown)
   *
   * Usage:
   *  <app-wallet />                → both modes with toggle
   *  <app-wallet [add]="true" />   → add money only
   *  <app-wallet [add]="false" />  → withdraw only
   */
  @Input() add?: boolean;
 
  // ─── Derived Mode ───
  walletMode: WalletMode = 'both';
  isAddMoneyMode = true;
 
  // ─── User & Wallet State ───
  user: User | null = null;
  walletBalance = 0.00;
  walletId = '';
 
  // ─── Amount Selection ───
  presetAmounts = [1000, 500, 250, 100];
  selectedAmount: number | null = null;
  customAmount: number | null = null;
 
  // ─── Withdrawal Validation ───
  withdrawalError: string | null = null;
 
  // ─── Transaction Overlay State ───
  txStatus: TransactionStatus = null;
  txAmount = 0;
  txNewBalance = 0;
  txErrorMessage = 'Something went wrong. Please try again.';
 
  // ─── Injected Services ───
  private walletDao = inject(WalletDao);
  private customerDao = inject(CustomerDao);
  private ngZone = inject(NgZone);
  private subscriptions = new Subscription();
 
  // ─── Config ───
  private readonly SUCCESS_DISPLAY_MS = 2000;
  private readonly RAZORPAY_KEY = environment.razorpayKeyId;
 
  // ────────────────────────────────────────────
  // Lifecycle
  // ────────────────────────────────────────────
 
  ngOnInit(): void {
    this.loadRazorpayScript();
 
    // Resolve wallet mode from @Input
    if (this.add === true) {
      this.walletMode = 'add';
      this.isAddMoneyMode = true;
    } else if (this.add === false) {
      this.walletMode = 'withdraw';
      this.isAddMoneyMode = false;
    } else {
      this.walletMode = 'both';
      this.isAddMoneyMode = true;
    }
 
    const userSub = this.customerDao.currentUser$.subscribe({
      next: (userData) => {
        this.user = userData;
        if (userData?.id) {
          this.customerDao.getWalletByUser(userData.id).subscribe();
          if(userData.role=="VENDOR"||userData.role=='SUPER_ADMIN'){
            this.walletMode = 'withdraw'
          }
        }
      },
      error: (err) => console.error('User subscription error:', err),
    });
 
    const walletSub = this.customerDao.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.walletBalance = wallet.balance;
        this.walletId = wallet.id;
      }
    });
 
    this.subscriptions.add(userSub);
    this.subscriptions.add(walletSub);
  }
 
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
 
  // ────────────────────────────────────────────
  // Razorpay Script Loader
  // ────────────────────────────────────────────
 
  private loadRazorpayScript(): void {
    if (document.getElementById('razorpay-script')) return;
 
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }
 
  // ────────────────────────────────────────────
  // Helpers — what to show
  // ────────────────────────────────────────────
 
  get showToggle(): boolean {
    return this.walletMode === 'both';
  }
 
  get showAddSection(): boolean {
    return this.walletMode === 'add' || (this.walletMode === 'both' && this.isAddMoneyMode);
  }
 
  get showWithdrawSection(): boolean {
    return this.walletMode === 'withdraw' || (this.walletMode === 'both' && !this.isAddMoneyMode);
  }
 
  // ────────────────────────────────────────────
  // Mode Toggle (only when walletMode === 'both')
  // ────────────────────────────────────────────
 
  setMode(isAdd: boolean): void {
    this.isAddMoneyMode = isAdd;
    this.resetSelection();
  }
 
  // ────────────────────────────────────────────
  // Amount Selection
  // ────────────────────────────────────────────
 
  selectAmount(amount: number): void {
    this.selectedAmount = this.selectedAmount === amount ? null : amount;
    this.customAmount = null;
    this.withdrawalError = null;
  }
 
  onCustomInput(): void {
    this.selectedAmount = null;
    this.withdrawalError = null;
  }
 
  private resetSelection(): void {
    this.selectedAmount = null;
    this.customAmount = null;
    this.withdrawalError = null;
  }
 
  get effectiveAmount(): number {
    return this.customAmount || this.selectedAmount || 0;
  }
 
  // ────────────────────────────────────────────
  // Add Money → Opens Razorpay Checkout
  // ────────────────────────────────────────────
 
  addMoney(): void {
    const amount = this.effectiveAmount;
    if (amount <= 0 || !this.walletId) return;
 
    this.openRazorpayCheckout(amount);
  }
 
  private openRazorpayCheckout(amount: number): void {
    const amountInPaise = amount * 100; // Razorpay expects paise
 
    const options = {
      key: this.RAZORPAY_KEY,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Wallet Recharge',
      description: `Add ₹${amount} to wallet`,
      prefill: {
        name: this.user?.name || '',
        email: this.user?.email || '',
        contact: this.user?.phone || '',
      },
      theme: {
        color: '#FFDF66',
      },
      handler: (response: any) => {
        // Razorpay runs outside Angular zone — bring it back in
        this.ngZone.run(() => {
          this.onPaymentSuccess(amount, response.razorpay_payment_id);
        });
      },
      modal: {
        ondismiss: () => {
          this.ngZone.run(() => {
            console.log('Payment cancelled by user');
          });
        },
      },
    };
 
    const rzp = new Razorpay(options);
 
    rzp.on('payment.failed', (response: any) => {
      this.ngZone.run(() => {
        this.onPaymentFailure(amount, response.error?.description || 'Payment failed');
      });
    });
 
    rzp.open();
  }
 
  private onPaymentSuccess(amount: number, paymentId: string): void {
    const newTotalBalance = amount + this.walletBalance;
 
    this.txAmount = amount;
    this.txNewBalance = newTotalBalance;
    this.txStatus = 'loading';
 
    this.walletDao
      .updateWalletWithTransaction(this.walletId, amount, newTotalBalance, 'RECHARGE')
      .subscribe({
        next: () => {
          // Re-fetch wallet from DB so wallet$ emits the real persisted balance
          this.customerDao.getWalletByUser(this.user!.id).subscribe();
 
          this.txStatus = 'success';
          this.resetSelection();
 
          setTimeout(() => {
            this.txStatus = null;
          }, this.SUCCESS_DISPLAY_MS);
        },
        error: (err) => {
          console.error('Wallet update after payment failed:', err);
          this.txErrorMessage =
            err?.error?.message ||
            'Payment was successful but wallet update failed. Please contact support.';
          this.txStatus = 'error';
        },
      });
  }
 
  private onPaymentFailure(amount: number, errorMsg: string): void {
    // Log the failed transaction but do NOT update wallet balance
    this.walletDao.logFailedTransaction(this.walletId, amount, 'RECHARGE').subscribe({
      error: (err) => console.error('Failed to log failed transaction:', err),
    });
 
    this.txAmount = amount;
    this.txErrorMessage = errorMsg;
    this.txStatus = 'error';
  }
 
  // ────────────────────────────────────────────
  // Withdraw Money
  // ────────────────────────────────────────────
 
  withdrawMoney(): void {
    const amount = this.effectiveAmount;
 
    if (!amount || amount <= 0) {
      this.withdrawalError = 'Please enter a valid amount.';
      return;
    }
 
    if (this.walletBalance <= 0) {
      this.withdrawalError = 'Your wallet balance is ₹0. Nothing to withdraw.';
      return;
    }
 
    if (amount > this.walletBalance) {
      this.withdrawalError = `Insufficient balance. You can withdraw up to ₹${this.walletBalance.toFixed(2)}.`;
      return;
    }
 
    if (!this.walletId) return;
 
    this.withdrawalError = null;
    const newBalance = this.walletBalance - amount;
 
    this.txAmount = amount;
    this.txNewBalance = newBalance;
    this.txStatus = 'loading';
 
    this.walletDao
      .updateWalletWithTransaction(this.walletId, amount, newBalance, 'WITHDRAWAL')
      .subscribe({
        next: () => {
          // Re-fetch wallet from DB so wallet$ emits the real persisted balance
          this.customerDao.getWalletByUser(this.user!.id).subscribe();
 
          this.txStatus = 'success';
          this.resetSelection();
 
          setTimeout(() => {
            this.txStatus = null;
          }, this.SUCCESS_DISPLAY_MS);
        },
        error: (err) => {
          console.error('Withdrawal failed:', err);
          this.txErrorMessage =
            err?.error?.message || 'Withdrawal failed. Please try again.';
          this.txStatus = 'error';
        },
      });
  }
 
  // ────────────────────────────────────────────
  // Retry (triggered from overlay "Try Again")
  // ────────────────────────────────────────────
 
  retryTransaction(): void {
    this.txStatus = null;
 
    setTimeout(() => {
      this.selectedAmount = this.txAmount;
      this.customAmount = null;
 
      if (this.showAddSection) {
        this.addMoney();
      } else {
        this.withdrawMoney();
      }
    }, 300);
  }
}
 
 