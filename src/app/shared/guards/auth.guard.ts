import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";

export const AuthGuard: CanActivateFn = (route, state) => {
	const router = inject(Router);
	const isAuthenticated = !!localStorage.getItem("user");
	if (!isAuthenticated) {
		router.navigate(["/auth/login"]);
		return false;
	}
	return true;
};
