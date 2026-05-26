import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OtpTimerService } from './otp-timer.service';

describe('OtpTimerService', () => {
  let service: OtpTimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpTimerService);
  });

  afterEach(() => {
    service.stopTimer();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have timeLeft 0 initially or after stop', () => {
    service.stopTimer();
    let lastValue = -1;
    service.timeLeft$.subscribe((val) => (lastValue = val));
    expect(lastValue).toBe(0);
  });

  it('should emit the initial duration when startTimer is called', fakeAsync(() => {
    let lastValue = 0;
    service.timeLeft$.subscribe((val) => (lastValue = val));

    service.startTimer(5);
    expect(lastValue).toBe(5);

    tick(1000);
    expect(lastValue).toBe(4);

    tick(1000);
    expect(lastValue).toBe(3);

    service.stopTimer();
  }));

  it('should count down to 0', fakeAsync(() => {
    let lastValue = -1;
    service.timeLeft$.subscribe((val) => (lastValue = val));

    service.startTimer(3);
    tick(3000);

    expect(lastValue).toBe(0);
  }));

  it('should use default duration of 30 when none specified', fakeAsync(() => {
    let lastValue = 0;
    service.timeLeft$.subscribe((val) => (lastValue = val));

    service.startTimer();
    expect(lastValue).toBe(30);

    service.stopTimer();
  }));

  it('should stop timer and reset to 0', fakeAsync(() => {
    let lastValue = -1;
    service.timeLeft$.subscribe((val) => (lastValue = val));

    service.startTimer(10);
    tick(2000);
    expect(lastValue).toBe(8);

    service.stopTimer();
    expect(lastValue).toBe(0);
  }));

  it('should restart timer if startTimer is called again', fakeAsync(() => {
    let lastValue = 0;
    service.timeLeft$.subscribe((val) => (lastValue = val));

    service.startTimer(10);
    tick(3000);
    expect(lastValue).toBe(7);

    service.startTimer(5);
    expect(lastValue).toBe(5);

    tick(2000);
    expect(lastValue).toBe(3);

    service.stopTimer();
  }));
});
