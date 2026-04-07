import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cart } from '../models/cartItems';
import { ToastService } from '../UI/services/toast.service';
import { AuthService } from './auth.service';
import { environment } from '../../env.constants';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private auth = inject(AuthService);

  private api = `${environment.apiUrl}cart`;

  cart = signal<Cart[]>([]);

load() {
  const user = this.auth.user();

  if (!user) {
    this.cart.set([]);
    return;
  }

  this.http.get<Cart[]>(this.api).subscribe({
    next: (data) => this.cart.set(data),
    error: () => this.toast.show('Failed to load cart', 'error'),
  });
}
  constructor() {
    effect(() => {
      const user = this.auth.user();

      if (user) {
        this.load();
      } else {
        this.cart.set([]);
      }
    });
  }

  count() {
    return this.cart().length;
  }

  add(product_id: number, quantity: number = 1) {
    const user = this.auth.user();

    if (!user) {
      this.toast.show('Failed to add to Cart Login required', 'error');
      return;
    }

    const existing = this.cart().find((c) => c.product?.id === product_id);

    if (existing) {
      this.updateQuantity(existing.id, existing.quantity + quantity);
    } else {
      this.http.post<Cart>(this.api, { product_id, quantity }).subscribe({
        next: (newItem) => {
          this.cart.update((items) => [...items, newItem]);
          this.toast.show('Added to cart 🛒', 'success');
        },
        error: () => this.toast.show('Failed to add item', 'error'),
      });
    }
  }

  updateQuantity(cartItemId: number, newQuantity: number) {
    if (newQuantity < 1) {
      this.remove(cartItemId);
      return;
    }

    this.cart.update((items) =>
      items.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );

    this.http.patch(`${this.api}/${cartItemId}`, { quantity: newQuantity }).subscribe({
      next: () => this.toast.show('Quantity updated', 'success'),
      error: () => {
        this.load();
        this.toast.show('Failed to update quantity', 'error');
      },
    });
  }

  remove(cartItemId: number) {
    const prev = this.cart();

    this.cart.update((items) =>
      items.filter((item) => item.id !== cartItemId)
    );

    this.http.delete(`${this.api}/${cartItemId}`).subscribe({
      next: () => this.toast.show('Item removed', 'info'),
      error: () => {
        this.cart.set(prev);
        this.toast.show('Failed to remove item', 'error');
      },
    });
  }

  isInCart(product_id: number): boolean {
    return !!this.cart().find((c) => c.product?.id === product_id);
  }
}
