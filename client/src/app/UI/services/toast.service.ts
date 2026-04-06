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

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const id = Date.now();

    const exists = this._toasts().some(t => t.message === message);
    if (exists) return;

    const toast: Toast = { id, message, type };

    this._toasts.update(t => [...t, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  remove(id: number) {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }

  clear() {
    this._toasts.set([]);
  }
}
