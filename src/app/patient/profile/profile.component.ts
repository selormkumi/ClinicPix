import { Component, OnInit } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-profile",
	imports: [RouterModule, FormsModule],
	templateUrl: "./profile.component.html",
	styleUrl: "./profile.component.scss",
})
export class ProfileComponent implements OnInit {
	patient: any = {
		name: "",
		email: "",
		phone: "",
		address: "",
		profilePicture: "assets/images/default-avatar.png",
	};

	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}

	ngOnInit() {
		this.loadProfile();
	}
	loadProfile(): void {
		const savedProfile = localStorage.getItem("patientProfile");
		if (savedProfile) {
			this.patient = JSON.parse(savedProfile);
		} else {
			// Default values if no profile data exists
			this.patient = {
				name: "John Doe",
				email: "johndoe@example.com",
				phone: "",
				profilePicture: "assets/images/default-avatar.png",
				address: {
					street: "",
					city: "",
					state: "",
					zipcode: "",
				},
			};
		}
	}
	updateProfile(): void {
		localStorage.setItem("patientProfile", JSON.stringify(this.patient));
		alert("Profile updated successfully!");
	}
	saveProfile(): void {
		localStorage.setItem("patientProfile", JSON.stringify(this.patient));
		alert("Profile updated successfully!");
	}
	uploadProfilePicture(event: any): void {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				this.patient.profilePicture = reader.result as string;
			};
			reader.readAsDataURL(file);
		}
	}
	logout(): void {
		localStorage.removeItem("loggedInUser"); // Clear login session
		window.location.href = "/login"; // Redirect to login page
	}
}
