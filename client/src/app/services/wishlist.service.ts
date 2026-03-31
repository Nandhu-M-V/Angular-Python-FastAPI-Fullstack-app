import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { WishlistItem } from '../models/wishlistItem';
import { base_url } from '../../env.constants';
import { ToastService } from '../UI/services/toast.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
    private http = inject(HttpClient);
    private toast = inject(ToastService);

    private api = `${base_url}wishlist`;

    private refreshTrigger = signal(0);

    wishlist = toSignal(
        toObservable(this.refreshTrigger).pipe(
            switchMap(() => this.http.get<WishlistItem[]>(this.api)),
        ),
        { initialValue: [] as WishlistItem[] },
    );

    count() {
        return this.wishlist().length;
    }

    refresh() {
        this.refreshTrigger.update((v) => v + 1);
    }

    toggle(userId: number, productId: string) {
        const existing = this.wishlist().find(
            (w) => w.userId === userId && w.productId === productId,
        );

        if (existing) {
            this.http.delete(`${this.api}/${existing.id}`).subscribe({
                next: () => {
                    this.refresh();
                    this.toast.show('Removed from wishlist', 'info');
                },
                error: () => this.toast.show('Failed to remove from wishlist', 'error'),
            });
        } else {
            this.http.post<WishlistItem>(this.api, { userId, productId }).subscribe({
                next: () => {
                    this.refresh();
                    this.toast.show('Added to wishlist ❤️', 'success');
                },
                error: () => this.toast.show('Failed to add to wishlist', 'error'),
            });
        }
    }

    map = computed(() => {
        const m = new Set<string>();
        this.wishlist().forEach((w) => {
            m.add(`${w.userId}-${w.productId}`);
        });
        return m;
    });

    isInWishlist(userId: number, productId: string): boolean {
        return this.map().has(`${userId}-${productId}`);
    }
}
