import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
	providedIn: "root",
})

export class AuthenticationService {
	private apiUrl = "http://localhost:5001/auth"; // Backend API URL
 
	constructor(private http: HttpClient) {}
 
	// User Login
	login(credentials: { email: string; password: string }): Observable<any> {
		return this.http.post(`${this.apiUrl}/login`, credentials);
	}
 
	// User Signup
	signup(userData: { userName: string; email: string; password: string; role: string }): Observable<any> {
		return this.http.post(`${this.apiUrl}/signup`, userData);
	}
 
	// Store JWT Token
	storeToken(token: string): void {
		localStorage.setItem("token", token);
	}
 
	// Get JWT Token
	getToken(): string | null {
		return localStorage.getItem("token");
	}
 
	// Check if a user is authenticated
	isAuthenticated(): boolean {
		return !!this.getToken();

	}

	getCurrentUser(): {role: string} | null {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	}

	// Logout
	logout(): void {
		localStorage.removeItem("token");
	}

}