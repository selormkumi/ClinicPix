import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-profile",
	imports: [RouterModule, FormsModule, CommonModule],
	templateUrl: "./profile.component.html",
	styleUrl: "./profile.component.scss",
})
export class ProfileComponent {
	patient = {
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

	toggleEdit(): void {
		this.isEditing = !this.isEditing;
	}

	// Save changes and close the edit mode
	saveChanges(): void {
		// Save profile changes here
		console.log("Profile updated", this.patient);
		this.toggleEdit(); // Close the edit form after saving
	}
	ngOnInit() {}

	logout(): void {
		localStorage.removeItem("loggedInUser"); // Clear login session
		window.location.href = "/login"; // Redirect to login page
	}
}
