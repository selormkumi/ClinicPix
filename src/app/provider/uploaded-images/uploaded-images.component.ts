import { Component } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-uploaded-images",
	imports: [RouterModule],
	templateUrl: "./uploaded-images.component.html",
	styleUrl: "./uploaded-images.component.scss",
})
export class UploadedImagesComponent {
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
