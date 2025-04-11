import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // ✅ Required for routing & forms
})
export class ForgotPasswordComponent {
  form: FormGroup;
  submitted = false;
  loading = false;
  message: string = '';
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router // ✅ Keep router injected in case you want to use it
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.http
      .post('http://localhost:5001/api/auth/request-password-reset', this.form.value)
      .subscribe({
        next: () => {
          this.message = '✅ Password reset link has been sent.';
          this.error = '';
          this.submitted = true;
        },
        error: (err) => {
          console.error(err);
          this.error = err.error?.message || '❌ Something went wrong.';
        },
        complete: () => (this.loading = false),
      });
  }
}