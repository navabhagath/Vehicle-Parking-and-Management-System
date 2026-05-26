import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ModalComponent } from './modal.component';
import { ConfirmDialogData } from './modal.model';
@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor() { }

  private dialog = inject(MatDialog);

  async confirm(data: ConfirmDialogData = {}): Promise<boolean> {
    const dialogRef = this.dialog.open(ModalComponent, {
      data,
      width: '400px',
      disableClose: false,
      autoFocus: 'first-tabbable',
      backdropClass: 'custom-backdrop',
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    return result === true;
}
}
