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
	showPassword: boolean = false;

	// Eye Icons
	eyeOpenIcon = "https://cdn-icons-png.flaticon.com/512/159/159604.png"; // Open eye
	eyeClosedIcon = "https://cdn-icons-png.flaticon.com/512/565/565655.png"; // Closed eye
	eyeIcon = this.eyeClosedIcon; // Default to closed eye

	constructor(private router: Router, private fb: FormBuilder) {
		this.loginForm = this.fb.group({
			role: ["", Validators.required], // Role selection
			email: ["", [Validators.required, Validators.email]], // Email validation
			password: ["", [Validators.required, Validators.minLength(6)]], // Password validation
		});
	}

	isFieldInvalid(field: string): boolean {
		const control = this.loginForm.get(field);
		return control
			? control.invalid && (control.dirty || control.touched)
			: false;
	}

	togglePasswordVisibility() {
		this.showPassword = !this.showPassword;
		this.eyeIcon = this.showPassword ? this.eyeOpenIcon : this.eyeClosedIcon;
	}

	submitForm() {
		if (this.loginForm.valid) {
			const formData = this.loginForm.value;
			console.log("Entered Login Data:", formData);

			// Retrieve user data from localStorage
			const storedUserData = localStorage.getItem("userData");

			if (storedUserData) {
				const users = JSON.parse(storedUserData);
				console.log("Stored Users in localStorage:", users); // Debugging step

				// Check if user exists
				const matchedUser = users.find(
					(user: any) =>
						user.email.trim().toLowerCase() ===
							formData.email.trim().toLowerCase() &&
						user.password.trim() === formData.password.trim() &&
						user.role.trim().toLowerCase() ===
							formData.role.trim().toLowerCase()
				);

				if (matchedUser) {
					alert("Login successful!");

					// Redirect based on role
					if (matchedUser.role === "patient") {
						this.router.navigate(["/patient/home"]);
					} else if (matchedUser.role === "provider") {
						this.router.navigate(["/provider/home"]);
					}
				} else {
					alert("Invalid credentials. Please try again.");
					console.log("Login failed: No matching user found.");
				}
			} else {
				alert("No registered users found. Please sign up first.");
			}
		} else {
			alert("Please fill in all fields correctly.");
		}
	}
}
