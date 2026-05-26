import { Injectable } from '@angular/core';


import { map, Observable } from 'rxjs';
import { RawUser, RawRevenue, DashboardStats } from './../admin-dashboard/admin-dashboard.model';
import { Vendor } from './../admin-vendor/admin-vendor.model';

import { RevenueRecord } from './../admin-revenue/admin-revenue.model';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  // constructor(
  //   private dashboardDao: AdminDashboardDAO,
  //   private vendorDao: VendorDao,
  //   private vendorDetailsDao: VendorDetailsDao,
  //   private revenueDao: RevenueDao
  // ) {}


  // private flatten(data: any[]): any[] {
  //   return (data || []).flat(Infinity);
  // }

  // Update this in data.service.ts
// private flatten(data: any): any[] {
//   if (!data) return [];
//   // If it's already an array, flatten it. If it's a single object, wrap it in an array.
//   return Array.isArray(data) ? data.flat(Infinity) : [data];
// }

//   private filterVendors(users: any[]): any[] {
//     return users.filter(u => u.role === 'VENDOR');
//   }

/**
 * Uses Generics <T> to ensure that whatever type goes in 
 * (User, Location, etc.) is exactly what comes out as an array.
 */
private flatten<T>(data: T | T[] | undefined | null): T[] {
  if (!data) return [];
  // If it's an array, flatten it; if it's a single object, wrap it in an array
  return Array.isArray(data) ? (data.flat(Infinity) as T[]) : [data];
}

/**
 * Explicitly typed to handle RawUser objects from your dashboard model.
 */
private filterVendors(users: RawUser[]): RawUser[] {
  return users.filter((u: RawUser) => u.role === 'VENDOR');
}

 
 
  public applySearchFilter<T>(list: T[], searchTerm: string, keys: (keyof T)[]): T[] {
    if (!searchTerm) return [...list];
    const lowTerm = searchTerm.toLowerCase();
    
    return list.filter(item => 
      keys.some(key => {
        const value = item[key]; //grabs value
        return value ? String(value).toLowerCase().includes(lowTerm) : false;
      })
    );
  }
}

  