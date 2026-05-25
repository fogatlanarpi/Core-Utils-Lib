import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './form.html'
})
export class FormComponent implements OnInit {
  vId: number = 0;
  date: string = '';
  comp: string = '';
  desc: string = '';
  errMsg: string | null = null;

  // 2. Beinjektálva a constructorba: cdr
  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.vId = parseInt(p['vehicleId']) || 0;
      this.cdr.detectChanges(); // Biztosítjuk az ID frissülését is
    });
  }

  save() {
    const body = { 
      vehicleId: this.vId, 
      date: this.date, 
      component: this.comp, 
      description: this.desc 
    };

    this.http.post('http://localhost:3000/api/logs', body).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errMsg = err.error?.message || 'Sikertelen hálózati kérés!';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.errMsg = null;
          this.cdr.detectChanges(); 
        }, 4000); 
      }
    });
  }
}