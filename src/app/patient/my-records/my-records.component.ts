import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageService } from "../../shared/services/image.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
@Component({
	selector: "app-my-records",
	imports: [RouterModule, CommonModule, FormsModule, ImageModalComponent],
	standalone: true,
	templateUrl: "./my-records.component.html",
	styleUrl: "./my-records.component.scss",
})
export class MyRecordsComponent implements OnInit {
	currentUserFullName: string | null = null;
	imageRecords: any[] = [];
	filteredRecords: any[] = [];
	uniqueTags: string[] = [];
	searchQuery: string = "";
	selectedTag: string = "";
	selectedImage: string | null = null;
	isEditing: boolean = false;
	patientImages = [
		{
			name: "XRay_Chest_2025.jpg",
			uploadedBy: "Dr. Smith",
			uploadedOn: "2025-02-10",
			tags: ["X-Ray", "Chest"],
		},
		{
			name: "Blood_Test_Results.pdf",
			uploadedBy: "Lab",
			uploadedOn: "2025-02-12",
			tags: ["Blood Test"],
		},
	];
	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private imageService: ImageService
	) {}

	ngOnInit() {
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserFullName = user.fullName;
		}
		this.loadImageRecords();
	}

	viewImage(image: any) {
		this.selectedImage = image;
		this.isEditing = false;
	}

	closeModal() {
		this.selectedImage = null;
	}
	loadImageRecords(): void {
		this.imageRecords = this.imageService.getImageRecords();
		this.filteredRecords = [...this.imageRecords];

		// Extract unique tags for filtering
		this.uniqueTags = Array.from(
			new Set(this.imageRecords.flatMap((record) => record.tags.split(", ")))
		);
	}

	filterRecords(): void {
		this.filteredRecords = this.imageRecords.filter((record) => {
			const matchesSearch =
				record.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				record.tags.toLowerCase().includes(this.searchQuery.toLowerCase());

			const matchesTag = this.selectedTag
				? record.tags.includes(this.selectedTag)
				: true;

			return matchesSearch && matchesTag;
		});
	}

	closeViewer(): void {
		this.selectedImage = null;
	}

	downloadImage(image: any): void {
		alert(`Downloading ${image.name}`);
	}

	//  The `logout` function logs the user out and redirects them to the login page.
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}
