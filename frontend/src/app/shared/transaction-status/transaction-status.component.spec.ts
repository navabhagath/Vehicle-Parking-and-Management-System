import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TransactionStatusOverlayComponent } from './transaction-status.component';

describe('TransactionStatusComponent', () => {
  let component: TransactionStatusOverlayComponent;
  let fixture: ComponentFixture<TransactionStatusOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionStatusOverlayComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionStatusOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be visible when status is null', () => {
    component.status = null;
    expect(component.visible).toBeFalse();
  });

  it('should be visible when status is loading', () => {
    component.status = 'loading';
    expect(component.visible).toBeTrue();
  });

  it('should be visible when status is success', () => {
    component.status = 'success';
    expect(component.visible).toBeTrue();
  });

  it('should be visible when status is error', () => {
    component.status = 'error';
    expect(component.visible).toBeTrue();
  });

  it('should emit retry event on onRetry', () => {
    spyOn(component.retry, 'emit');
    component.onRetry();
    expect(component.retry.emit).toHaveBeenCalled();
  });

  it('should emit dismissed event on onDismiss', () => {
    spyOn(component.dismissed, 'emit');
    component.onDismiss();
    expect(component.dismissed.emit).toHaveBeenCalled();
  });

  it('should have default error message', () => {
    expect(component.errorMessage).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('should have default amount of 0', () => {
    expect(component.amount).toBe(0);
  });
});
