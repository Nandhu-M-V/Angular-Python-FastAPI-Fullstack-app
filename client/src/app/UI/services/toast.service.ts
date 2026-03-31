import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private _toasts = signal<Toast[]>([]);
    toasts = this._toasts.asReadonly();

    show(message: string, type: ToastType = 'info', duration = 2000) {
        const id = Date.now();

        const toast: Toast = { id, message, type };

        this._toasts.update((t) => [...t, toast]);

        setTimeout(() => {
            this._toasts.update((t) => t.filter((x) => x.id !== id));
        }, duration);
    }
}
