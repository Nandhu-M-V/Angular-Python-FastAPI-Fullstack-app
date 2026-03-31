import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { CreateProduct, Product } from '../models/products';
import { base_url } from '../../env.constants';
import { Review } from '../models/reviews';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private api = `${base_url}products`;

    private refreshTrigger = signal(0);

    products = toSignal(
        toObservable(this.refreshTrigger).pipe(switchMap(() => this.http.get<Product[]>(this.api))),
        { initialValue: [] as Product[] },
    );



    // Filters
    search = signal('');
    category = signal('');

    filtered = computed(() => {
        return this.products().filter(
            (p) =>
                p.title.toLowerCase().includes(this.search().toLowerCase()) &&
                (this.category() ? p.category === this.category() : true),
        );
    });

    private reviewsApi = `${base_url}reviews`;

    reviews = toSignal(
        toObservable(this.refreshTrigger).pipe(
            switchMap(() => this.http.get<Review[]>(this.reviewsApi)),
        ),
        { initialValue: [] },
    );

    addProduct(product: CreateProduct) {
        return this.http.post(this.api, product);
    }

    addReview(review: Review) {
        return this.http.post(this.reviewsApi, review).pipe(tap(() => this.refresh()));
    }

    refresh() {
        this.refreshTrigger.update((v) => v + 1);
    }
}
