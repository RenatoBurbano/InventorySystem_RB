import {
  ChangeDetectorRef,
  Component,
  inject,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AppService } from '../../services/api-services.service';
import { Product } from '../../interfaces/app-interfaces.interface';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product',
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatSnackBarModule, MatButtonModule],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class ProductComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  isEditMode = false;
  product?: Product;

  private snackBar = inject(MatSnackBar);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private appService: AppService,
    @Optional() public dialogRef: MatDialogRef<ProductComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { product: Product },
  ) {}

  ngOnInit(): void {
    if (this.data.product) {
      ((this.isEditMode = true), (this.product = this.data.product));
    }
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: [this.product?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      description: [
        this.product?.description ?? '',
        [Validators.required, Validators.maxLength(500)],
      ],
      category: [this.product?.category ?? '', [Validators.required, Validators.maxLength(100)]],
      image: [
        this.product?.imageUrl ?? '',
        [Validators.required, Validators.pattern('https?://.+')],
      ],
      price: [
        this.product?.price ?? '',
        [Validators.required, Validators.min(0.01), Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')],
      ],
      stock: [
        this.product?.stock ?? '',
        [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')],
      ],
    });
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const product: Product = {
        ...this.productForm.value,
        price: parseFloat(this.productForm.value.price),
        stock: parseFloat(this.productForm.value.stock),
      };

      if (this.isEditMode && this.product) {
        product.id = this.product.id;
        this.appService.updateProduct(product).subscribe({
          next: (data) => {
            this.snackBar.open('Se actualizó correctamente el producto', 'Undo', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.product = data;
            this.dialogRef.close();
          },
          error: (error) => {
            this.snackBar.open(error.error, 'Undo', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
      } else {
        this.appService.createProduct(product).subscribe({
          next: (data) => {
            this.snackBar.open('Se creó correctamente el producto', 'Undo', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.product = data;
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

  onImagenChange(): void {
    const imagenUrl = this.productForm.get('imagen')?.value;
    if (imagenUrl && imagenUrl.startsWith('http')) {
    } else {
    }
  }

  get name() {
    return this.productForm.get('name');
  }
  get description() {
    return this.productForm.get('description');
  }
  get category() {
    return this.productForm.get('category');
  }
  get image() {
    return this.productForm.get('image');
  }
  get price() {
    return this.productForm.get('price');
  }
  get stock() {
    return this.productForm.get('stock');
  }
}
