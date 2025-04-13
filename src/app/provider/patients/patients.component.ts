import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { S3FileService } from "../../shared/services/s3-file.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";

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
	showRemoveModal: boolean = false;
	patientToRemove: any = null;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3FileService: S3FileService,
		private snackBar: MatSnackBar
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
			this.snackBar.open("Please select a patient email.");
			return;
		}
	
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		const providerId = currentUser.userId;
	
		if (!providerId) {
			this.snackBar.open("No valid provider ID found.");
			return;
		}
	
		this.s3FileService.assignPatient(providerId, this.selectedPatientEmail).subscribe(
			() => {
				this.snackBar.open("✅ Patient assigned!");
				this.selectedPatientEmail = "";
				this.loadPatients();              // Refresh table
				this.fetchAvailablePatientEmails(); // ✅ Refresh dropdown
			},
			(error: any) => {
				console.error("❌ ERROR assigning patient", error);
				this.snackBar.open(error?.error?.error || "Failed to assign patient.");
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

	removePatient(patient: any) {
		this.patientToRemove = patient;
		this.showRemoveModal = true;
	  }
	
	  confirmRemove() {
		const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
		const providerId = currentUser.userId;
	  
		if (!this.patientToRemove || !providerId) return;
	  
		this.s3FileService.unassignPatient(providerId, this.patientToRemove.id).subscribe(
		  () => {
			this.snackBar.open("✅ Patient removed.");
			this.loadPatients();
			this.fetchAvailablePatientEmails();
		  },
		  (error) => {
			console.error("❌ ERROR unassigning patient", error);
			this.snackBar.open("Failed to remove patient.");
		  }
		);
	  
		this.showRemoveModal = false;
		this.patientToRemove = null;
	  }
	  
	  cancelRemove() {
		this.showRemoveModal = false;
		this.patientToRemove = null;
	  }
	  

	// ✅ Logout
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]);
	}
}