import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateProduct, Product, ProductResponse } from '../models/products';
import { CreateReview } from '../models/reviews';
import { debounceTime } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);

    private api = `http://127.0.0.1:8000/products`;
    private reviewsApi = `http://127.0.0.1:8000/reviews`;



    // filters
    search = signal('');
    category = signal('');

    // pagination
    page = signal(1);
    limit = 12;

    //  state
    products = signal<Product[]>([]);
    total = signal(0);
    loading = signal(false);

    constructor() {

        effect(() => {
            this.load();
        });
    }

    private searchTrigger = toSignal(
    toObservable(this.search).pipe(debounceTime(400)),
    { initialValue: '' }
);


    load() {
        const skip = (this.page() - 1) * this.limit;

        this.loading.set(true);

        this.http
            .get<ProductResponse>(this.api, {
                params: {
                    search: this.searchTrigger(),
                    category: this.category(),
                    skip,
                    limit: this.limit,
                },
            })
            .subscribe({
                next: (res) => {
                    this.products.set(res.data);
                    this.total.set(res.total);
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                },
            });
    }


    nextPage() {
        if (this.page() * this.limit < this.total()) {
            this.page.update((p) => p + 1);
        }
    }

    prevPage() {
        if (this.page() > 1) {
            this.page.update((p) => p - 1);
        }
    }

    setPage(p: number) {
        this.page.set(p);
    }


    getProduct(id: number) {
        return this.http.get<Product>(`${this.api}/${id}`);
    }


    reviewsByProduct(productId: number) {
        return this.http.get<CreateReview[]>(
            `${this.reviewsApi}?product_id=${productId}`
        );
    }

    addReview(review: CreateReview) {
        return this.http.post<CreateReview>(this.reviewsApi, review);
    }


    addProduct(product: CreateProduct) {
        return this.http.post<Product>(this.api, product);
    }
}
