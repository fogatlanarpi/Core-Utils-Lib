import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { FormComponent } from './form/form';
import { HistoryComponent } from './history/history';
export const routes: Routes = [
{ path: '', component: HomeComponent },
{ path: 'uj', component: FormComponent },
{ path: 'naplo', component: HistoryComponent }
];
