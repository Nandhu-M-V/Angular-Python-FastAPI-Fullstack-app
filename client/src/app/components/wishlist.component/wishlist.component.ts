import { Component, computed, inject } from '@angular/core';
import { WishlistService } from '../../services/wishlist.service';
import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-wishlist',
    templateUrl: './wishlist.component.html',
})
export class WishlistComponent {
    private wishlistService = inject(WishlistService);
    private productService = inject(ProductService);
    private router = inject(Router);

    cartService = inject(CartService);

    userId = 1;

    
    wishlistProducts = computed(() => {
        const wishlist = this.wishlistService.wishlist();
        const products = this.productService.products();

        return wishlist
            .filter((w) => w.user_id === this.userId)
            .map((w) =>
                products.find((p) => p.id === w.product_id)
            )
            .filter((p): p is NonNullable<typeof p> => !!p);
    });

    goToProduct(id: number) {
        this.router.navigate(['/product', id]);
    }

    goToProducts() {
        this.router.navigate(['/']);
    }

    // ✅ FIXED
    remove(productId: number) {
        this.wishlistService.toggle(this.userId, productId);
    }
}
