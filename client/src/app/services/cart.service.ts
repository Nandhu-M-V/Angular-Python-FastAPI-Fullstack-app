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

    private auth = inject(AuthService)

    user = this.auth.user()?.id


    private api = `http://127.0.0.1:8000/cart`;

    cart = signal<Cart[]>([]);

    load() {
        this.http.get<Cart[]>(`${this.api}/${this.user}`).subscribe({
            next: (data) => this.cart.set(data),
            error: () => this.toast.show('Failed to load cart', 'error'),
        });
    }

    count() {
        return this.cart().length;
    }

    add(user_id: number, product_id: string) {
        const existing = this.cart().find((c) => c.product_Id === product_id && c.user_Id === user_id);

        if (existing) {
            this.http
                .patch(`${this.api}/${existing.id}`, {
                    quantity: existing.quantity + 1,
                })
                .subscribe({
                    next: () => {
                        this.load();
                        this.toast.show('Cart updated', 'success');
                    },
                    error: () => this.toast.show('Failed to update cart', 'error'),
                });
        } else {
            this.http
                .post(this.api, {
                    user_id,
                    product_id,
                    quantity: 1,
                })
                .subscribe({
                    next: () => {
                        this.load();
                        this.toast.show('Added to cart 🛒', 'success');
                    },
                    error: () => this.toast.show('Failed to add item', 'error'),
                });
        }
    }

    updateQuantity(cartItemId: string, newQuantity: number) {
        const cartItem = this.cart().find((item) => item.id === cartItemId);

        if (!cartItem) return;

        if (newQuantity < 1) {
            this.remove(cartItemId);
            return;
        }

        this.http
            .patch(`${this.api}/${cartItemId}`, {
                quantity: newQuantity,
            })
            .subscribe({
                next: () => {
                    this.load();
                    this.toast.show('Quantity updated', 'success');
                },
                error: () => this.toast.show('Failed to update quantity', 'error'),
            });
    }

    remove(id: string) {
        this.http.delete(`${this.api}/${id}`).subscribe({
            next: () => {
                this.load();
                this.toast.show('Item removed', 'info');
            },
            error: () => this.toast.show('Failed to remove item', 'error'),
        });
    }
}
