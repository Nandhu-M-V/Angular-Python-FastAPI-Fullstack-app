import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateProduct, Product, ProductResponse } from '../models/products';
import { CreateReview,Review } from '../models/reviews';
import { debounceTime } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../env.constants';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);

    private api = `${environment.apiUrl}products`;
    private reviewsApi = `${environment.apiUrl}reviews`;


    getImageUrl(path: string): string {
    if (!path) return 'assets/images/default.jpg';

    if (path.startsWith('uploads/')) {
        return environment.apiUrl + path;
    }

    return path;
    }

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


// services/products.service.ts

createProduct(data: any) {
  return this.http.post(`${this.api}`, data);
}


    deleteProduct(id: number) {
  return this.http.delete(`${this.api}/${id}`);
}

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
        return this.http.get<Review[]>(
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
