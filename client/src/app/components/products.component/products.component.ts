import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../UI/services/toast.service';

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
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  user = this.authService.user;

  constructor() {
    this.cartService.load();
  }

  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  toggleWishlist(productId: number) {
    if (!this.user()) {
      this.toast.show('Login to use wishlist', 'error');
      return;
    }

    const exists = this.wishlistService.isInWishlist(productId);
    this.wishlistService.toggle(productId);

    this.toast.show(
      exists ? 'Removed from wishlist' : 'Added to wishlist ❤️',
      'success'
    );
  }

  addToCart(productId: number) {
    if (!this.user()) {
      this.toast.show('Login to add to cart', 'error');
      return;
    }

    this.cartService.add(productId);
    this.toast.show('Added to cart 🛒', 'success');
  }

  goToCreate() {
    if (!this.authService.isAdmin()) {
      this.toast.show('Admin only', 'error');
      return;
    }

    this.router.navigate(['/create-product']);
  }
}
