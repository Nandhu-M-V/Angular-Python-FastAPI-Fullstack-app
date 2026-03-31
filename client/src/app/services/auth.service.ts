import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
    user = signal<{ id: number; name: string } | null>(null);

    constructor() {
        this.user.set({ id: 1, name: 'Nandhu' });
    }

    login() {
        this.user.set({ id: 1, name: 'Nandhu' });
    }

    logout() {
        this.user.set(null);
    }

    

}
