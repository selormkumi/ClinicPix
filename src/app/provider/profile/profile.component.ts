import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-profile",
	imports: [RouterModule, FormsModule, CommonModule],
	standalone: true,
	templateUrl: "./profile.component.html",
	styleUrl: "./profile.component.scss",
})
export class ProfileComponent {
	provider = {
		name: "Francisca Cavalcante",
		email: "francisca.cavalcante@doctor.com",
		dob: "00-00-0000",
		state: "New York",
		country: "USA",
		age: 48,
		weight: 84,
		height: "5'11\"",
		address:
			"Apt 5B, 24/15, St. Paul Street, Palo Alto, California, USA, 92101",
		profilePicture:
			"https://th.bing.com/th/id/OIP.SAcV4rjQCseubnk32USHigHaHx?rs=1&pid=ImgDetMain",
	};
	isEditing = false;

	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}
	ngOnInit() {}

	toggleEdit(): void {
		this.isEditing = !this.isEditing;
	}

	// Save changes and close the edit mode
	saveChanges(): void {
		// Save profile changes here
		console.log("Profile updated", this.provider);
		this.toggleEdit(); // Close the edit form after saving
	}

	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}
