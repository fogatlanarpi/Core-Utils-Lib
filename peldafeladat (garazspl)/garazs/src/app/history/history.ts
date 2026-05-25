import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.html' 
})
export class HistoryComponent implements OnInit {
  vId: number = 0;
  logs: any[] = [];

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.vId = parseInt(p['vehicleId']) || 0;
      if (this.vId > 0) {
        this.http.get<any[]>(`http://localhost:3000/api/vehicles/${this.vId}/logs`)
          .subscribe(res => {
            this.logs = res;
            
     
            this.cdr.detectChanges(); 
          });
      }
    });
  }
}