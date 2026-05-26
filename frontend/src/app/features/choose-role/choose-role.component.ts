import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-choose-role',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './choose-role.component.html',
  styleUrl: './choose-role.component.scss'
})
export class ChooseRoleComponent {
  constructor(){console.log('choose loaded')}
  
}
