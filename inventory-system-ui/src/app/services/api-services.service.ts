import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult, Product, Transaction } from '../interfaces/app-interfaces.interface';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:5000/';

  getProducts(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResult<Product>>(this.apiUrl + 'api/products', { params });
  }

  getProduct(product: Product): Observable<Product> {
    return this.http.get<Product>(this.apiUrl + 'api/products/' + product.id);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl + 'api/products', product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(this.apiUrl + 'api/products/' + product.id, product);
  }

  deleteProduct(product: Product): Observable<Product> {
    return this.http.delete<Product>(this.apiUrl + 'api/products/' + product.id);
  }

  getTransactions(
    pageNumber: number = 1,
    pageSize: number = 10,
    productId = 0,
    transactionType = '',
  ): Observable<PagedResult<Transaction>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('productId', productId.toString())
      .set('transactionType', transactionType.toString());
    return this.http.get<PagedResult<Transaction>>(this.apiUrl + 'api/transactions', { params });
  }

  createPurchase(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl + 'api/transactions/purchase', transaction);
  }

  createSale(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl + 'api/transactions/sale', transaction);
  }

  deleteTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.delete<Transaction>(this.apiUrl + 'api/transactions/' + transaction.id);
  }
}
