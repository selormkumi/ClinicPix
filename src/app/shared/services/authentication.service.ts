import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class AuthenticationService {
	constructor() {}

	// Check if a user is authenticated
	isAuthenticated(): boolean {
		return !!localStorage.getItem("user");
	}

	// Get current user details from localStorage
	getCurrentUser(): { role: string } | null {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	}

	// Logout function (clear user data)
	logout() {
		localStorage.removeItem("user");
	}
}
