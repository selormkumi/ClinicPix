import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-audit",
	imports: [RouterModule],
	templateUrl: "./audit.component.html",
	styleUrl: "./audit.component.scss",
})
export class AuditComponent implements OnInit {
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
