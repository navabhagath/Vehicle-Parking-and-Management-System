import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
 
import { CustomerDao } from '../../../shared/customer.dao';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/User.model';
import { Vehicle } from '../../../models/vehicle.model';
 
@Component({
  selector: 'app-my-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-vehicles.component.html',
  styleUrl: './my-vehicles.component.scss',
})
export class MyVehiclesComponent {
  @Input({ required: true }) user!: User;
  @Input({ required: true }) vehicles: Vehicle[] = [];
  @Output() addVehicleRequest = new EventEmitter<void>();
 
  private dao = inject(CustomerDao);  
 
  addVehicle(): void {
    this.addVehicleRequest.emit();
  }
 
updatePrimary(v: Vehicle): void {
  const newStatus = !v.isPrimary;
  const oldPrimary = this.vehicles.find(item => item.isPrimary && item.id !== v.id);
  this.dao.updateVehicle(v.id, { isPrimary: newStatus }).subscribe({
    next: () => {
      v.isPrimary = newStatus;
      if (newStatus === true && oldPrimary) {
        this.dao.updateVehicle(oldPrimary.id, { isPrimary: false }).subscribe({
          next: () => { oldPrimary.isPrimary = false; }
        });
      }
    }
  });
}
}
 
 