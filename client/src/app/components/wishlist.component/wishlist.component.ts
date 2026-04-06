import { Component, computed, inject } from '@angular/core';
import { WishlistService } from '../../services/wishlist.service';
import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './wishlist.component.html',
})
export class WishlistComponent {

    private wishlistService = inject(WishlistService);
    private productService = inject(ProductService);
    private router = inject(Router);

    cartService = inject(CartService);


    wishlistProducts = computed(() => {
        const wishlist = this.wishlistService.wishlist();
        const products = this.productService.products();

        return wishlist
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

    remove(productId: number) {
        this.wishlistService.toggle(productId);
    }
}
