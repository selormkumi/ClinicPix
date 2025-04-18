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
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: "app-login",
    standalone: true,
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class LoginComponent {
    loginForm: FormGroup;
    otpForm: FormGroup;
    loading: boolean = false;
    isOtpSent: boolean = false;
    email: string = ""; // Store email for OTP step

    // ✅ Add property to store error message
    loginErrorMessage: string = "";
    otpErrorMessage: string = "";

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private authService: AuthenticationService,
        private snackBar: MatSnackBar
    ) {
        this.loginForm = this.fb.group({
            email: ["", [Validators.required, Validators.email]],
            password: ["", [Validators.required, Validators.minLength(6)]],
        });

        this.otpForm = this.fb.group({
            otp: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
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
            this.loading = true;
            this.loginErrorMessage = ""; // ✅ Clear previous error
            const formData = this.loginForm.value;
            this.email = formData.email; // Store email for OTP verification

            this.authService.login(formData).subscribe(
                (response: any) => {
                    console.log("✅ Login Successful:", response);
                    this.isOtpSent = true;
                    this.loading = false;
                },
                (error: any) => {
                    console.error("❌ Login Error:", error);
                    let errorMessage = "Invalid email or password. Please try again.";

                    if (error.status === 403) {
                        errorMessage = "Your account has been deactivated. Please contact the administrator.";
                    } else if (error.status === 500) {
                        errorMessage = "Server error. Please try again later.";
                    } else if (error.status === 0) {
                        errorMessage = "Network error. Check your connection.";
                    }

                    this.loginErrorMessage = errorMessage; // ✅ Show message in UI
                    this.loading = false;
                }
            );
        } else {
            Object.values(this.loginForm.controls).forEach((control) =>
                control.markAsTouched()
            );
            console.log("⚠️ Please fill in all fields correctly.");
        }
    }

    /**
     * Verifies the OTP
     */
    verifyOtp() {
        if (this.otpForm.valid) {
            this.otpErrorMessage = ""; // ✅ Clear previous error
    
            const otpData = {
                email: this.email,
                otp: this.otpForm.controls["otp"].value,
            };
    
            this.authService.verifyOtp(otpData).subscribe(
                (response: any) => {
                    console.log("✅ OTP Verified:", response);
    
                    this.authService.storeToken(response.token);
    
                    if (!response.user || !response.user.role) {
                        console.error("❌ Role is missing in the response:", response);
                        this.otpErrorMessage = "Login failed. Missing user role.";
                        return;
                    }
    
                    localStorage.setItem(
                        "user",
                        JSON.stringify({
                            email: response.user.email,
                            userName: response.user.userName || response.user.username || response.user.name || "Unknown",
                            role: response.user.role,
                            userId: response.user.id || null,
                        })
                    );
    
                    this.redirectBasedOnRole(response.user.role);
                },
                (error: any) => {
                    console.error("❌ OTP Verification Error:", error);
    
                    let errorMessage = "❌ Invalid OTP. Please try again.";
    
                    if (error.status === 400) {
                        errorMessage = "Invalid OTP. Please try again.";
                    } else if (error.status === 403) {
                        errorMessage = "Your OTP session has expired. Please log in again.";
                    } else if (error.status === 0) {
                        errorMessage = "Network error. Check your internet connection.";
                    } else if (error.status === 500) {
                        errorMessage = "Server error. Please try again later.";
                    }
    
                    this.otpErrorMessage = errorMessage;
                }
            );
        } else {
            console.log("⚠️ Enter a valid OTP.");
        }
    }    

    /**
     * Redirect user based on role after OTP is verified.
     */
    private redirectBasedOnRole(role: string) {
        const roleRoutes: { [key: string]: string } = {
            patient: "/patient/dashboard",
            provider: "/provider/dashboard",
            admin: "/admin/dashboard", // ✅ Now supports admin role
        };

        const redirectRoute = roleRoutes[role.toLowerCase()];
        if (redirectRoute) {
            this.router.navigate([redirectRoute]);
        } else {
            this.snackBar.open("Your role does not have an assigned dashboard.");
        }
    }

    showPassword: boolean = false;
    eyeOpenIcon = "https://cdn-icons-png.flaticon.com/512/159/159604.png";
    eyeClosedIcon = "https://cdn-icons-png.flaticon.com/512/565/565655.png";
    eyeIcon = this.eyeClosedIcon;

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
        this.eyeIcon = this.showPassword ? this.eyeOpenIcon : this.eyeClosedIcon;
    }
}