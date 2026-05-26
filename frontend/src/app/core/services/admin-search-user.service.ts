import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../models/User.model';
import { AdminDao } from '../../features/super-admin/super-admin-rbac-panel/admin.dao';

@Injectable({ providedIn: 'root' })
export class AdminSearchUserService {
  users = signal<User[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allUsers = this.users();

    if (!term) return allUsers;

    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.phone.includes(term) ||
        user.role.toLowerCase().includes(term),
    );
  });

  constructor(private adminDao: AdminDao) {} 

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminDao.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load users from the database.');
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }
}
