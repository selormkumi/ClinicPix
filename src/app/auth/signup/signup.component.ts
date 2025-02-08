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
	selector: "app-signup",
	standalone: true,
	templateUrl: "./signup.component.html",
	styleUrl: "./signup.component.scss",
	imports: [CommonModule, ReactiveFormsModule],
})
export class SignupComponent {
	signupForm: FormGroup;
	constructor(private fb: FormBuilder, private router: Router) {
		this.signupForm = this.fb.group({
			role: ["", Validators.required],
			fullName: ["", [Validators.required, Validators.minLength(3)]],
			email: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required, Validators.minLength(6)]],
		});
	}
	// Helper method to check form field validity
	isFieldInvalid(field: string): boolean {
		const control = this.signupForm.get(field);
		return control
			? control.invalid && (control.dirty || control.touched)
			: false;
	}
	submitForm() {
		if (this.signupForm.valid) {
			const formData = this.signupForm.value;

			// Retrieve stored users from localStorage
			let storedUserData = localStorage.getItem("userData");
			let users = storedUserData ? JSON.parse(storedUserData) : [];

			// Prevent duplicate email registrations
			const userExists = users.some(
				(user: any) =>
					user.email.trim().toLowerCase() ===
					formData.email.trim().toLowerCase()
			);
			if (userExists) {
				alert("This email is already registered. Please log in.");
				return;
			}

			// Store new user
			users.push({
				role: formData.role.trim().toLowerCase(),
				fullName: formData.fullName.trim(),
				email: formData.email.trim().toLowerCase(),
				password: formData.password.trim(),
			});

			localStorage.setItem("userData", JSON.stringify(users));
			console.log("Updated Users List:", users);

			alert("Signup successful! You can now log in.");
			this.router.navigate(["/auth/login"]);
		} else {
			Object.values(this.signupForm.controls).forEach((control) =>
				control.markAsTouched()
			);
			console.log("⚠️ Form is incomplete. Please fill all required fields.");
		}
	}

	showPassword = false; // Tracks password visibility
	// Links to the eye icons (external images)
	eyeOpenIcon = "https://cdn-icons-png.flaticon.com/512/159/159604.png"; // Open eye
	eyeClosedIcon = "https://cdn-icons-png.flaticon.com/512/565/565655.png"; // Closed eye
	get eyeIcon() {
		return this.showPassword ? this.eyeOpenIcon : this.eyeClosedIcon;
	}
	// Toggle password visibility
	togglePasswordVisibility() {
		this.showPassword = !this.showPassword;
	}

	roleTouched = false; // Tracks if user tried to fill other fields without selecting a role
	// Function to check if role is selected when another field is focused
	onFieldFocus() {
		if (!this.signupForm.controls["role"].value) {
			this.roleTouched = true; // Show error message under role
		}
	}
}
