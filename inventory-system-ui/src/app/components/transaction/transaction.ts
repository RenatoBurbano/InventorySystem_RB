import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { AppService } from '../../services/api-services.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PagedResult, Product, Transaction } from '../../interfaces/app-interfaces.interface';
import { disabled } from '@angular/forms/signals';
import { ProductComponent } from '../product/product';

@Component({
  selector: 'app-transaction',
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatSnackBarModule, MatButtonModule],
  templateUrl: './transaction.html',
  styleUrl: './transaction.css',
})
export class TransactionComponent implements OnInit, OnDestroy {
  transactionForm!: FormGroup;
  submitted = false;
  products: Product[] = [];

  transactionTypes = [
    { name: 'Compra', value: 'Purchase' },
    { name: 'Venta', value: 'Sale' },
  ];

  private snackBar = inject(MatSnackBar);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private appService: AppService,
    @Optional() public dialogRef: MatDialogRef<ProductComponent>,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.appService.getProducts().subscribe({
      next: (result: PagedResult<Product>) => {
        this.products = result.items;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los productos:', error);
        this.cdr.detectChanges();
      },
    });
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      transactionType: ['', [Validators.required]],
      productId: [[Validators.required]],
      amount: ['', [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]],
      unitPrice: [''],
      totalPrice: [''],
      detail: ['', [Validators.required, Validators.maxLength(500)]],
    });
    this.unitPrice?.disable();
    this.totalPrice?.disable();
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const transaction: Transaction = {
        ...this.transactionForm.value,
        amount: parseFloat(this.transactionForm.value.amount),
        unitPrice: parseFloat(this.unitPrice?.value),
        totalPrice: parseFloat(this.totalPrice?.value),
      };

      if (transaction.transactionType == 'Purchase') {
        this.appService.createPurchase(transaction).subscribe({
          next: (data) => {
            this.snackBar.open('Se eliminó correctamente la transacción', 'Undo', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.dialogRef.close();
          },
          error: (error) => {
            this.snackBar.open(error, 'Undo', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
            console.error('Error al crear una nueva compra', error);
          },
        });
      } else if (transaction.transactionType == 'Sale') {
        this.appService.createSale(transaction).subscribe({
          next: (data) => {
            this.snackBar.open('Se eliminó correctamente la transacción', 'Undo', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.dialogRef.close();
          },
          error: (error) => {
            this.snackBar.open(error.error, 'Undo', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
      }
    }
  }

  setPrices($event: Event) {
    const select = event?.target as HTMLSelectElement;
    const selectedProductId = select.value;

    if (selectedProductId) {
      const productSelected = this.products.find((p) => p.id == parseInt(selectedProductId));
      this.unitPrice?.setValue(productSelected?.price);
      this.totalPrice?.setValue(this.unitPrice?.value * this.amount?.value);
    }
  }

  onAmountBlur($event: Event) {
    this.totalPrice?.setValue(this.unitPrice?.value * this.amount?.value);
  }

  get transactionType() {
    return this.transactionForm.get('transactionType');
  }
  get productId() {
    return this.transactionForm.get('productId');
  }
  get amount() {
    return this.transactionForm.get('amount');
  }
  get unitPrice() {
    return this.transactionForm.get('unitPrice');
  }
  get totalPrice() {
    return this.transactionForm.get('totalPrice');
  }
  get detail() {
    return this.transactionForm.get('detail');
  }
}
