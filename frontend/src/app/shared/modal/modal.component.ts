import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmDialogData, CONFIRM_DEFAULTS } from './modal.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  private dialogRef = inject(MatDialogRef<ModalComponent>);
  data: ConfirmDialogData = {
    ...CONFIRM_DEFAULTS,
    ...inject(MAT_DIALOG_DATA),
  };

  get buttonClass(): string {
    switch (this.data.type) {
      case 'danger':
        return 'btn-red';
      case 'warn':
        return 'btn-yellow';
      default:
        return 'btn-default';
    }
  }

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
