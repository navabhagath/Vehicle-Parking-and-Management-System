// src/app/customer/customer.routes.ts

import { Routes } from '@angular/router';
import { CustomerLayoutComponent } from './customer-layout/customer-layout.component';
import { WalletComponent } from '../../shared/wallet/wallet.component';
import { RecentTransactionsComponent } from '../../shared/recent-transaction/recent-transaction.component';
import { RaiseTicketComponent } from '../../shared/customer-support/customer-support.component';
import { HelpcenterComponent } from '../../shared/helpcenter/helpcenter.component';
import { CustomerLoginComponent } from './customer-login/customer-login.component';
import { guestGuard } from '../../core/guards/guest.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { ChooseVehicleComponent } from '../booking/choose-vehicle/choose-vehicle';
import { ChooseLocationComponent } from '../booking/choose-location/choose-location';
import { ChooseTimeslotComponent } from '../booking/choose-timeslot/choose-timeslot';
import { CustomerRenameComponent } from './customer-rename/customer-rename.component';
import { MyTicketsComponent } from '../../shared/my-tickets/mytickets.component';

export const customerRoutes: Routes = [
  {
    path: 'login',
    component: CustomerLoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'welcome',
    component: CustomerRenameComponent,
    
  },
  {
    path: '',
    canActivate: [roleGuard(['CUSTOMER'])],
    component: CustomerLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      { path: 'wallet', component: WalletComponent },
      { path: 'recentTransactions', component: RecentTransactionsComponent },
      { path: 'support', component: RaiseTicketComponent },
      { path: 'helpcenter', component: MyTicketsComponent },
      { path: 'choose-vehicle', component: ChooseVehicleComponent },
      { path: 'choose-location', component: ChooseLocationComponent },
      { path: 'choose-timeslot', component: ChooseTimeslotComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
