import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { CreateProduct, Product } from '../models/products';
import { CreateReview } from '../models/reviews';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);

    private api = `http://127.0.0.1:8000/products`;
    private reviewsApi = `http://127.0.0.1:8000/reviews`;

    private refreshTrigger = signal(0);


    products = toSignal(
        toObservable(this.refreshTrigger).pipe(
            switchMap(() => this.http.get<Product[]>(this.api))
        ),
        { initialValue: [] }
    );


    search = signal('');
    category = signal('');

    filtered = computed(() => {
        return this.products().filter(
            (p) =>
                p.title.toLowerCase().includes(this.search().toLowerCase()) &&
                (this.category() ? p.category === this.category() : true)
        );
    });

    getProduct(id: number) {
        return this.http.get<Product>(`${this.api}/${id}`);
    }


reviewsByProduct(productId: number) {
    return this.http.get<CreateReview[]>(
        `${this.reviewsApi}?product_id=${productId}`
    );
}

    addReview(review: CreateReview) {
        return this.http.post<CreateReview>(this.reviewsApi, review).pipe(
            tap(() => this.refresh())
        );
    }


    addProduct(product: CreateProduct) {
        return this.http.post<Product>(this.api, product).pipe(
            tap(() => this.refresh())
        );
    }


    refresh() {
        this.refreshTrigger.update((v) => v + 1);
    }
}
