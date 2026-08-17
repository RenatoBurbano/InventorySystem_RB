import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { PagedResult, Product, Transaction } from '../../interfaces/app-interfaces.interface';
import { AppService } from '../../services/api-services.service';
import { TransactionComponent } from '../transaction/transaction';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    DatePipe,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  products: Product[] = [];
  productSelected?: Product;
  displayedColumns: string[] = [
    'id',
    'createdDate',
    'transactionType',
    'productId',
    'amount',
    'unitPrice',
    'totalPrice',
    'actions',
  ];

  productId = new FormControl('');
  transactionType = new FormControl('');

  pageNumber: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;
  loading = true;

  pageNumbers: number[] = [];

  transactionTypes = [
    { name: 'Compra', value: 'Purchase' },
    { name: 'Venta', value: 'Sale' },
  ];

  private snackBar = inject(MatSnackBar);

  constructor(
    private appService: AppService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadTransactions();
  }

  loadProducts(): void {
    this.appService.getProducts().subscribe({
      next: (result: PagedResult<Product>) => {
        this.products = result.items;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los productos:', error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadTransactions(): void {
    this.loading = true;
    this.appService
      .getTransactions(
        this.pageNumber,
        this.pageSize,
        this.productId.value ? parseInt(this.productId.value) : 0,
        this.transactionType.value ?? '',
      )
      .subscribe({
        next: (result: PagedResult<Transaction>) => {
          this.transactions = result.items;
          this.totalCount = result.totalCount;
          this.totalPages = result.totalPages;
          this.generatePageNumbers();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar las transacciones:', error);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    this.cdr.detectChanges();
  }

  loadProductInfo($event: Event) {
    const select = event?.target as HTMLSelectElement;
    const selectedProductId = select.value;

    if (selectedProductId) {
      this.productSelected = this.products.find((p) => p.id == parseInt(selectedProductId));
    }
    this.cdr.detectChanges();
    this.loadTransactions();
  }

  deleteTransaction(transaction: Transaction) {
    this.appService.deleteTransaction(transaction).subscribe({
      next: (data) => {
        this.cdr.detectChanges();
        window.location.reload();
        this.snackBar.open('Se eliminó correctamente el producto', 'Undo', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      },
      error: (error) => {
        this.snackBar.open(error.error, 'Undo', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  openTransactionDialog() {
    const dialogRef = this.dialog.open(TransactionComponent, {
      height: '700px',
      width: '400px',
      minWidth: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      window.location.reload();
      this.cdr.detectChanges();
    });
  }

  generatePageNumbers(): void {
    this.pageNumbers = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, this.pageNumber - Math.floor(maxVisiblePages / 2));
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      this.pageNumbers.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.pageNumber) {
      this.pageNumber = page;
      this.loadTransactions();
    }
  }

  previousPage(): void {
    this.goToPage(this.pageNumber - 1);
  }

  nextPage(): void {
    this.goToPage(this.pageNumber + 1);
  }

  onPageSizeChange(event: any): void {
    this.pageSize = Number(event.target.value);
    this.pageNumber = 1;
    this.loadTransactions();
  }

  calculatedMax() {
    return Math.min(this.pageNumber * this.pageSize, this.totalCount);
  }
}
