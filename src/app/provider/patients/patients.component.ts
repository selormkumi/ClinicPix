import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
@Component({
	selector: "app-patients",
	imports: [RouterModule, FormsModule, CommonModule],
	templateUrl: "./patients.component.html",
	styleUrl: "./patients.component.scss",
})
export class PatientsComponent {
	searchTerm: string = "";
	patients = [
		{
			name: "John Doe",
			email: "john.doe@example.com",
			phone: "(123) 456-7890",
		},
		{
			name: "Jane Smith",
			email: "jane.smith@example.com",
			phone: "(987) 654-3210",
		},
	];
	filteredPatients = this.patients;

	onSearch() {
		// Filtering patients based on the search term
		this.filteredPatients = this.patients.filter(
			(patient) =>
				patient.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				patient.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				patient.phone.includes(this.searchTerm)
		);
	}
	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}
	ngOnInit() {
		const currentUser = localStorage.getItem("user");
	}
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}
