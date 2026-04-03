import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { base_url } from '../../env.constants';
import { Cart } from '../models/cartItems';
import { ToastService } from '../UI/services/toast.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
    private http = inject(HttpClient);
    private toast = inject(ToastService);
    private auth = inject(AuthService);

    private api = `http://127.0.0.1:8000/cart`;

    cart = signal<Cart[]>([]);

    get userId() {
        return this.auth.user()?.id;
    }

    load() {
        if (!this.userId) return;

        this.http.get<Cart[]>(`${this.api}/${this.userId}`).subscribe({
            next: (data) => this.cart.set(data),
            error: () => this.toast.show('Failed to load cart', 'error'),
        });
    }

    count() {
        return this.cart().length;
    }

    add(product_id: number) {
        if (!this.userId) return;

        if (this.cart().length === 0) {
            this.load();
        }

        const existing = this.cart().find(
    (c) => c.product?.id === product_id
);

        console.log(this.cart())

        if (existing) {

            // if (this.cart)
            this.cart.update((items) =>
                items.map((item) =>
                    item.id === existing.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );

            this.http.patch(`${this.api}/${existing.id}`, {
                quantity: existing.quantity + 1,
            }).subscribe({
                next: () => this.toast.show('Cart updated', 'success'),
                error: () => {
                    this.load();
                    this.toast.show('Failed to update cart', 'error');
                },
            });

        } else {
            this.http.post<Cart>(this.api, {
                user_id: this.userId,
                product_id,
                quantity: 1,
            }).subscribe({
                next: (newItem) => {
                    this.cart.update((items) => [...items, newItem]);
                    this.toast.show('Added to cart 🛒', 'success');
                },
                error: () => this.toast.show('Failed to add item', 'error'),
            });
        }
    }

    updateQuantity(cartItemId: number, newQuantity: number) {
        const cartItem = this.cart().find((item) => item.id === cartItemId);
        if (!cartItem) return;

        if (newQuantity < 1) {
            this.remove(cartItemId);
            return;
        }

        this.cart.update((items) =>
            items.map((item) =>
                item.id === cartItemId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );

        this.http.patch(`${this.api}/${cartItemId}`, {
            quantity: newQuantity,
        }).subscribe({
            next: () => this.toast.show('Quantity updated', 'success'),
            error: () => {
                this.load();
                this.toast.show('Failed to update quantity', 'error');
            },
        });
    }

    remove(id: number) {
        const prev = this.cart();

        this.cart.update((items) => items.filter((item) => item.id !== id));

        this.http.delete(`${this.api}/${id}`).subscribe({
            next: () => this.toast.show('Item removed', 'info'),
            error: () => {
                this.cart.set(prev);
                this.toast.show('Failed to remove item', 'error');
            },
        });
    }
}
