import { Injectable } from "@angular/core";
import {
	CanActivate,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	Router,
} from "@angular/router";
import { AuthenticationService } from "../services/authentication.service";

@Injectable({
	providedIn: "root",
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
		const user = this.authService.getCurrentUser();

		if (!user) {
			console.warn("🚨 User is not logged in! Redirecting to login...");
			this.router.navigate(["/auth/login"]);
			return false;
		}

		// ✅ Check if user has the required role
		const expectedRole = route.data["role"];
		if (expectedRole && user.role !== expectedRole) {
			console.warn("🚨 Unauthorized access! Redirecting to login...");
			this.router.navigate(["/auth/login"]); // ✅ Redirect unauthorized users to login
			return false;
		}

		return true;
	}
}