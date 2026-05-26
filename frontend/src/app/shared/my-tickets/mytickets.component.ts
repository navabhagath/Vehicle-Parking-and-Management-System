import { CommonModule, DatePipe,Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { HelpCenterDao } from './mytickets.dao';
import { Router } from '@angular/router';
import { Ticket } from '../../models/ticket.model';


type status2 = 'APPROVED'|'OPEN'|'REJECTED'|'IN_PROGRESS'
@Component({
  selector: 'app-helpcenter',
  standalone: true,
  imports: [DatePipe,CommonModule],
  templateUrl: './mytickets.component.html',
  styleUrl: './mytickets.component.scss'
})
export class MyTicketsComponent implements OnInit {

  tickets:Ticket[]=[];

  constructor(private location:Location){}

  private dao = inject(HelpCenterDao);

  private router = inject(Router)

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
      this.dao.getTicketsByUser().subscribe({
        next:(val)=>{
          this.tickets = val;
        }
      })

  }

  // Status options for the dropdown
// Define the options with the specific type
statuses: { value: status2; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];




getStatusClass(status: string): string {
  // Returns 'status-open', 'status-closed', or 'status-pending'
  return `status-${status.toLowerCase()}`;
}

formatStatus(status: string): string {
  const map: Record<string, string> = {
    'OPEN': 'Open',
    'IN_PROGRESS': 'In Progress',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected'
  };
  return map[status] || status;
}
onStatusChange(ticket: Ticket, newStatus: status2): void {
  console.log(ticket);
  console.log(newStatus)
  this.dao.updateTicketStatus(ticket.id,newStatus).subscribe({
    next:(val)=>{
      this.tickets.map((item)=>{
        if(item.id==ticket.id){
          item.status = newStatus;
        }
      })
    },
    error:(err)=>{
      console.log(err);
      console.log("error updating status")
    }
  })

}


raiseTicket(): void {
  this.router.navigate(['/customer/support'])
}





}
