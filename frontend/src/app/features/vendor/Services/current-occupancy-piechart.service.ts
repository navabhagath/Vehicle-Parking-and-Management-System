import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SlotSummary } from "../overview/overview.model";

@Injectable({
    providedIn : 'root'
})

export class CurrentOccupancyPiechartService{
    private currentOccupancyData = new BehaviorSubject<SlotSummary>({
        total : 0, occupied : 0, free : 0
    });

    public currentOccupancy$ = this.currentOccupancyData.asObservable();

    updateCurrentOccupancy(summary : SlotSummary){
        this.currentOccupancyData.next(summary);
    }
    
}