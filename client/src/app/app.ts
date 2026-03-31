import { Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './services/cart.service';
import { WishlistService } from './services/wishlist.service';
import { RouterLinkActive } from '@angular/router';
import { ToastComponent } from './UI/components/toast.component/toast.component';
@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App {
    cartService = inject(CartService);
    wishlistService = inject(WishlistService);

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

    @HostListener('document:click')
    closeMenu() {
        this.menuOpen = false;
    }
    //   protected readonly title = signal('angular-e-c-app');
}
