import { Routes } from '@angular/router';
import { adminGuard } from './services/adminguard';

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
        path: 'login',
        loadComponent: () => import('./components/userlogin.component/userlogin.component')
        .then(m => m.LoginComponent)
    },
    {
  path: 'create-product',
  loadComponent: () =>
    import('./components/addproduct.component/addproduct.component')
      .then(m => m.CreateProductComponent),
  canActivate: [adminGuard]
},
    {
        path: '**',
        redirectTo: '',
    },
];
