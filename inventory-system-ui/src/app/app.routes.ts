import { Routes } from '@angular/router';
import { ProductsComponent } from './components/products/products';
import { TransactionsComponent } from './components/transactions/transactions';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductsComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: '**', redirectTo: '/products' },
];
