import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
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


    private userId = computed(() => this.auth.user()?.id);

    wishlist = toSignal(
        toObservable(this.refreshTrigger).pipe(
            switchMap(() =>
                this.http.get<WishlistItem[]>(`${this.api}/${this.userId()}`)
            )
        ),
        { initialValue: [] as WishlistItem[] }
    );

    count() {
        return this.wishlist().length;
    }

    refresh() {
        this.refreshTrigger.update((v) => v + 1);
    }

    toggle(user_id: number, product_id: number) {
        const existing = this.wishlist().find(
            (w) => w.user_id === user_id && w.product_id === product_id
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
            this.http
                .post<WishlistItem>(this.api, {
                    user_id: user_id,
                    product_id: product_id
                })
                .subscribe({
                    next: () => {
                        this.refresh();
                        this.toast.show('Added to wishlist ❤️', 'success');
                    },
                    error: () =>
                        this.toast.show('Failed to add to wishlist', 'error'),
                });
        }
    }

    // ✅ FIXED map
    map = computed(() => {
        const m = new Set<string>();
        this.wishlist().forEach((w) => {
            m.add(`${w.user_id}-${w.product_id}`);
        });
        return m;
    });

    isInWishlist(user_id: number, product_id: number): boolean {
        return this.map().has(`${user_id}-${product_id}`);
    }
}
