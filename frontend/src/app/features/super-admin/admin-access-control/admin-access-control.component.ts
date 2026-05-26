import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
@Component({
  selector: 'app-admin-access-control',
  standalone: true,
  imports: [AdminSidebarComponent],
  templateUrl: './admin-access-control.component.html',
  styleUrl: './admin-access-control.component.scss'
})
export class AdminAccessControlComponent {
    
}
