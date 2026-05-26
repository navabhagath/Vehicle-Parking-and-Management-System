
// import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Chart, registerables } from 'chart.js';
// import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
// import { AdminDashboardService } from './admin-dashboard.service';

// @Component({
//   selector: 'app-admin-dashboard',
//   standalone: true,
//   imports: [CommonModule, AdminSidebarComponent],
//   templateUrl: './admin-dashboard.component.html',
//   styleUrl: './admin-dashboard.component.scss',
// })
// export class AdminDashboardComponent implements OnInit, AfterViewInit {
//   totalVendors: number = 0;
//   totalRevenue: number = 0;

//   private dashboardService = inject(AdminDashboardService);

//   private revenueChart!: Chart;
//   private growthChartInstance!: Chart;
//   private topVendorsChartInstance!: Chart;

//   @ViewChild('revenueChart') chartCanvas!: ElementRef;
//   @ViewChild('growthChart') growthCanvas!: ElementRef;
//   @ViewChild('topVendorsChart') topVendorsCanvas!: ElementRef;

//   constructor() {
//     Chart.register(...registerables);
//   }

//   ngOnInit(): void {
//     this.dashboardService.getDashboardStats().subscribe({
//       next: (stats) => {
//         this.totalVendors = stats.totalVendors;
//         this.totalRevenue = stats.totalRevenue;

     
//         const revLabels = stats.monthlyAnalysis.map((item: any) => item.month);
//         const revData = stats.monthlyAnalysis.map((item: any) => item.amount);
//         this.updateRevenueChart(revLabels, revData);

//         const top5Vendors = [...stats.topVendorsRevenue]
//           .sort((a: any, b: any) => b.value - a.value)
//           .slice(0, 5);

//         const topLabels = top5Vendors.map((item: any) => item.name);
//         const topData = top5Vendors.map((item: any) => item.value);
//         this.updateTopVendorsChart(topLabels, topData);

     
//         const growthLabels = stats.growthVelocity.map((item: any) => item.month);
//         const growthData = stats.growthVelocity.map((item: any) => item.totalVendors);
//         this.updateGrowthChart(growthLabels, growthData);
//       },
//       error: (err) => console.error('Dashboard logic failed:', err),
//     });
//   }

//   ngAfterViewInit() {
//     this.initAllCharts();
//   }

//   private formatINR(value: number): string {
//     if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
//     if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
//     if (value >= 1000) return '₹' + (value / 1000).toFixed(1) + 'K';
//     return '₹' + value;
//   }

  
//   private truncateLabel(label: string, max: number = 18): string {
//     if (!label) return '';
//     return label.length > max ? label.substring(0, max - 1) + '…' : label;
//   }

//   initAllCharts() {
  
//     const gridColor = 'rgba(0, 0, 0, 0.05)';
//     const tickColor = '#6b7280';
//     const tickFont = { size: 11, family: 'inherit', weight: 500 as const };

   
//     this.revenueChart = new Chart(this.chartCanvas.nativeElement, {
//       type: 'bar',
//       data: {
//         labels: [],
//         datasets: [{
//           label: 'Revenue (₹)',
//           data: [],
//           backgroundColor: '#f59e0b',
//           hoverBackgroundColor: '#d97706',
//           borderRadius: 6,
//           borderSkipped: false
        
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         layout: { padding: { top: 10, right: 10, bottom: 0, left: 0 } },
//         plugins: {
//           legend: { display: false },
//           tooltip: {
//             backgroundColor: '#111827',
//             titleColor: '#fff',
//             bodyColor: '#fff',
//             padding: 12,
//             cornerRadius: 8,
//             titleFont: { size: 12, weight: 600 },
//             bodyFont: { size: 13, weight: 600 },
//             displayColors: false,
//             callbacks: {
//               label: (ctx) => ' Revenue: ' + this.formatINR(ctx.parsed.y ?? 0)
//             }
//           }
//         },
//         scales: {
//           x: {
//             grid: { display: false },
//             border: { display: false },
//             ticks: { color: tickColor, font: tickFont }
//           },
//           y: {
//             beginAtZero: true,
//             grid: { color: gridColor },
//             border: { display: false },
//             ticks: {
//               color: tickColor,
//               font: tickFont,
//               padding: 8,
//               callback: (value) => this.formatINR(Number(value))
//             }
//           }
//         }
//       }
//     });

