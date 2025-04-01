import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-audit",
	imports: [],
	templateUrl: "./audit.component.html",
	styleUrl: "./audit.component.scss",
})
export class AuditComponent implements OnInit {
	currentUserName: string | null = "User"; // Default fallback name
	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}

	ngOnInit() {
		// ✅ Retrieve stored user data
		const currentUser = localStorage.getItem("user");

		if (currentUser) {
			try {
				const user = JSON.parse(currentUser);

				// ✅ Ensure `userName` exists, check common naming variations
				this.currentUserName =
					user.userName?.trim() ||
					user.username?.trim() ||
					user.name?.trim() ||
					"Unknown"; // ✅ Use correct username

				console.log("🔍 Loaded User:", user);
			} catch (error) {
				console.error(
					"❌ ERROR: Failed to parse user data from localStorage",
					error
				);
				this.currentUserName = "User"; // Prevent crashes
			}
		} else {
			console.warn("⚠️ WARNING: No user data found in localStorage.");
		}
	}
	// ✅ Logout Function
	logout() {
		this.authService.logout();
		this.router.navigate(["/auth/login"]).then(() => {
			console.log("✅ Redirected to login page");
		});
	}
}
