import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import {
	ReactiveFormsModule,
	FormGroup,
	FormControl,
	Validators,
} from "@angular/forms";

@Component({
	selector: "app-signup",
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule],
	templateUrl: "./signup.component.html",
	styleUrl: "./signup.component.scss",
})
export class SignupComponent {
	signupForm = new FormGroup({
		role: new FormControl("", Validators.required), // Role is required
		fullName: new FormControl("", Validators.required),
		email: new FormControl("", [Validators.required, Validators.email]),
		password: new FormControl("", [
			Validators.required,
			Validators.minLength(6),
		]),
	});

	showPassword = false; // Tracks password visibility
	roleTouched = false; // Tracks if user tried to fill other fields without selecting a role

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

	submitForm() {
		if (this.signupForm.valid) {
			const formData = this.signupForm.value; // Get form data
			// Save form data to LocalStorage
			localStorage.setItem("userSignupData", JSON.stringify(formData));
			console.log("Form Data Saved:", formData);
			alert("Signup data saved successfully!"); // Alert for user feedback
		} else {
			// Mark all controls as touched to show validation errors
			Object.values(this.signupForm.controls).forEach((control) => {
				control.markAsTouched();
			});
			console.log("⚠️ Form is incomplete. Please fill all required fields.");
		}
	}

	// Helper method to check form field validity
	isFieldInvalid(field: "role" | "fullName" | "email" | "password"): boolean {
		return (
			this.signupForm.controls[field].invalid &&
			(this.signupForm.controls[field].dirty ||
				this.signupForm.controls[field].touched)
		);
	}

	// Function to check if role is selected when another field is focused
	onFieldFocus() {
		if (!this.signupForm.controls["role"].value) {
			this.roleTouched = true; // Show error message under role
		}
	}
}
