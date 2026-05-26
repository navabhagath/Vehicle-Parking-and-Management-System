import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VendorVehiclePieComponent } from './vendor-vehicle-pie.component';

describe('VendorVehiclePieComponent', () => {
  let component: VendorVehiclePieComponent;
  let fixture: ComponentFixture<VendorVehiclePieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorVehiclePieComponent, RouterTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorVehiclePieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
