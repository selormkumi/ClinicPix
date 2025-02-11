import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

import {
	FormBuilder,
	FormGroup,
	Validators,
	ReactiveFormsModule,
} from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-login",
	standalone: true,
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.scss"],
	imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class LoginComponent {
	loginForm: FormGroup;

	constructor(private router: Router, private fb: FormBuilder) {
		this.loginForm = this.fb.group({
			email: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required, Validators.minLength(6)]],
		});
	}

	isFieldInvalid(field: string): boolean {
		const control = this.loginForm.get(field);
		return control
			? control.invalid && (control.dirty || control.touched)
			: false;
	}

	submitForm() {
		if (this.loginForm.valid) {
			const formData = this.loginForm.value;

			let storedUserData = localStorage.getItem("userData");
			let users = storedUserData ? JSON.parse(storedUserData) : [];

			// Find user based solely on email and password
			const matchedUser = users.find(
				(user: any) =>
					user.email.trim().toLowerCase() ===
						formData.email.trim().toLowerCase() &&
					user.password.trim() === formData.password.trim()
			);

			if (matchedUser) {
				// Get the user's role in lowercase
				const userRole = matchedUser.role.trim().toLowerCase();

				// Check if the role is either 'patient' or 'provider'
				if (userRole === "patient" || userRole === "provider") {
					// Store authenticated user in localStorage
					localStorage.setItem(
						"user",
						JSON.stringify({
							email: matchedUser.email,
							role: matchedUser.role,
							userId: matchedUser.id || null,
						})
					);

					// Role-based redirection mapping for patient and provider
					const roleRoutes: { [key: string]: string } = {
						patient: "/patient/dashboard",
						provider: "/provider/dashboard",
					};

					const redirectRoute = roleRoutes[userRole];

					if (redirectRoute) {
						this.router.navigate([redirectRoute]);
					} else {
						alert("Your role does not have an assigned dashboard.");
					}
				} else {
					// The user's role is neither patient nor provider
					alert("Your role is not authorized for this login.");
				}
			} else {
				alert("Invalid credentials. Please try again.");
			}
		} else {
			// Mark all controls as touched to show validation errors
			Object.values(this.loginForm.controls).forEach((control) =>
				control.markAsTouched()
			);
			console.log("⚠️ Please fill in all fields correctly.");
		}
	}

	// Eye Icons
	showPassword: boolean = false;
	eyeOpenIcon = "https://cdn-icons-png.flaticon.com/512/159/159604.png"; // Open eye
	eyeClosedIcon = "https://cdn-icons-png.flaticon.com/512/565/565655.png"; // Closed eye
	eyeIcon = this.eyeClosedIcon; // Default to closed eye
	togglePasswordVisibility() {
		this.showPassword = !this.showPassword;
		this.eyeIcon = this.showPassword ? this.eyeOpenIcon : this.eyeClosedIcon;
	}
}
