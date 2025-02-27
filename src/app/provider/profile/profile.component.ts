import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-profile",
	imports: [RouterModule],
	templateUrl: "./profile.component.html",
	styleUrl: "./profile.component.scss",
})
export class ProfileComponent {
	currentUserName: string | null = null;
	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}
	ngOnInit() {
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserName = user.userName;
		}
	}
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}
