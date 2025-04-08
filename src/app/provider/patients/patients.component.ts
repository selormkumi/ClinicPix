import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { S3FileService } from "../../shared/services/s3-file.service";

@Component({
	selector: "app-patients",
	standalone: true,
	imports: [RouterModule, FormsModule, CommonModule],
	templateUrl: "./patients.component.html",
	styleUrl: "./patients.component.scss",
})
export class PatientsComponent implements OnInit {
	searchTerm: string = "";
	patients: any[] = [];
	filteredPatients: any[] = [];

	newPatientEmail: string = ""; // unused now, replaced with dropdown
	selectedPatientEmail: string = "";
	availablePatientEmails: any[] = [];

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3FileService: S3FileService
	) {}

	ngOnInit() {
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			this.loadPatients();
			this.fetchAvailablePatientEmails();
		} else {
			console.error("❌ No current user found in localStorage.");
		}
	}

	// ✅ Search Functionality
	onSearch() {
		this.filteredPatients = this.patients.filter(
			(patient) =>
				patient.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				patient.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				patient.phone?.includes(this.searchTerm)
		);
	}

	// ✅ Assign Patient to Provider (Dropdown)
	assignPatient() {
		if (!this.selectedPatientEmail) {
			alert("Please select a patient email.");
			return;
		}
	
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		const providerId = currentUser.userId;
	
		if (!providerId) {
			alert("No valid provider ID found.");
			return;
		}
	
		this.s3FileService.assignPatient(providerId, this.selectedPatientEmail).subscribe(
			() => {
				alert("✅ Patient assigned!");
				this.selectedPatientEmail = "";
				this.loadPatients();              // Refresh table
				this.fetchAvailablePatientEmails(); // ✅ Refresh dropdown
			},
			(error: any) => {
				console.error("❌ ERROR assigning patient", error);
				alert(error?.error?.error || "Failed to assign patient.");
			}
		);
	}

	// ✅ Load Patients Assigned to This Provider
	loadPatients() {
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		const providerId = currentUser.userId;

		if (!providerId) {
			console.error("❌ No valid provider ID found.");
			return;
		}

		this.s3FileService.getPatientsByProvider(providerId).subscribe(
			(res) => {
				this.patients = res.patients || [];
				this.filteredPatients = this.patients;
			},
			(error: any) => {
				console.error("❌ ERROR loading patients", error);
			}
		);
	}

	// ✅ Fetch All Available Patients (for dropdown)
	fetchAvailablePatientEmails() {
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		const providerId = currentUser.userId;

		if (!providerId) return;

		this.s3FileService.getAllPatientEmails(providerId).subscribe(
			(res) => {
				this.availablePatientEmails = res.patients || [];
			},
			(error) => {
				console.error("❌ ERROR fetching emails", error);
			}
		);
	}

	removePatient(patientId: number) {
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		const providerId = currentUser.userId;

		if (confirm("Are you sure you want to remove this patient?")) {
			this.s3FileService.unassignPatient(providerId, patientId).subscribe(
				() => {
					alert("✅ Patient removed.");
					this.loadPatients(); // Refresh table
					this.fetchAvailablePatientEmails(); // Update dropdown
				},
				(error) => {
					console.error("❌ ERROR unassigning patient", error);
					alert("Failed to remove patient.");
				}
			);
		}
	}

	// ✅ Logout
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]);
	}
}