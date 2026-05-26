export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'warn' | 'danger';
  showCancel?:boolean
}

export const CONFIRM_DEFAULTS: ConfirmDialogData = {
  title: 'Are you sure?',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'default',
  showCancel: true
};