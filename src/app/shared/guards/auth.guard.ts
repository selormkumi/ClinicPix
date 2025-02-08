import { Injectable } from "@angular/core";
import {
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from "@angular/router";
import { AuthenticationService } from "../services/authentication.service";

@Injectable({
	providedIn: "root", // Ensures Angular provides the service
})
export class AuthGuard implements CanActivate {
	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		const user = this.authService.getCurrentUser(); // Retrieve the logged-in user

		if (!user) {
			// Not logged in, redirect to login page
			this.router.navigate(["/auth/login"]);
			return false;
		}

		// Extract the expected role from the route data (patient or provider)
		const expectedRole = route.data["role"];

		if (expectedRole && user.role !== expectedRole) {
			// User role mismatch, redirect to unauthorized page
			this.router.navigate(["/unauthorized"]);
			return false;
		}

		return true; // Allow access
	}
}
