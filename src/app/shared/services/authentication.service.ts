import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class AuthenticationService {
	isLoggedIn(): boolean {
		return !!localStorage.getItem("user");
	}
}
