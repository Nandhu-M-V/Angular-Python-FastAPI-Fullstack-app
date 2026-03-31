import { Component, inject } from '@angular/core';
import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
// import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
    selector: 'app-products',
    standalone: true,
    templateUrl: './products.component.html',
    imports: [],
})
export class ProductsComponent {
    productService = inject(ProductService);
    cartService = inject(CartService);
    wishlistService = inject(WishlistService);
    authService = inject(AuthService);
    router = inject(Router);

    // routing
    goToProduct(id: string) {
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

        this.productService.addProduct(product).subscribe(() => {
            this.productService.refresh();
        });
    }

    toggleWishlist(productId: string) {
        const user = this.authService.user();
        if (!user) return;

        this.wishlistService.toggle(user.id, productId);
    }
}
