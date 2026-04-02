import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-products',
    standalone: true,
    templateUrl: './products.component.html',
    imports: [CommonModule], 
})
export class ProductsComponent {
    productService = inject(ProductService);
    cartService = inject(CartService);
    wishlistService = inject(WishlistService);
    authService = inject(AuthService);
    router = inject(Router);

    user = this.authService.user;

    goToProduct(id: number) {
        this.router.navigate(['/product', id]);
    }

    add(title: string, price: string) {
        const product = {
            title,
            price: Number(price),
            category: 'electronics',
            brand: 'Generic',
            rating: 0,
            stock: 10,
            images: ['https://via.placeholder.com/200'],
            description: '',
            specs: {},
        };

        this.productService.addProduct(product).subscribe();
    }

    toggleWishlist(productId: number) {
        const user = this.user();
        if (!user) return;

        this.wishlistService.toggle(user.id, productId);
    }
}
