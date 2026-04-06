import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../UI/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './userlogin.component.html'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = false;

  isLoginMode = signal(true);
  showPassword = signal(false);

  form = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  toggleMode() {
    this.isLoginMode.update(v => !v);

    
    const nameControl = this.form.get('name');

    if (this.isLoginMode()) {
      nameControl?.clearValidators();
    } else {
      nameControl?.setValidators([Validators.required]);
    }

    nameControl?.updateValueAndValidity();

    this.form.reset();
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;

    const { name, email, password } = this.form.value;

    if (this.isLoginMode()) {
      this.auth.login(email!, password!)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (res) => {
            localStorage.setItem('token', res.access_token);
            this.auth.decodeToken(res.access_token);

            this.toast.success('Welcome back 👋');
            this.router.navigate(['/']);
          },
          error: () => {
            this.toast.error('Invalid email or password');
          }
        });

    } else {
      this.auth.register(name!, email!, password!)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (res: any) => {

            if (res?.access_token) {
              localStorage.setItem('token', res.access_token);
              this.auth.decodeToken(res.access_token);
            }

            this.toast.success('Account created 🎉');
            this.router.navigate(['/']);
          },
          error: () => {
            this.toast.error('Registration failed');
          }
        });
    }
  }
}
