import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  cartService = inject(CartService);
  router = inject(Router);

  loadEffect = effect(() => {
    this.cartService.load();
  });

  goToProducts() {
    this.router.navigate(['/']);
  }

  cartItems = computed(() => this.cartService.cart());

  total = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);
  });

  updateQuantity(cartItemId: number, newQuantity: number) {
    const cartItem = this.cartItems().find((item) => item.id === cartItemId);
    if (!cartItem) return;

    if (newQuantity < 1) {
      this.cartService.remove(cartItemId);
      return;
    }

    const product = cartItem.product;
    if (product && newQuantity > product.stock) {
      alert(`Only ${product.stock} items available in stock`);
      return;
    }

    this.cartService.updateQuantity(cartItemId, newQuantity);
  }
}
