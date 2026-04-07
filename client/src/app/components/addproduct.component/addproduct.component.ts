import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { ProductService } from '../../services/products.service';
import { Router } from '@angular/router';
import { ToastService } from '../../UI/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../env.constants';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './addproduct.component.html'
})
export class CreateProductComponent {
  private fb = inject(NonNullableFormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private http = inject(HttpClient);

  loading = false;

  imageFile: File | null = null;
  imagePreview: string | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    price: [0, Validators.required],
    brand: [''],
    stock: [0],
    description: [''],
    images: [''], // will be updated after upload
    specs: [''],
    category_id: [1]
  });

  // File select handler
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  // Submit the form
  submit() {
    if (this.form.invalid || !this.imageFile) {
      this.toast.show('Please fill all required fields and select an image ❌', 'error');
      return;
    }

    this.loading = true;

    const raw = this.form.getRawValue();

    // Parse specs JSON
    let specs: Record<string, any> = {};
    try {
      specs = raw.specs ? JSON.parse(raw.specs) : {};
    } catch {
      this.toast.show('Invalid specs JSON ❌', 'error');
      this.loading = false;
      return;
    }

    // Prepare FormData for FastAPI
    const formData = new FormData();
    formData.append('title', raw.title);
    formData.append('price', raw.price.toString());
    formData.append('brand', raw.brand);
    formData.append('stock', raw.stock.toString());
    formData.append('description', raw.description);
    formData.append('category_id', raw.category_id.toString());
    formData.append('file', this.imageFile!);

    // Upload image to FastAPI
    this.http.post<{ uploaded_file: string }>(`${environment.apiUrl}upload/`, formData)
      .subscribe({
        next: (res) => {
          // Use uploaded file path as the product's images
          const payload = {
            ...raw,
            images: [res.uploaded_file],
            specs
          };

          // Create product in your backend
          this.productService.createProduct(payload).subscribe({
            next: () => {
              this.toast.show('Product created 🚀', 'success');
              this.form.reset({
                title: 'Test',
                price: 10,
                brand: 'new',
                stock: 5,
                description: 'hehehehe',
                images: '',
                specs: '',
                category_id: 1
              });
              this.imageFile = null;
              this.imagePreview = null;
              this.loading = false;
              this.router.navigate(['/']);
            },
            error: () => {
              this.toast.show('Failed to create product ❌', 'error');
              this.loading = false;
            }
          });
        },
        error: (err) => {
          console.error(err);
          this.toast.show('Image upload failed ❌', 'error');
          this.loading = false;
        }
      });
  }
}
