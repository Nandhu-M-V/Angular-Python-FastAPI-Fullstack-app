import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../UI/services/toast.service';
import { Review } from '../../models/reviews';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-details.component.html',
    standalone: true,
    imports: [ReactiveFormsModule],
})
export class ProductDetailComponent {
    private route = inject(ActivatedRoute);
    productService = inject(ProductService);
    cartService = inject(CartService);
    wishlistService = inject(WishlistService);
    router = inject(Router);
    private fb = inject(FormBuilder);
    toast = inject(ToastService);

    selectedImage: string | null = null;

    productId = this.route.snapshot.paramMap.get('id');

    product = computed(() => this.productService.products().find((p) => p.id === this.productId));

    specEntries = computed(() => {
        const p = this.product();
        return p?.specs ? Object.entries(p.specs) : [];
    });

    reviews = computed(() =>
        this.productService.reviews().filter((r) => String(r.productId) === this.productId),
    );

    reviewForm = this.fb.nonNullable.group({
        comment: ['', [Validators.required, Validators.minLength(3)]],
        rating: [0, [Validators.min(1)]],
    });

    submitReview() {
        if (this.reviewForm.invalid || !this.productId) return;

        const review: Review = {
            comment: this.reviewForm.value.comment,
            rating: this.reviewForm.value.rating,
            productId: this.productId,
            userId: 1,
            date: new Date().toISOString(),
        };

        this.productService.addReview(review).subscribe({
            next: () => {
                this.toast.show('Review added successfully!', 'success');
                this.reviewForm.reset({ comment: '', rating: 0 }); // ✅ reset properly
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
