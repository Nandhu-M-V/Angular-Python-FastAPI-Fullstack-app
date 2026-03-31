import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
            import('./components/products.component/products.component').then(
                (m) => m.ProductsComponent,
            ),
    },
    {
        path: 'cart',
        loadComponent: () =>
            import('./components/cart.component/cart.component').then((m) => m.CartComponent),
    },
    {
        path: 'product/:id',
        loadComponent: () =>
            import('./components/product-details.component/product-details.component').then(
                (m) => m.ProductDetailComponent,
            ),
    },
    {
        path: 'wishlist',
        loadComponent: () =>
            import('./components//wishlist.component/wishlist.component').then(
                (m) => m.WishlistComponent,
            ),
    },
    {
        path: '**',
        redirectTo: '',
    },
];
