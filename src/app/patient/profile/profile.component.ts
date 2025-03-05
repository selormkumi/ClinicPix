import { Component } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-profile",
	imports: [RouterModule],
	templateUrl: "./profile.component.html",
	styleUrl: "./profile.component.scss",
})
export class ProfileComponent {
	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}

	ngOnInit() {}

	logout(): void {
		localStorage.removeItem("loggedInUser"); // Clear login session
		window.location.href = "/login"; // Redirect to login page
	}
}
