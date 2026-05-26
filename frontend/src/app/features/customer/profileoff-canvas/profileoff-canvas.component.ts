// src/app/customer/profileoff-canvas/profileoff-canvas.component.ts
import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { CustomerDao } from '../../../shared/customer.dao'; // Import Dao instead of CURRENT_USER

import { User } from '../../../models/User.model';
import { WalletComponent } from '../../../shared/wallet/wallet.component';
import { AuthService } from '../../../core/services/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';

declare var bootstrap: any;

@Component({
  selector: 'app-profile-offcanvas',
  standalone: true,
  imports: [CommonModule, RouterLink, WalletComponent],
  templateUrl: './profileoff-canvas.component.html',
  styleUrls: ['./profileoff-canvas.component.scss'],
})
export class ProfileOffcanvasComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private authService = inject(AuthService);
  private dao = inject(CustomerDao);
  private modalService = inject(ModalService);
  private sub = new Subscription();
 
  user: User | null = null;
  profileImg = '';

  @ViewChild('offcanvasEl', { static: true }) offcanvasEl!: ElementRef;
  private bsOffcanvas: any;

  ngOnInit(): void {
    // Subscribe to get user data reactively
    this.sub.add(
      this.dao.currentUser$.subscribe((userData) => {
        this.user = userData;
        if (userData) {
          this.profileImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4BD2F8&color=fff&rounded=true&size=48`;
        }
      }),
    );
  }

  ngAfterViewInit(): void {
    this.bsOffcanvas = new bootstrap.Offcanvas(this.offcanvasEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  open(): void {
    this.bsOffcanvas?.show();
  }
  close(): void {
    this.bsOffcanvas?.hide();
  }

  async signOut() {
    this.close();
    const confirmed = await this.modalService.confirm({
      title: 'Logout',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      type: 'danger',
    });
    if (confirmed) {
      this.authService.logout();
      // this.close(); // Close offcanvas on logout
    }
  }
}
