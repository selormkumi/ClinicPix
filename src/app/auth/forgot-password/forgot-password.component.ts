import { Component } from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	Validators,
	ReactiveFormsModule,
} from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { environment } from "../../../environments/environment";

@Component({
	selector: "app-forgot-password",
	standalone: true,
	templateUrl: "./forgot-password.component.html",
	styleUrls: ["./forgot-password.component.scss"],
	imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class ForgotPasswordComponent {
	form: FormGroup;
	submitted = false;
	loading = false;
	message: string = "";
	error: string = "";

	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		private router: Router
	) {
		this.form = this.fb.group({
			email: ["", [Validators.required, Validators.email]],
		});
	}

	submit() {
		if (this.form.invalid) return;

		this.loading = true;
		this.http
			.post(
				`${environment.apiUrl}/auth/request-password-reset`,
				this.form.value
			)
			.subscribe({
				next: () => {
					this.message =
						"✅ Password reset link has been sent. Check your email.";
					this.error = "";
					this.submitted = true;
				},
				error: (err) => {
					console.error(err);
					this.error = err.error?.message || "❌ Something went wrong.";
				},
				complete: () => (this.loading = false),
			});
	}
}
