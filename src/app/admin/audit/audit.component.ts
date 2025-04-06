import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-audit",
	imports: [RouterModule, FormsModule, CommonModule],
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

	searchTerm: string = "";
	users = [
		{
			name: "John Doe",
			email: "john.doe@example.com",
			phone: "(123) 456-7890",
		},
	];

	filteredusers = this.users;
	onSearch() {
		// Filtering users based on the search term
		this.filteredusers = this.users.filter(
			(user) =>
				user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				user.phone.includes(this.searchTerm)
		);
	}
}
