import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Router } from "@angular/router"; // ✅ Ensure Router is imported

@Injectable({
	providedIn: "root",
})
export class AuthenticationService {
	private apiUrl = "http://localhost:5001/auth"; // Backend API URL

	constructor(private http: HttpClient, private router: Router) {} // ✅ Inject Router

	// ✅ User Login
	login(credentials: { email: string; password: string }): Observable<any> {
		return this.http.post(`${this.apiUrl}/login`, credentials);
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
	getCurrentUser(): { role: string; userId: number } | null {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	}

	// ✅ Logout (Ensure Proper Redirection)
	logout(): void {
		console.log("🚪 Logging out...");
		localStorage.removeItem("token"); // ✅ Remove JWT
		localStorage.removeItem("user");  // ✅ Remove User Data

		this.router.navigate(["/auth/login"]).then(() => {
			console.log("✅ Redirected to Login Page");
		});
	}
}