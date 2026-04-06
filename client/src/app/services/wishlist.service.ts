import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { WishlistItem } from '../models/wishlistItem';
import { ToastService } from '../UI/services/toast.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private auth = inject(AuthService);

  private api = `http://127.0.0.1:8000/wishlist`;

  private refreshTrigger = signal(0);

wishlist = toSignal(
  toObservable(this.refreshTrigger).pipe(
    switchMap(() => {
      const user = this.auth.user();

      if (!user) return of([]);

      return this.http.get<WishlistItem[]>(this.api);
    })
  ),
  { initialValue: [] as WishlistItem[] }
);

  constructor() {
    effect(() => {
      const user = this.auth.user();

      if (user) {
        this.refresh();
      }
    });
  }

  count() {
    return this.wishlist().length;
  }

  refresh() {
    this.refreshTrigger.update((v) => v + 1);
  }

  toggle(product_id: number) {
    const user = this.auth.user();

    if (!user) {
      this.toast.show('Login is required to Wishlist product', 'error');
      return;
    }

    const existing = this.wishlist().find(
      (w) => w.product_id === product_id
    );

    if (existing) {
      this.http.delete(`${this.api}/${existing.id}`).subscribe({
        next: () => {
          this.refresh();
          this.toast.show('Removed from wishlist', 'info');
        },
        error: () =>
          this.toast.show('Failed to remove from wishlist', 'error'),
      });
    } else {
      this.http.post<WishlistItem>(this.api, { product_id }).subscribe({
        next: () => {
          this.refresh();
          this.toast.show('Added to wishlist ❤️', 'success');
        },
        error: () =>
          this.toast.show('Failed to add to wishlist', 'error'),
      });
    }
  }

  map = computed(() => {
    const m = new Set<number>();
    this.wishlist().forEach((w) => m.add(w.product_id));
    return m;
  });

  isInWishlist(product_id: number): boolean {
    return this.map().has(product_id);
  }
}
