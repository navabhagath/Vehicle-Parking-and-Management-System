import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { WalletComponent } from './wallet.component';
import { WalletDao } from './wallet.dao';
import { CustomerDao } from '../customer.dao';

describe('WalletComponent', () => {
  let component: WalletComponent;
  let fixture: ComponentFixture<WalletComponent>;

  beforeEach(async () => {
    const walletDaoSpy = jasmine.createSpyObj('WalletDao', [
      'addMoney',
      'withdrawMoney',
    ]);
    const customerDaoSpy = {
      currentUser$: of({ id: 'user1', role: 'CUSTOMER' }),
      wallet$: of({ id: 'w1', balance: 500 }),
      getWalletByUser: jasmine
        .createSpy()
        .and.returnValue(of({ id: 'w1', balance: 500 })),
    };

    await TestBed.configureTestingModule({
      imports: [WalletComponent, RouterTestingModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WalletDao, useValue: walletDaoSpy },
        { provide: CustomerDao, useValue: customerDaoSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(WalletComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set walletBalance from wallet$ subscription', () => {
    expect(component.walletBalance).toBe(500);
  });

  it('should set walletId from wallet$ subscription', () => {
    expect(component.walletId).toBe('w1');
  });

  it('should default to add mode when walletMode is both', () => {
    expect(component.isAddMoneyMode).toBeTrue();
  });

  it('should set walletMode to add when add input is true', () => {
    component.add = true;
    component.ngOnInit();
    expect(component.walletMode).toBe('add');
    expect(component.isAddMoneyMode).toBeTrue();
  });

  it('should set walletMode to withdraw when add input is false', () => {
    component.add = false;
    component.ngOnInit();
    expect(component.walletMode).toBe('withdraw');
    expect(component.isAddMoneyMode).toBeFalse();
  });

  it('should have preset amounts defined', () => {
    expect(component.presetAmounts).toEqual([1000, 500, 250, 100]);
  });

  it('should have null selectedAmount initially', () => {
    expect(component.selectedAmount).toBeNull();
  });

  it('should unsubscribe on destroy', () => {
    spyOn((component as any).subscriptions, 'unsubscribe');
    component.ngOnDestroy();
    expect((component as any).subscriptions.unsubscribe).toHaveBeenCalled();
  });
});
