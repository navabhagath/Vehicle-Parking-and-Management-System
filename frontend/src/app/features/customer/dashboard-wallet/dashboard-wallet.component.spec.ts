import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardWalletComponent } from './dashboard-wallet.component';
import { CustomerDao } from '../../../shared/customer.dao';
import { TransactionDao } from '../../../shared/recent-transaction/recent-transaction.dao';
import { RouterTestingModule } from '@angular/router/testing';

describe('DashboardWalletComponent', () => {
  let component: DashboardWalletComponent;
  let fixture: ComponentFixture<DashboardWalletComponent>;
  let daoSpy: jasmine.SpyObj<CustomerDao>;
  let transactionDaoSpy: jasmine.SpyObj<TransactionDao>;

  beforeEach(async () => {
    daoSpy = jasmine.createSpyObj('CustomerDao', ['getWalletByUser'], {
      wallet$: of({ balance: 250 }),
    });
    daoSpy.getWalletByUser.and.returnValue(of([{ balance: 250 }] as any));
    transactionDaoSpy = jasmine.createSpyObj('TransactionDao', [
      'getTransactionsByUser',
    ]);

    await TestBed.configureTestingModule({
      imports: [DashboardWalletComponent, RouterTestingModule],
      providers: [
        { provide: CustomerDao, useValue: daoSpy },
        { provide: TransactionDao, useValue: transactionDaoSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardWalletComponent);
    component = fixture.componentInstance;
    component.user = { id: 'u1', name: 'Test' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set walletValue from wallet$', () => {
    expect(component.walletValue).toBe(250);
  });

  it('should call getWalletByUser on init', () => {
    expect(daoSpy.getWalletByUser).toHaveBeenCalledWith('u1');
  });

  it('should download transactions PDF', () => {
    const mockTransactions = [
      {
        type: 'RECHARGE',
        amount: 100,
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
      },
    ];
    transactionDaoSpy.getTransactionsByUser.and.returnValue(
      of(mockTransactions as any),
    );

    // Just verify it doesn't throw
    expect(() => component.downloadTransactionsPdf()).not.toThrow();
  });
});
