import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../models/User.model';
import { AdminDao } from '../super-admin-rbac-panel/admin.dao';
import { ModalService } from '../../../shared/modal/modal.service';

/**
 * Catalog of vendor permissions shown in the UI. The `key` MUST match a
 * string in VALID_PERMISSIONS on the backend (adminUserController.js) —
 * the API rejects anything else.
 *
 * Permissions are grouped purely for display. The backend has no notion
 * of groups; it's a flat array of strings.
 */
interface PermissionDefinition {
  key: string;
  title: string;
  description: string;
}

interface PermissionGroup {
  title: string;
  subtitle: string;
  permissions: PermissionDefinition[];
}

const VENDOR_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: 'Dashboard & insights',
    subtitle: 'Read-only access to vendor data',
    permissions: [
      {
        key: 'view_analytics',
        title: 'Revenue analytics & reports',
        description:
          'Access to historical data, charts, and financial exports.',
      },
    ],
  },
  {
    title: 'Operations',
    subtitle: 'Write access to the business',
    permissions: [
      {
        key: 'create_location',
        title: 'Create new locations',
        description: 'Allow user to list new parking facilities.',
      },
      {
        key: 'manage_bookings',
        title: 'Manage bookings',
        description: 'Customer check-in and check-out at the gate.',
      },
    ],
  },
  {
    title: 'Customer support',
    subtitle: 'Inbound from customers',
    permissions: [
      {
        key: 'manage_tickets',
        title: 'Reply to support tickets',
        description: 'View and respond to customer support tickets.',
      },
    ],
  },
  {
    title: 'Finance',
    subtitle: 'Money movement',
    permissions: [
      {
        key: 'withdraw_wallet',
        title: 'Withdraw from wallet',
        description: 'Move funds out of the vendor wallet.',
      },
    ],
  },
];

@Component({
  selector: 'app-admin-user-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-admin-manage-permissions.component.html',
  styleUrls: ['./super-admin-manage-permissions.component.scss'],
})
export class SuperAdminManagePermissions implements OnInit {
  user!: User;
  isLoading = true;

  // Per-permission saving state so each toggle can show its own spinner
  // and stay disabled while in flight.
  savingPermissions = new Set<string>();
  isUpdatingStatus = false;

  notificationMessage = '';
  notificationIsError = false;

  // Expose the catalog to the template.
  readonly permissionGroups = VENDOR_PERMISSION_GROUPS;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminDao = inject(AdminDao);
  private modalService = inject(ModalService);

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');

    if (userId) {
      this.loadUser(userId);
    } else {
      this.goBack();
    }
  }

  loadUser(id: string) {
    this.isLoading = true;
    this.adminDao.getUserById(id).subscribe({
      next: (userData) => {
        this.user = userData;
        if (!this.user.permissions) {
          this.user.permissions = [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.showNotification('User not found', true);
        this.goBack();
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Permission toggle
  // ---------------------------------------------------------------------------

  hasPermission(permission: string): boolean {
    return (this.user?.permissions || []).includes(permission);
  }

  isSavingPermission(permission: string): boolean {
    return this.savingPermissions.has(permission);
  }

  /**
   * Pessimistic update: send the change to the backend, and only mutate the
   * local model after the response confirms it. The checkbox stays disabled
   * while in flight so the admin can't double-click or toggle siblings into
   * a race condition.
   */
  togglePermission(permission: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const wantedState = checkbox.checked;

    // Snap the checkbox back to the current truth until the server confirms.
    // The template binds [checked] to hasPermission(), so this re-render is
    // automatic — but we still need to override the user's click visually.
    checkbox.checked = this.hasPermission(permission);

    // Build the new permissions array WITHOUT mutating the existing one,
    // so a failure leaves the original intact.
    const current = this.user.permissions || [];
    const next = wantedState
      ? [...current, permission]
      : current.filter((p) => p !== permission);

    this.savingPermissions.add(permission);

    this.adminDao.updateUser(this.user.id, { permissions: next }).subscribe({
      next: (updatedUser) => {
        // Trust the server's response, not our local guess.
        this.user.permissions = updatedUser.permissions || [];
        this.savingPermissions.delete(permission);
        this.showNotification(
          wantedState
            ? `Granted "${this.titleFor(permission)}"`
            : `Revoked "${this.titleFor(permission)}"`,
        );
      },
      error: (err) => {
        this.savingPermissions.delete(permission);
        const msg = err?.error?.message || 'Failed to save permission.';
        this.showNotification(msg, true);
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Suspend / reactivate
  // ---------------------------------------------------------------------------

  async suspendUser(): Promise<void> {
    // Defensive: backend will reject this too, but no point even asking.
    if (this.user.role === 'SUPER_ADMIN') {
      this.showNotification(
        'Super admin accounts cannot be modified.',
        true,
      );
      return;
    }

    const isCurrentlyActive = this.user.accountStatus === 'ACTIVE';
    const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';

    const confirmed = await this.modalService.confirm(
      isCurrentlyActive
        ? {
            title: 'Suspend account?',
            message: `${this.user.name} will be logged out and will not be able to sign in until you reactivate them. An email will be sent to notify them.`,
            confirmText: 'Suspend',
            cancelText: 'Cancel',
            type: 'danger',
          }
        : {
            title: 'Reactivate account?',
            message: `${this.user.name} will be able to sign in again. They'll receive a confirmation email.`,
            confirmText: 'Reactivate',
            cancelText: 'Cancel',
            type: 'default',
          },
    );

    if (!confirmed) return;

    this.isUpdatingStatus = true;

    this.adminDao
      .updateUser(this.user.id, { accountStatus: newStatus })
      .subscribe({
        next: (updatedUser) => {
          this.user.accountStatus = updatedUser.accountStatus;
          this.isUpdatingStatus = false;
          this.showNotification(
            newStatus === 'SUSPENDED'
              ? 'Account suspended. User has been notified by email.'
              : 'Account reactivated. User has been notified by email.',
          );
        },
        error: (err) => {
          this.isUpdatingStatus = false;
          const msg =
            err?.error?.message || 'Failed to update account status.';
          this.showNotification(msg, true);
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  goBack(): void {
    this.router.navigate(['/super_admin/rbac-panel']);
  }

  /** Look up the human-readable title for a permission key. */
  private titleFor(permission: string): string {
    for (const group of VENDOR_PERMISSION_GROUPS) {
      const match = group.permissions.find((p) => p.key === permission);
      if (match) return match.title;
    }
    return permission;
  }

  private showNotification(message: string, isError = false) {
    this.notificationMessage = message;
    this.notificationIsError = isError;
    setTimeout(() => {
      this.notificationMessage = '';
    }, 3000);
  }
}