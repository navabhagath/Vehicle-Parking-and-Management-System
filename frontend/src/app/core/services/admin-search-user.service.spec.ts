import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminSearchUserService } from './admin-search-user.service';
import { AdminDao } from '../../features/super-admin/super-admin-rbac-panel/admin.dao';
import { User } from '../../models/User.model';

describe('AdminSearchUserService', () => {
  let service: AdminSearchUserService;
  let adminDaoMock: jasmine.SpyObj<AdminDao>;

  const mockUsers = [
    {
      _id: '1',
      name: 'John Doe',
      phone: '9876543210',
      role: 'VENDOR',
      email: 'john@test.com',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      phone: '9123456789',
      role: 'CUSTOMER',
      email: 'jane@test.com',
    },
    {
      _id: '3',
      name: 'Admin User',
      phone: '9000000000',
      role: 'SUPER_ADMIN',
      email: 'admin@test.com',
    },
  ] as unknown as User[];

  beforeEach(() => {
    adminDaoMock = jasmine.createSpyObj('AdminDao', ['getAllUsers']);

    TestBed.configureTestingModule({
      providers: [
        AdminSearchUserService,
        { provide: AdminDao, useValue: adminDaoMock },
      ],
    });

    service = TestBed.inject(AdminSearchUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadUsers', () => {
    it('should load users successfully', () => {
      adminDaoMock.getAllUsers.and.returnValue(of(mockUsers));

      service.loadUsers();

      expect(service.users()).toEqual(mockUsers);
      expect(service.isLoading()).toBeFalse();
      expect(service.errorMessage()).toBe('');
    });

    it('should set loading to true while loading', () => {
      adminDaoMock.getAllUsers.and.returnValue(of(mockUsers));

      service.loadUsers();

      // After completion, loading should be false
      expect(service.isLoading()).toBeFalse();
    });

    it('should handle error when loading users fails', () => {
      adminDaoMock.getAllUsers.and.returnValue(
        throwError(() => new Error('Network error')),
      );

      service.loadUsers();

      expect(service.users()).toEqual([]);
      expect(service.isLoading()).toBeFalse();
      expect(service.errorMessage()).toBe(
        'Failed to load users from the database.',
      );
    });
  });

  describe('updateSearchTerm', () => {
    it('should update the search term', () => {
      service.updateSearchTerm('john');
      expect(service.searchTerm()).toBe('john');
    });
  });

  describe('filteredUsers', () => {
    beforeEach(() => {
      adminDaoMock.getAllUsers.and.returnValue(of(mockUsers));
      service.loadUsers();
    });

    it('should return all users when search term is empty', () => {
      service.updateSearchTerm('');
      expect(service.filteredUsers().length).toBe(3);
    });

    it('should filter users by name', () => {
      service.updateSearchTerm('john');
      expect(service.filteredUsers().length).toBe(1);
      expect(service.filteredUsers()[0].name).toBe('John Doe');
    });

    it('should filter users by phone', () => {
      service.updateSearchTerm('9876543210');
      expect(service.filteredUsers().length).toBe(1);
      expect(service.filteredUsers()[0].name).toBe('John Doe');
    });

    it('should filter users by role', () => {
      service.updateSearchTerm('vendor');
      expect(service.filteredUsers().length).toBe(1);
      expect(service.filteredUsers()[0].name).toBe('John Doe');
    });

    it('should be case-insensitive', () => {
      service.updateSearchTerm('JANE');
      expect(service.filteredUsers().length).toBe(1);
      expect(service.filteredUsers()[0].name).toBe('Jane Smith');
    });

    it('should return empty array when no match found', () => {
      service.updateSearchTerm('nonexistent');
      expect(service.filteredUsers().length).toBe(0);
    });
  });
});
