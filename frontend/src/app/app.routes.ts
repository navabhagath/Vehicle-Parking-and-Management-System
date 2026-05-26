import { Routes } from '@angular/router';
import { VendorLoginComponent } from './features/vendor/vendor-login/vendor-login.component';
import { VendorRegistrationComponent } from './features/vendor/vendor-registration/vendor-registration.component';
import { SuperAdminRbacPanelComponent } from './features/super-admin/super-admin-rbac-panel/super-admin-rbac-panel.component';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SuperAdminManagePermissions } from './features/super-admin/super-admin-manage-permissions/super-admin-manage-permissions.component';
import { customerRoutes } from './features/customer/customer.routes';
import { ChooseRoleComponent } from './features/choose-role/choose-role.component';
import { AdminLoginComponent } from './features/super-admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './features/super-admin/admin-dashboard/admin-dashboard.component';
import { AdminVendorComponent } from './features/super-admin/admin-vendor/admin-vendor.component';
import { AdminRevenueComponent } from './features/super-admin/admin-revenue/admin-revenue.component';
import { HelpcenterComponent } from './shared/helpcenter/helpcenter.component';
import { AdminAccessControlComponent } from './features/super-admin/admin-access-control/admin-access-control.component';
import { AdminVendorDetailsComponent } from './features/super-admin/admin-vendor-details/admin-vendor-details.component';
import { locationOwnerGuard } from './core/guards/location-owner.guard';
import { AdminTicketsComponent } from './features/super-admin/admin-tickets/admin-tickets.component';
import { redirectGuard } from './core/guards/redirect.guard';
export const routes: Routes = [
  // Public
  { path: '', component: ChooseRoleComponent, pathMatch: 'full' },
  // { path: 'reset-password', component: ResetPasswordComponent },

  // Customer
  { path: 'customer', children: customerRoutes },

  // Vendor
  {
    path: 'vendor',
    children: [
      {
        path: 'login',
        canActivate:[guestGuard],
        loadComponent: () =>
          import('../app/features/vendor/vendor-login/vendor-login.component').then(
            (m) => m.VendorLoginComponent,
          ),
      },
      {
        path: 'registration',
        canActivate:[guestGuard],
        loadComponent: () =>
          import('../app/features/vendor/vendor-registration/vendor-registration.component').then(
            (m) => m.VendorRegistrationComponent,
          ),
      },
      {
        path: 'reset-password',
        canActivate:[guestGuard],
        loadComponent: () =>
          import('../app/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
      {
        path: 'dashboard',
        canActivate:[roleGuard(['VENDOR'])],
        loadComponent: () =>
          import('./features/vendor/landing-page/landing-page.component').then(
            (m) => m.LandingPageComponent,
          ),
      },
      {
        path: 'location/new',
        canActivate:[roleGuard(['VENDOR']),permissionGuard('create_location')],
        loadComponent: () =>
          import('../app/features/vendor/add-new-location/add-new-location.component').then(
            (m) => m.AddNewLocationComponent,
          ),
      },
      {
        path: 'location/:id',
        canActivate: [roleGuard(['VENDOR']), locationOwnerGuard],
        loadComponent: () =>
          import('../app/features/vendor/vendor-layout/vendor-layout.component').then(
            (m) => m.VendorLayoutComponent,
          ),
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          {
            path: 'overview',
            loadComponent: () =>
              import('../app/features/vendor/overview/overview.component').then(
                (m) => m.OverviewComponent,
              ),
          },
          {
            path: 'bookings',
            canActivate: [permissionGuard('manage_bookings')],
            loadComponent: () =>
              import('../app/features/vendor/bookings/bookings.component').then(
                (m) => m.BookingsComponent,
              ),
          },
          {
            path: 'help',
            loadComponent: () =>
              import('./shared/vendor-support/vendor-support.component').then(
                (m) => m.RaiseTicketComponent,
              ),
          },
          {
            path: 'analytics',
            canActivate: [permissionGuard('view_analytics')],
            loadComponent: () =>
              import('../app/features/vendor/vendor-analytics/vendor-analytics.component').then(
                (m) => m.VendorAnalyticsComponent,
              ),
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('../app/features/vendor/vendor-profile/vendor-profile.component').then(
                (m) => m.VendorProfileComponent,
              ),
          },
          {
            path: 'wallet',
            canActivate: [permissionGuard('withdraw_wallet')],
            loadComponent: () =>
              import('./shared/wallet/wallet.component').then(
                (m) => m.WalletComponent,
              ),
          },
          {
            path: 'tickets',
            canActivate: [permissionGuard('manage_tickets')],
            loadComponent: () =>
              import('./shared/helpcenter/helpcenter.component').then(
                (m) => m.HelpcenterComponent,
              ),
          },
          {
            path: 'mytickets',
            loadComponent: () =>
              import('./shared/my-tickets/mytickets.component').then(
                (m) => m.MyTicketsComponent,
              ),
          },
          {
            path: 'gatepass',
            loadComponent: () =>
              import('../app/features/vendor/gatepass/gatepass').then(
                (m) => m.GateComponent,
              ),
          },
          {
            path: 'recentTransaction',
            loadComponent: () =>
              import('../app/shared/recent-transaction/recent-transaction.component').then(
                (m) => m.RecentTransactionsComponent,
              ),
          },
        ],
      },
      { path: '', redirectTo: '', pathMatch: 'full' },
    ],
  },

  // Admin
  {
    path: 'super_admin',
    // canActivate:[roleGuard(['SUPER_ADMIN'])],
    children: [
      {
        path: 'rbac-panel',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        component: SuperAdminRbacPanelComponent,
      },
      {
        path: 'user-details/:id',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        component: SuperAdminManagePermissions,
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        component: AdminLoginComponent,
      },
      { path: 'reset-password', component: ResetPasswordComponent },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        component: AdminDashboardComponent,
      },
      {
        path: 'vendor',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        component: AdminVendorComponent,
      },
      {
        path: 'revenue',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        component: AdminRevenueComponent,
      },
      {
        path: 'tickets',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        component: AdminTicketsComponent,
      },
      { path: 'access-control', component: AdminAccessControlComponent },
    ],
  },
  {
    path: 'admin-vendor-details/:id',
    canActivate: [roleGuard(['SUPER_ADMIN'])],
    component: AdminVendorDetailsComponent,
  },

  // Fallback
  { path: '**', canActivate : [redirectGuard], component : ChooseRoleComponent },
];
