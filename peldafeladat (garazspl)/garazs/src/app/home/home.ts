import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html' 
})
export class HomeComponent implements OnInit {
  
  vehicles$: Observable<any[]> | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    
    this.vehicles$ = this.http.get<any[]>('http://localhost:3000/api/vehicles');
  }
}