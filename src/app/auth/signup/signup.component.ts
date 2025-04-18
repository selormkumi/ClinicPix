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
	showPassword = false;
	roleTouched = false;
	showPolicyModal = false;

	eyeOpenIcon = "https://cdn-icons-png.flaticon.com/512/159/159604.png";
	eyeClosedIcon = "https://cdn-icons-png.flaticon.com/512/565/565655.png";

	constructor(private fb: FormBuilder, private router: Router, private authService: AuthenticationService) {
		this.signupForm = this.fb.group({
			role: ["", Validators.required],
			userName: ["", [Validators.required, Validators.minLength(3)]],
			email: ["", [Validators.required, Validators.email]],
			password: ["", [Validators.required, Validators.minLength(6)]],
			consentGiven: [false, Validators.requiredTrue],
		});
	}

	get eyeIcon() {
		return this.showPassword ? this.eyeOpenIcon : this.eyeClosedIcon;
	}

	togglePasswordVisibility() {
		this.showPassword = !this.showPassword;
	}

	isFieldInvalid(field: string): boolean {
		const control = this.signupForm.get(field);
		return control ? control.invalid && (control.dirty || control.touched) : false;
	}

	onFieldFocus() {
		if (!this.signupForm.controls["role"].value) {
			this.roleTouched = true;
		}
	}

	openPolicyModal() {
		this.showPolicyModal = true;
	}

	closePolicyModal() {
		this.showPolicyModal = false;
	}

	submitForm() {
		if (this.signupForm.valid) {
			const formData = this.signupForm.value;

			this.authService.signup(formData).subscribe(
				(response) => {
					alert("✅ Signup successful! Please log in to continue.");
					this.router.navigate(["/auth/login"]);
				},
				(error) => {
					alert("❌ Signup failed: " + (error.error.message || "Please try again."));
				}
			);
		} else {
			// Mark all fields as touched
			Object.values(this.signupForm.controls).forEach((control) => control.markAsTouched());
			this.roleTouched = !this.signupForm.get("role")?.value;
			console.log("⚠️ Form is incomplete. Please fill all required fields and agree to the policy.");
		}
	}
}