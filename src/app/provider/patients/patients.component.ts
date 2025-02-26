import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-patients",
	imports: [RouterModule],
	templateUrl: "./patients.component.html",
	styleUrl: "./patients.component.scss",
})
export class PatientsComponent {
	currentUserFullName: string | null = null;
	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}
	ngOnInit() {
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserFullName = user.fullName;
		}
	}
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}
