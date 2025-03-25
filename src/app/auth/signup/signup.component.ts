import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AuthenticationService } from "../../shared/services/authentication.service";

@Component({
	selector: "app-signup",
	standalone: true,
	templateUrl: "./signup.component.html",
	styleUrls: ["./signup.component.scss"],
	imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class SignupComponent {
	signupForm: FormGroup;
	showPassword = false; // Tracks password visibility

	// Links to the eye icons (external images)
	eyeOpenIcon = "https://cdn-icons-png.flaticon.com/512/159/159604.png"; // Open eye
	eyeClosedIcon = "https://cdn-icons-png.flaticon.com/512/565/565655.png"; // Closed eye

	// Getter for eye icon
	get eyeIcon() {
		return this.showPassword ? this.eyeOpenIcon : this.eyeClosedIcon;
	}

	/**
	 * Toggles password visibility
	 */
	togglePasswordVisibility() {
		this.showPassword = !this.showPassword;
	}

	roleTouched = false; // Tracks if user tried to fill other fields without selecting a role

	constructor(private fb: FormBuilder, private router: Router, private authService: AuthenticationService) {
		this.signupForm = this.fb.group({
			role: ["", Validators.required],
			userName: ["", [Validators.required, Validators.minLength(3)]],
			email: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required, Validators.minLength(6)]],
		});
	}

	/**
	 * Checks if a form field is invalid
	 * @param field - The name of the form field
	 */
	isFieldInvalid(field: string): boolean {
		const control = this.signupForm.get(field);
		return control ? control.invalid && (control.dirty || control.touched) : false;
	}

	/**
	 * Handles signup by calling the backend API (No Auto-Login)
	 */
	submitForm() {
		if (this.signupForm.valid) {
			const formData = this.signupForm.value;

			// ✅ Call Backend Signup API
			this.authService.signup(formData).subscribe(
				(response) => {
					alert("✅ Signup successful! Please log in to continue.");
					this.router.navigate(["/auth/login"]); // ✅ Redirect user to login page
				},
				(error) => {
					alert("❌ Signup failed: " + (error.error.message || "Please try again."));
				}
			);
		} else {
			// Mark all fields as touched to show validation error
			Object.values(this.signupForm.controls).forEach((control) => control.markAsTouched());
			console.log("⚠️ Form is incomplete. Please fill all required fields.");
		}
	}

	/**
	 * Checks if role is selected when another field is focused
	 */
	onFieldFocus() {
		if (!this.signupForm.controls["role"].value) {
			this.roleTouched = true; // Show error message under role
		}
	}
}