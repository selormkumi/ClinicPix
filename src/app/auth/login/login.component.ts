import { Component } from "@angular/core";
import { Router } from "@angular/router";
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
	imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent {
	loginForm: FormGroup;

	constructor(private router: Router, private fb: FormBuilder) {
		this.loginForm = this.fb.group({
			role: ["", Validators.required],
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

			// Find user
			const matchedUser = users.find(
				(user: any) =>
					user.email.trim().toLowerCase() ===
						formData.email.trim().toLowerCase() &&
					user.password.trim() === formData.password.trim() &&
					user.role.trim().toLowerCase() === formData.role.trim().toLowerCase()
			);

			if (matchedUser) {
				alert("Login successful!");
				if (matchedUser.role === "patient") {
					this.router.navigate(["/patient/home"]);
				} else if (matchedUser.role === "provider") {
					this.router.navigate(["/provider/home"]);
				}
			} else {
				alert("Invalid credentials. Please try again.");
			}
		} else {
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