//     this.topVendorsChartInstance = new Chart(this.topVendorsCanvas.nativeElement, {
//       type: 'bar',
//       data: {
//         labels: [],
//         datasets: [{
//           label: 'Revenue (₹)',
//           data: [],
//           backgroundColor: [
//             '#6366f1',
//             '#10b981',
//             '#f43f5e',
//             '#8b5cf6',
//             '#f59e0b'
//           ],
//           hoverBackgroundColor: [
//             '#4f46e5',
//             '#059669',
//             '#e11d48',
//             '#7c3aed',
//             '#d97706'
//           ],
//           borderRadius: 6,
//           borderSkipped: false,
//           barThickness: 22
//         }]
//       },
//       options: {
//         indexAxis: 'y',
//         responsive: true,
//         maintainAspectRatio: false,
//         layout: { padding: { top: 10, right: 20, bottom: 0, left: 0 } },
//         plugins: {
//           legend: { display: false },
//           tooltip: {
//             backgroundColor: '#111827',
//             titleColor: '#fff',
//             bodyColor: '#fff',
//             padding: 12,
//             cornerRadius: 8,
//             titleFont: { size: 12, weight: 600 },
//             bodyFont: { size: 13, weight: 600 },
//             displayColors: false,
//             callbacks: {
//               title: (items) => items[0].label,
//               label: (ctx) => ' Revenue: ' + this.formatINR(Number(ctx.parsed.x))
//             }
//           }
//         },
//         scales: {
//           x: {
//             beginAtZero: true,
//             grid: { color: gridColor },
//             border: { display: false },
//             ticks: {
//               color: tickColor,
//               font: tickFont,
//               padding: 8,
//               callback: (value) => this.formatINR(Number(value))
//             }
//           },
//           y: {
//             grid: { display: false },
//             border: { display: false },
//             ticks: {
//               color: '#374151',
//               font: { size: 12, family: 'inherit', weight: 600 },
//               padding: 10,
            
//               callback: function (value) {
//                 const label = this.getLabelForValue(Number(value));
//                 return label.length > 18 ? label.substring(0, 17) + '…' : label;
//               }
//             }
//           }
//         }
//       }
//     });


//     this.growthChartInstance = new Chart(this.growthCanvas.nativeElement, {
//       type: 'line',
//       data: {
//         labels: [],
//         datasets: [{
//           label: 'Total Vendors',
//           data: [],
//           fill: true,
//           borderColor: '#10b981',
//           backgroundColor: 'rgba(16, 185, 129, 0.12)',
//           pointBackgroundColor: '#10b981',
//           pointBorderColor: '#ffffff',
//           pointBorderWidth: 2,
//           pointRadius: 4,
//           pointHoverRadius: 6,
//           borderWidth: 2.5,
//           tension: 0.4
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         layout: { padding: { top: 10, right: 10, bottom: 0, left: 0 } },
//         plugins: {
//           legend: { display: false },
//           tooltip: {
//             backgroundColor: '#111827',
//             titleColor: '#fff',
//             bodyColor: '#fff',
//             padding: 12,
//             cornerRadius: 8,
//             titleFont: { size: 12, weight: 600 },
//             bodyFont: { size: 13, weight: 600 },
//             displayColors: false,
//             callbacks: {
//               label: (ctx) => ' Vendors: ' + ctx.parsed.y
//             }
//           }
//         },
//         scales: {
//           x: {
//             grid: { display: false },
//             border: { display: false },
//             ticks: { color: tickColor, font: tickFont }
//           },
//           y: {
//             beginAtZero: true,
//             grid: { color: gridColor },
//             border: { display: false },
//             ticks: {
//               color: tickColor,
//               font: tickFont,
//               padding: 8,
//               precision: 0
//             },
//             title: {
//               display: true,
//               text: 'Total Vendors',
//               color: tickColor,
//               font: { size: 11, weight: 600 }
//             }
//           }
//         }
//       }
//     });
//   }

//   updateRevenueChart(labels: string[], data: number[]) {
//     if (this.revenueChart) {
//       this.revenueChart.data.labels = labels;
//       this.revenueChart.data.datasets[0].data = data;
//       this.revenueChart.update();
//     }
//   }

//   updateTopVendorsChart(labels: string[], data: number[]) {
//     if (this.topVendorsChartInstance) {
//       // Keep full names for tooltip via labels, truncation handled in tick callback
//       this.topVendorsChartInstance.data.labels = labels;
//       this.topVendorsChartInstance.data.datasets[0].data = data;
//       this.topVendorsChartInstance.update();
//     }
//   }

//   updateGrowthChart(labels: string[], data: number[]) {
//     if (this.growthChartInstance) {
//       this.growthChartInstance.data.labels = labels;
//       this.growthChartInstance.data.datasets[0].data = data;
//       this.growthChartInstance.update();
//     }
//   }
// }


