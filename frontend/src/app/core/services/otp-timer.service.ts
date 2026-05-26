import { Injectable } from '@angular/core';
import { BehaviorSubject, timer, Subscription, map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OtpTimerService {
  private timeLeftSubject = new BehaviorSubject<number>(0);
  public timeLeft$ = this.timeLeftSubject.asObservable();
  private timerSub?: Subscription;

  startTimer(duration: number = 30) {
    this.stopTimer();
    this.timeLeftSubject.next(duration);

    this.timerSub = timer(0, 1000).pipe(
      take(duration + 1),
      map(elapsed => duration - elapsed)
    ).subscribe({
      next: (val) => this.timeLeftSubject.next(val),
      complete: () => this.timeLeftSubject.next(0)
    });
  }

  stopTimer() {
    if (this.timerSub) this.timerSub.unsubscribe();
    this.timeLeftSubject.next(0);
  }
}