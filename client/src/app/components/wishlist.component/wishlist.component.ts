import { Component, computed, inject } from '@angular/core';
import { WishlistService } from '../../services/wishlist.service';
import { ProductService } from '../../services/products.service';
// import { SlicePipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-wishlist',
    templateUrl: './wishlist.component.html',
})
export class WishlistComponent {
    private wishlistService = inject(WishlistService);
    private productService = inject(ProductService);
    router = inject(Router);

    cartService = inject(CartService);

    userId = 1; // mock user

    // combine wishlist + products
    wishlistProducts = computed(() => {
        const wishlist = this.wishlistService.wishlist();
        const products = this.productService.products();

        return wishlist
            .filter((w) => w.userId === this.userId)
            .map((w) => products.find((p) => p.id === w.productId))
            .filter((p) => !!p);
    });

    goToProduct(id: string) {
        this.router.navigate(['/product', id]);
    }

    goToProducts() {
        this.router.navigate(['/']);
    }

    remove(productId: string) {
        this.wishlistService.toggle(this.userId, productId);
    }
}