import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminDashboardService } from './admin-dashboard.service';
 
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  totalVendors: number = 0;
  totalRevenue: number = 0;
 
  private dashboardService = inject(AdminDashboardService);
 
  private revenueChart!: Chart;
  private growthChartInstance!: Chart;
  private topVendorsChartInstance!: Chart;
 
  @ViewChild('revenueChart') chartCanvas!: ElementRef;
  @ViewChild('growthChart') growthCanvas!: ElementRef;
  @ViewChild('topVendorsChart') topVendorsCanvas!: ElementRef;
 
  constructor() {
    Chart.register(...registerables);
  }
 
  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalVendors = stats.totalVendors;
        this.totalRevenue = stats.totalRevenue;
 
        // 1. Revenue Chart Data
        const revLabels = stats.monthlyAnalysis.map((item: any) => item.month);
        const revData = stats.monthlyAnalysis.map((item: any) => item.amount);
        this.updateRevenueChart(revLabels, revData);
 
        // 2. Top Vendors Data
        const top5Vendors = [...stats.topVendorsRevenue]
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 5);
        const topLabels = top5Vendors.map((item: any) => item.name);
        const topData = top5Vendors.map((item: any) => item.value);
        this.updateTopVendorsChart(topLabels, topData);
 
        // 3. Growth Chart Data (Split "Month Year" into array for multi-line labels)
        const growthLabels = stats.growthVelocity.map((item: any) => {
          // If item.month is "Jan 2026", this becomes ["Jan", "2026"]
          return item.month.includes(' ') ? item.month.split(' ') : item.month;
        });
        const growthData = stats.growthVelocity.map((item: any) => item.totalVendors);
        this.updateGrowthChart(growthLabels, growthData);
      },
      error: (err) => console.error('Dashboard logic failed:', err),
    });
  }
 
  ngAfterViewInit() {
    this.initAllCharts();
    // this.loadDashboardData();
  }
 
  private formatINR(value: number): string {
    if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
    if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
    if (value >= 1000) return '₹' + (value / 1000).toFixed(1) + 'K';
    return '₹' + value;
  }
 
  initAllCharts() {
    const gridColor = 'rgba(0, 0, 0, 0.05)';
    const tickColor = '#6b7280';
    const tickFont = { size: 11, family: 'inherit', weight: 500 as const };
    const titleFont = { size: 12, family: 'inherit', weight: 600 as const };
 
    // --- REVENUE CHART ---
    this.revenueChart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Revenue (₹)',
          data: [],
          backgroundColor: '#f59e0b',
          hoverBackgroundColor: '#d97706',
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,//height controlled via css
        layout: { padding: { top: 10, right: 10, bottom: 5, left: 5 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            callbacks: {
              label: (ctx) => ' Revenue: ' + this.formatINR(ctx.parsed.y ?? 0)
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Monthly Performance', color: tickColor, font: titleFont },
            grid: { display: false },
            ticks: { color: tickColor, font: tickFont }
          },
          y: {
            title: { display: true, text: 'Revenue (₹)', color: tickColor, font: titleFont },
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: tickFont,
              callback: (value) => this.formatINR(Number(value))
            }
          }
        }
      }
    });
 
    // --- TOP VENDORS CHART (Horizontal) ---
    this.topVendorsChartInstance = new Chart(this.topVendorsCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ['#6366f1', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b'],
          borderRadius: 6,
          barThickness: 22
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 20 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ' Revenue: ' + this.formatINR(Number(ctx.parsed.x))
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Total Revenue Generated', color: tickColor, font: titleFont },
            beginAtZero: true,
            ticks: { callback: (value) => this.formatINR(Number(value)) }
          },
          y: {
            title: { display: true, text: 'Vendors', color: tickColor, font: titleFont },
            grid: { display: false },
            ticks: {
              color: '#374151',
              font: { size: 11, weight: 600 },
              callback: function (value) {
                const label = this.getLabelForValue(Number(value));
                return label.length > 15 ? label.substring(0, 14) + '…' : label;
              }
            }
          }
        }
      }
    });
 
    // --- GROWTH CHART (Line) ---
    this.growthChartInstance = new Chart(this.growthCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Total Vendors',
          data: [],
          fill: true,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          pointBackgroundColor: '#10b981',
          borderWidth: 2.5,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              // Re-joins the split label ["Jan", "2026"] into "Jan 2026" for the tooltip
              title: (items) => Array.isArray(items[0].label) ? items[0].label.join(' ') : items[0].label
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Vendor Registration Timeline', color: tickColor, font: titleFont },
            grid: { display: false },
            ticks: {
              color: tickColor,
              font: { size: 10, weight: 500 },
              maxRotation: 0, // Keeps it neat and horizontal
              autoSkip: true
            }
          },
          y: {
            title: { display: true, text: 'Total Active Vendors', color: tickColor, font: titleFont },
            beginAtZero: true,
            grid: { color: gridColor },
            ticks: { precision: 0 }
          }
        }
      }
    });
  }
 
  updateRevenueChart(labels: string[], data: number[]) {
    if (this.revenueChart) {
      this.revenueChart.data.labels = labels;
      this.revenueChart.data.datasets[0].data = data;
      this.revenueChart.update();
    }
  }
 
  updateTopVendorsChart(labels: string[], data: number[]) {
    if (this.topVendorsChartInstance) {
      this.topVendorsChartInstance.data.labels = labels;
      this.topVendorsChartInstance.data.datasets[0].data = data;
      this.topVendorsChartInstance.update();
    }
  }
 
  updateGrowthChart(labels: any[], data: number[]) {
    if (this.growthChartInstance) {
      this.growthChartInstance.data.labels = labels;
      this.growthChartInstance.data.datasets[0].data = data;
      this.growthChartInstance.update();
    }
  }
}
 