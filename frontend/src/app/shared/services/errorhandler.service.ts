import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
 
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
 
  handleError(error: any, context?: string): void {
    let message = 'Something went wrong. Please try again.';
 
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          message = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          message = error.error?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          message = 'Session expired. Please log in again.';
          // optionally redirect to login
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = error.error?.message || 'The requested resource was not found.';
          break;
        case 409:
          message = error.error?.message || 'A conflict occurred. Please try again.';
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          break;
        default:
          message = error.error?.message || `Error ${error.status}: Something went wrong.`;
      }
    } else if (error?.message) {
      message = error.message;
    }
 
    if (context) {
      console.error(`[${context}]`, error);
    } else {
      console.error(error);
    }
 
    this.showToast(message);
  }
 
  private showToast(message: string): void {
    // Replace this with your actual toast/notification service
    // e.g., this.toastr.error(message);
    alert(message);
  }
}
 