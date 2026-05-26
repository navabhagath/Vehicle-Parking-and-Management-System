import { Component } from '@angular/core';
import { LandingPageComponent } from "./landing-page/landing-page.component";

@Component({
  selector: 'app-vendor',
  standalone: true,
  imports: [LandingPageComponent],
  templateUrl: './vendor.component.html',
  styleUrl: './vendor.component.scss'
})
export class VendorComponent {

}
