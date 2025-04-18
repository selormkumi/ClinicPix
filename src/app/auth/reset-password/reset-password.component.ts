import { Component, OnInit } from "@angular/core";
import {
	FormBuilder,
	FormGroup,
	Validators,
	ReactiveFormsModule,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { environment } from "../../../environments/environment";

@Component({
	selector: "app-reset-password",
	standalone: true,
	templateUrl: "./reset-password.component.html",
	styleUrls: ["./reset-password.component.scss"],
	imports: [CommonModule, ReactiveFormsModule],
})
export class ResetPasswordComponent implements OnInit {
	form: FormGroup;
	token = "";
	email = "";
	loading = false;
	message = "";
	error = "";

	// 👁️ Password visibility state and icons
	showPassword = false;
	eyeOpenIcon = "https://cdn-icons-png.flaticon.com/512/159/159604.png";
	eyeClosedIcon = "https://cdn-icons-png.flaticon.com/512/565/565655.png";

	get eyeIcon() {
		return this.showPassword ? this.eyeOpenIcon : this.eyeClosedIcon;
	}

	togglePasswordVisibility() {
		this.showPassword = !this.showPassword;
	}

	constructor(
		private route: ActivatedRoute,
		private fb: FormBuilder,
		private http: HttpClient,
		private router: Router
	) {
		this.form = this.fb.group({
			newPassword: [
				"",
				[
					Validators.required,
					Validators.minLength(8),
					Validators.pattern(
						/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/
					),
				],
			],
		});
	}

	ngOnInit(): void {
		this.token = this.route.snapshot.queryParamMap.get("token") || "";
		this.email = this.route.snapshot.queryParamMap.get("email") || "";
		if (!this.token || !this.email) {
			this.error = "Invalid password reset link.";
		}
	}

	submit() {
		if (this.form.invalid || !this.token || !this.email) return;

		this.loading = true;

		this.http
			.post(`${environment.apiUrl}/auth/reset-password`, {
				email: this.email,
				token: this.token,
				newPassword: this.form.value.newPassword,
			})
			.subscribe({
				next: () => {
					this.message = "✅ Your password has been reset. You may now log in.";
					this.loading = false;
					setTimeout(() => {
						window.location.href = "https://clinicpix.onrender.com/auth/login";
					}, 2500);
				},
				error: (err) => {
					this.error = err.error?.message || "Reset failed.";
					this.loading = false;
				},
			});
	}
}