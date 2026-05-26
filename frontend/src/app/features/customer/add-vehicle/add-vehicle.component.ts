import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomerDao } from '../../../shared/customer.dao'; 
import { User } from '../../../models/User.model';
import { Vehicle } from '../../../models/vehicle.model';
 
@Component({
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-vehicle.component.html',
  styleUrls: ['./add-vehicle.component.scss'],
})
export class AddVehicleComponent implements OnInit, OnDestroy {
  @Output() vehicleAdded = new EventEmitter<Vehicle>();
  @Output() closed = new EventEmitter<void>();
 
  user: User | null = null;
  private sub = new Subscription();
 
 
  plateNumber = '';
  name = '';
  model = '';
  vehicleType: '2-WHEELER' | '4-WHEELER' = '2-WHEELER';
  selectedFile: File | null = null;
  isSubmitting = false;
 
  constructor(private dao: CustomerDao) {}
 
  ngOnInit(): void {
    const userSub = this.dao.currentUser$.subscribe({
      next: (userData) => {
        this.user = userData;
      },
    });
    this.sub.add(userSub);
  }
 
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
 
  // onFileSelect(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.selectedFile = input.files[0];
  //   }
  // }
 
  onSubmit(): void {
    if (!this.user || !this.plateNumber.trim() || !this.model.trim() || !this.name) return;
 
    this.isSubmitting = true;
 
    const newVehicle: Partial<Vehicle> = {
      userId: this.user.id,
      name: this.name,
      plateNumber: this.plateNumber.trim().toUpperCase(),
      model: this.model.trim(),
      type: this.vehicleType,
      isPrimary: false,
    };
 
    this.dao.addVehicle(newVehicle).subscribe({
      next: (vehicle: Vehicle) => {
        this.isSubmitting = false;
        this.vehicleAdded.emit(vehicle);
        this.closeSheet();
      },
      error: (err) => {
        console.error('Add vehicle failed', err);
        this.isSubmitting = false;
      },
    });
  }
 
  closeSheet(): void {
    this.resetForm();
    this.closed.emit();
  }
 
validateInput(event: any) {
  const input = event.target as HTMLInputElement;
  // 1. Remove special characters immediately
  const filteredValue = input.value.replace(/[^a-zA-Z0-9 ]/g, '');
 
  // 2. Update the input value in case the user pasted something invalid
  input.value = filteredValue;
  return filteredValue;
}
 
  private resetForm(): void {
    this.plateNumber = '';
    this.name = '';
    this.model = '';
    this.vehicleType = '2-WHEELER';
    this.selectedFile = null;
    this.isSubmitting = false;
  }
}
 
 