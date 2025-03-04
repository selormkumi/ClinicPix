import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
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
    loading: boolean = false; // ✅ Loading indicator for better UX

    constructor(private router: Router, private fb: FormBuilder, private authService: AuthenticationService) {
        this.loginForm = this.fb.group({
            email: ["", [Validators.required, Validators.email]],
            password: ["", [Validators.required, Validators.minLength(6)]],
        });

    }
 
    isFieldInvalid(field: string): boolean {
        const control = this.loginForm.get(field);
        return control ? control.invalid && (control.dirty || control.touched) : false;
    }
 
    /**
     * Handles login logic by calling the backend authentication API.
     */

    submitForm() {
        if (this.loginForm.valid) {
            this.loading = true; // ✅ Show loading indicato
            const formData = this.loginForm.value;
 
            // Call Backend Login API
            this.authService.login(formData).subscribe(
                (response) => {
                    console.log("✅ Login Successful:", response);
 
                    // ✅ Store JWT token in localStorage
                    this.authService.storeToken(response.token);
 
                    // ✅ Store user details (excluding password)
                    localStorage.setItem(
                        "user",
                        JSON.stringify({
                            email: response.user.email,
                            userName: response.user.userName,
                            role: response.user.role,
                            userId: response.user.id || null,
                        })

                    );
 
                    // ✅ Redirect based on role
                    this.redirectBasedOnRole(response.user.role);
                    this.loading = false; // ✅ Hide loading indicator
                },

                (error) => {
                    console.error("❌ Login Error:", error);
                    let errorMessage = "Invalid email or password. Please try again.";
                    if (error.status === 500) {
                        errorMessage = "Server error. Please try again later.";
                    } else if (error.status === 0) {
                        errorMessage = "Network error. Check your connection.";
                    }
 
                    alert(errorMessage);
                    this.loading = false; // ✅ Hide loading indicator
                }

            );

        } else {
            // Mark all controls as touched to show validation errors
            Object.values(this.loginForm.controls).forEach((control) => control.markAsTouched());
            console.log("⚠️ Please fill in all fields correctly.");
        }
    }
 
    /**
     * Redirects the user based on their role.
     * @param role - User role from the backend.
     */

    private redirectBasedOnRole(role: string) {
        const roleRoutes: { [key: string]: string } = {
            patient: "/patient/dashboard",
            provider: "/provider/dashboard",
        };
 
        const redirectRoute = roleRoutes[role.toLowerCase()];
        if (redirectRoute) {
            this.router.navigate([redirectRoute]);
        } else {
            alert("Your role does not have an assigned dashboard.");
        }
    }
 
    // ✅ Eye Icons for Password Visibility

    showPassword: boolean = false;
    eyeOpenIcon = "https://cdn-icons-png.flaticon.com/512/159/159604.png"; // Open eye
    eyeClosedIcon = "https://cdn-icons-png.flaticon.com/512/565/565655.png"; // Closed eye
    eyeIcon = this.eyeClosedIcon; // Default to closed eye

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
        this.eyeIcon = this.showPassword ? this.eyeOpenIcon : this.eyeClosedIcon;
    }
}

 