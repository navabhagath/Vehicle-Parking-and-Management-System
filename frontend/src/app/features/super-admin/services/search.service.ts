import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  
  private searchSource = new BehaviorSubject<string>('');
  

  currentSearchTerm = this.searchSource.asObservable();

 
  updateSearch(term: string) {
    this.searchSource.next(term);
  }
}