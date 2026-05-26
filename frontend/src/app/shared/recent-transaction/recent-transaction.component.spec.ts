import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { RecentTransactionsComponent as RecentTransactionComponent } from './recent-transaction.component';
import { TransactionDao } from './recent-transaction.dao';

describe('RecentTransactionComponent', () => {
  let component: RecentTransactionComponent;
  let fixture: ComponentFixture<RecentTransactionComponent>;
  let dao: any;

  beforeEach(async () => {
    const daoSpy = {
      currentUser$: of({ id: 'user1', name: 'Test' }),
      getTransactionsByUser: jasmine.createSpy().and.returnValue(
        of([
          { id: 'tx1', amount: 100 },
          { id: 'tx2', amount: 200 },
        ]),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [RecentTransactionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TransactionDao, useValue: daoSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentTransactionComponent);
    component = fixture.componentInstance;
    dao = TestBed.inject(TransactionDao);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load transactions on init', () => {
    expect(component.transactions.length).toBe(2);
  });

  it('should set loading to false after load', () => {
    expect(component.loading).toBeFalse();
  });

  it('should set hasNext when results equal limit', () => {
    // With 2 results and limit 5, hasNext should be false
    expect(component.hasNext).toBeFalse();
  });

  it('should set hasPrev to false on first page', () => {
    expect(component.hasPrev).toBeFalse();
  });

  it('should increment page on nextPage if hasNext', () => {
    component.hasNext = true;
    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  it('should not increment page if hasNext is false', () => {
    component.hasNext = false;
    component.nextPage();
    expect(component.currentPage).toBe(1);
  });

  it('should decrement page on prevPage if hasPrev', () => {
    component.currentPage = 3;
    component.hasPrev = true;
    component.prevPage();
    expect(component.currentPage).toBe(2);
  });

  it('should not decrement page if hasPrev is false', () => {
    component.currentPage = 1;
    component.hasPrev = false;
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should unsubscribe on destroy', () => {
    spyOn((component as any).sub, 'unsubscribe');
    component.ngOnDestroy();
    expect((component as any).sub.unsubscribe).toHaveBeenCalled();
  });
});
