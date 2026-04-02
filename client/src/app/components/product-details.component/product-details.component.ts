import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../UI/services/toast.service';
import { CreateReview } from '../../models/reviews';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-details.component.html',
    standalone: true,
    imports: [ReactiveFormsModule],
})
export class ProductDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    productService = inject(ProductService);
    cartService = inject(CartService);
    wishlistService = inject(WishlistService);
    router = inject(Router);
    private fb = inject(FormBuilder);
    toast = inject(ToastService);

    selectedImage: string | null = null;

    productId = Number(this.route.snapshot.paramMap.get('id'));

    product = signal<any | null>(null);
    reviews = signal<CreateReview[]>([]);

    specEntries = () => {
        const p = this.product();
        return p?.specs ? Object.entries(p.specs) : [];
    };

    reviewForm = this.fb.nonNullable.group({
        comment: ['', [Validators.required, Validators.minLength(3)]],
        rating: [0, [Validators.min(1)]],
    });


    ngOnInit() {
        if (!this.productId) return;

        this.productService.getProduct(this.productId).subscribe({
            next: (data) => this.product.set(data),
            error: () => this.toast.show('Failed to load product', 'error'),
        });

      this.productService.reviewsByProduct(this.productId).subscribe({
            next: (data) => this.reviews.set(data),
            error: () => this.toast.show('Failed to load reviews', 'error'),
        });
    }

    submitReview() {
    if (this.reviewForm.invalid || !this.productId) return;

    const review = {
        comment: this.reviewForm.value.comment!,
        rating: this.reviewForm.value.rating!,
        product_id: Number(this.productId),
        user_id: 1
    };

    this.productService.addReview(review).subscribe({
        next: () => {
            this.toast.show('Review added successfully!', 'success');
            this.reviewForm.reset({ comment: '', rating: 0 });
        },
        error: () => {
            this.toast.show('Failed to add review', 'error');
        },
    });
}

    goBack() {
        this.router.navigate(['/']);
    }
}
