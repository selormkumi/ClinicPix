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
	signupForm: FormGroup<{
		[key in "role" | "fullName" | "email" | "password"]: FormControl<
			string | null
		>;
	}> = new FormGroup({
		role: new FormControl("", Validators.required),
		fullName: new FormControl("", Validators.required),
		email: new FormControl("", [Validators.required, Validators.email]),
		password: new FormControl("", [
			Validators.required,
			Validators.minLength(6),
		]),
	});

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

	// Helper method to check form field validity
	isFieldInvalid(field: "role" | "fullName" | "email" | "password"): boolean {
		return (
			this.signupForm.controls[field].invalid &&
			(this.signupForm.controls[field].dirty ||
				this.signupForm.controls[field].touched)
		);
	}

	// Get the correct eye icon based on password visibility
	getPasswordIcon(): string {
		return this.showPassword
			? "assets/icons/eye-open.png"
			: "assets/icons/eye-closed.png";
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
		}
	}
}
