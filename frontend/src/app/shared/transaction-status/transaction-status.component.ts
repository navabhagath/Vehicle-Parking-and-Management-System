// src/app/common/transaction-status-overlay/transaction-status-overlay.component.ts
 
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
 
export type TransactionStatus = 'loading' | 'success' | 'error' | null;
 
@Component({
  selector: 'app-transaction-status-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-status.component.html',
  styleUrls: ['./transaction-status.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('zoomIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.6)' }),
        animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
    ]),
  ],
})
export class TransactionStatusOverlayComponent {
  @Input() status: TransactionStatus = null;
  @Input() amount: number = 0;
  @Input() newBalance: number = 0;
  @Input() errorMessage: string = 'Something went wrong. Please try again.';
 
  @Output() retry = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();
 
  get visible(): boolean {
    return this.status !== null;
  }
 
  onRetry(): void {
    this.retry.emit();
  }
 
  onDismiss(): void {
  this.dismissed.emit();
}
}
 