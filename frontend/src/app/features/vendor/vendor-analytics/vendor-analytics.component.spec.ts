import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { VendorAnalyticsComponent } from './vendor-analytics.component';

describe('VendorAnalyticsComponent', () => {
  let component: VendorAnalyticsComponent;
  let fixture: ComponentFixture<VendorAnalyticsComponent>;

  const mockRoute = {
    parent: {
      paramMap: of(new Map([['id', 'loc789']])),
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorAnalyticsComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set locationId from route params', () => {
    expect(component.locationId).toBe('loc789');
  });
});
