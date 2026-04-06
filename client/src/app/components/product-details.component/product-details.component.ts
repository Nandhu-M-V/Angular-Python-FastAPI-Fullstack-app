import { Component, inject, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../UI/services/toast.service';
import { CreateReview } from '../../models/reviews';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-details.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  router = inject(Router);
  toast = inject(ToastService);
  auth = inject(AuthService);

  selectedImage = signal<string | null>(null);

  productService = inject(ProductService);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);

  productId = Number(this.route.snapshot.paramMap.get('id'));

  product = signal<any | null>(null);
  reviews = signal<CreateReview[]>([]);
  error = signal<string | null>(null);

  reviewForm = this.fb.nonNullable.group({
    comment: ['', [Validators.required, Validators.minLength(3)]],
    rating: [0, [Validators.min(1)]],
  });

  specEntries = () => {
    const p = this.product();
    return p?.specs ? Object.entries(p.specs) : [];
  };

  constructor() {
    if (!this.productId) {
      this.error.set('Invalid product ID');
      return;
    }

    const productSignal = toSignal(
      this.productService.getProduct(this.productId),
      { initialValue: null }
    );
    const reviewsSignal = toSignal(
      this.productService.reviewsByProduct(this.productId),
      { initialValue: [] }
    );

    effect(() => {
      const prod = productSignal();
      if (prod) this.product.set(prod);
    });

    effect(() => {
      const revs = reviewsSignal();
      if (revs) this.reviews.set(revs);
    });
  }

  isAdmin() {
  return this.auth.isAdmin();
}

  deleteProduct() {
  if (!this.productId) return;

  const confirmDelete = confirm('Are you sure you want to delete this product?');
  if (!confirmDelete) return;

  this.productService.deleteProduct(this.productId).subscribe({
    next: () => {
      this.toast.success('Product deleted 🗑️');
      this.router.navigate(['/']);
    },
    error: () => {
      this.toast.error('Failed to delete product');
    }
  });
}

  submitReview() {
    if (this.reviewForm.invalid || !this.productId) return;

    const review = {
      comment: this.reviewForm.value.comment!,
      rating: this.reviewForm.value.rating!,
      product_id: Number(this.productId),
      user_id: 1,
    };

    this.productService.addReview(review).subscribe({
      next: () => {
        this.toast.show('Review added successfully!', 'success');
        this.reviewForm.reset({ comment: '', rating: 0 });
        this.productService.reviewsByProduct(this.productId).subscribe({
          next: (data) => this.reviews.set(data),
        });
      },
      error: () => this.toast.show('Failed to add review', 'error'),
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
