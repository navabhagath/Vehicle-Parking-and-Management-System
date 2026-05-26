import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { NewLocation, LocationResponse, UploadGstResponse, CreateLocationResponse } from './add-new-location.model';
import { environment } from '../../../env/evironment';

@Injectable({ providedIn: 'root' })
export class AddNewLocationService {
  private http: HttpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  uploadGstDocument(file: File): Observable<UploadGstResponse> {
    const fd = new FormData();
    fd.append('gstDocument', file);
    return this.http.post<UploadGstResponse>(
      `${this.apiUrl}/vendor/parkinglocations/upload-gst`,
      fd
    );
  }

  postLocation(formData: NewLocation): Observable<CreateLocationResponse> {
    return this.http.post<CreateLocationResponse>(
      `${this.apiUrl}/vendor/parkinglocations`,
      formData,
    );
  }

  buildLocationData(
    formValue: any,
    vendorId: string,
    operationalDays: { id: number; day: string }[],
    selectedDayFlags: boolean[],
    amenities: { id: number; prop: string }[],
    selectedAmenityFlags: boolean[],
    gstUrl: string,
  ): NewLocation {
    const selectedDays = operationalDays
      .filter((_, i) => selectedDayFlags[i])
      .map((d) => d.day.substring(0, 3));

    const selectedAmenities = amenities
      .filter((_, i) => selectedAmenityFlags[i])
      .map((a) => a.prop);

    const {
      locationName,
      geo,
      operationalHours,
      capacity,
      bikePrice,
      carPrice,
    } = formValue;

    return {
      locationName,
      geo,
      operationalDays: selectedDays,
      operationalHours,
      capacity,
      bikePrice,
      carPrice,
      amenities: selectedAmenities,
      vendorId,
      documents: { gstDocument: gstUrl },
    };
  }

  checkLocationNameExists(name: string): Observable<boolean> {
    const trimmed = name.trim();
    return this.http
      .get<any[]>(`${this.apiUrl}/vendor/parkinglocations`, {
        params: { locationName: trimmed },
      })
      .pipe(map((results) => results.length > 0));
  }
}