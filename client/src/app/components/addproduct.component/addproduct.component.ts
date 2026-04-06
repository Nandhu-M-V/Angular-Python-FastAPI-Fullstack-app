import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { ProductService } from '../../services/products.service';
import { Router } from '@angular/router';
import { ToastService } from '../../UI/services/toast.service';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './addproduct.component.html'
})
export class CreateProductComponent {

  private fb = inject(NonNullableFormBuilder); // ✅ avoids null issues
  private productService = inject(ProductService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = false;

  form = this.fb.group({
    title: ['', Validators.required],
    price: [0, Validators.required],
    brand: [''],
    stock: [0],
    description: [''],
    images: [''],
    specs: [''],
    category_id: [1]
  });

  submit() {
    if (this.form.invalid) return;

    this.loading = true;

    const raw = this.form.getRawValue(); // ✅ safer than value

    let images: string[] = [];
    let specs: Record<string, any> = {};

    // ✅ images parsing
    if (raw.images) {
      images = raw.images
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);
    }

    // ✅ specs parsing
    try {
      specs = raw.specs ? JSON.parse(raw.specs) : {};
    } catch {
      this.toast.show('Invalid specs JSON ❌', 'error');
      this.loading = false;
      return;
    }

    const payload = {
      ...raw,
      images,
      specs
    };

    this.productService.createProduct(payload).subscribe({
      next: () => {
        this.toast.show('Product created 🚀', 'success');

        this.form.reset({
          title: '',
          price: 0,
          brand: '',
          stock: 0,
          description: '',
          images: '',
          specs: '',
          category_id: 1
        });

        this.loading = false;

        this.router.navigate(['/']);
      },
      error: () => {
        this.toast.show('Failed to create product ❌', 'error');
        this.loading = false;
      }
    });
  }
}
