import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './services/cart.service';
import { WishlistService } from './services/wishlist.service';
import { RouterLinkActive } from '@angular/router';
import { ToastComponent } from './UI/components/toast.component/toast.component';
import { AuthService } from './services/auth.service';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    cartService = inject(CartService);
    wishlistService = inject(WishlistService);
    auth = inject(AuthService)
    router = inject(Router)

    menuOpen = false;

    

    toggleMenu(event: Event) {
        event.stopPropagation();
        this.menuOpen = !this.menuOpen;
    }

    ngOnInit() {
        document.addEventListener('click', () => {
            this.menuOpen = false;
        });
    }

    logout() {
    this.auth.logout();
    this.cartService.cart.set([]);
    this.wishlistService.refresh();
    this.router.navigate(['/login']);
  }

    @HostListener('document:click')
    closeMenu() {
        this.menuOpen = false;
    }
}
