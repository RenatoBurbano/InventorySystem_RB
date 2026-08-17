import { ChangeDetectorRef, Component, inject, Inject, OnInit, Optional } from '@angular/core';
import { PagedResult, Product } from '../../interfaces/app-interfaces.interface';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AppService } from '../../services/api-services.service';
import { ProductComponent } from '../product/product';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-products',
  imports: [
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = [
    'id',
    'name',
    'description',
    'category',
    'price',
    'stock',
    'actions',
  ];

  pageNumber: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  totalPages: number = 0;
  loading = true;

  pageNumbers: number[] = [];

  private snackBar = inject(MatSnackBar);

  constructor(
    private appService: AppService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.appService.getProducts(this.pageNumber, this.pageSize).subscribe({
      next: (result: PagedResult<Product>) => {
        this.products = result.items;
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.generatePageNumbers();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los productos:', error);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateProduct(product: Product) {
    this.openProductDialog(product);
  }

  deleteProduct(product: Product) {
    this.appService.deleteProduct(product).subscribe({
      next: (data) => {
        window.location.reload();
        this.cdr.detectChanges();
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

  openProductDialog(product?: Product) {
    const dialogRef = this.dialog.open(ProductComponent, {
      height: '775px',
      width: '600px',
      minWidth: '600px',
      data: { product: product },
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
      this.loadProducts();
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
    this.loadProducts();
  }

  calculatedMax() {
    return Math.min(this.pageNumber * this.pageSize, this.totalCount);
  }
}
