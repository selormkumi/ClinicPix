import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";

@Injectable({
	providedIn: "root",
})
export class AuthenticationService {
	private apiUrl = `${environment.apiUrl}/auth`;

	constructor(private http: HttpClient, private router: Router) {}

	// ✅ User Login
	login(credentials: { email: string; password: string }): Observable<any> {
		return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
			tap((response: any) => {
				if (response.token && response.user) {
					this.storeToken(response.token);

					const userName = response.user.userName || "User";

					localStorage.setItem("user", JSON.stringify({
						email: response.user.email,
						userName: userName,
						role: response.user.role,
						userId: response.user.id
					}));

					console.log("🔍 Stored User:", localStorage.getItem("user"));
				}
			})
		);
	}

	// ✅ User Signup (No Auto Login)
	signup(userData: { userName: string; email: string; password: string; role: string }): Observable<any> {
		return this.http.post(`${this.apiUrl}/signup`, userData);
	}

	// ✅ Store JWT Token
	storeToken(token: string): void {
		localStorage.setItem("token", token);
	}

	// ✅ Get JWT Token
	getToken(): string | null {
		return localStorage.getItem("token");
	}

	// ✅ Check if a user is authenticated
	isAuthenticated(): boolean {
		return !!this.getToken();
	}

	// ✅ Get Current User (From Local Storage)
	getCurrentUser(): { email: string; role: string; userId: number; userName: string } | null {
		const user = localStorage.getItem("user");
		if (user) {
			try {
				return JSON.parse(user);
			} catch (error) {
				console.error("❌ ERROR: Failed to parse user data from localStorage", error);
				return null;
			}
		}
		return null;
	}

	// ✅ Logout (Audit & Redirect)
	logout(): void {
		const user = this.getCurrentUser();
		const userId = user?.userId;
		const email = user?.email;
	
		if (userId && email) {
			this.http.post(`${this.apiUrl}/logout`, { userId, email }).subscribe({
				next: () => console.log("📝 Logout logged"),
				error: (err) => console.error("❌ Failed to log logout:", err),
			});
		}
	
		console.log("🚪 Logging out...");
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	
		this.router.navigate(["/auth/login"]).then(() => {
			console.log("✅ Redirected to Login Page");
		});
	}	

	// ✅ OTP Verification Request
	verifyOtp(data: { email: string; otp: string }): Observable<any> {
		if (!data.email) {
			data.email = localStorage.getItem("email") || "";
		}
		return this.http.post(`${this.apiUrl}/verify-otp`, data);
	}

	// ✅ Access Protected Route
	accessProtectedRoute(): Observable<any> {
		const token = this.getToken();
		const headers = new HttpHeaders().set("Authorization", `Bearer ${token}`);
		return this.http.post(`${this.apiUrl}/protected`, {}, { headers });
	}
}