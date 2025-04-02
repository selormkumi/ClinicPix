import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-manage-users",
	imports: [RouterModule],
	templateUrl: "./manage-users.component.html",
	styleUrl: "./manage-users.component.scss",
})
export class ManageUsersComponent implements OnInit {
	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}

	ngOnInit() {}
	// ✅ Logout Function
	logout() {
		this.authService.logout();
		this.router.navigate(["/auth/login"]).then(() => {
			console.log("✅ Redirected to login page");
		});
	}
}
