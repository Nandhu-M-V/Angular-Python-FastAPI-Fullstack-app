import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/products.service';
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
    productService = inject(ProductService);
    router = inject(Router);

    // load cart once
    loadEffect = effect(() => {
        this.cartService.load();
    });

    goToProducts() {
        this.router.navigate(['/']);
    }

    cartItems = computed(() => {
        const cart = this.cartService.cart();
        const products = this.productService.products();

        return cart.map((c) => ({
            ...c,
            product: products.find((p) => p.id === c.productId),
        }));
    });

    total = computed(() => {
        return this.cartItems().reduce((sum, item) => {
            return sum + (item.product?.price || 0) * item.quantity;
        }, 0);
    });

    updateQuantity(cartItemId: string, newQuantity: number) {
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
