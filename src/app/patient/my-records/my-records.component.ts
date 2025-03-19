import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { S3FileService } from "../../shared/services/s3-file.service";

@Component({
	selector: "app-my-records",
	imports: [RouterModule, CommonModule, FormsModule, ImageModalComponent],
	standalone: true,
	templateUrl: "./my-records.component.html",
	styleUrl: "./my-records.component.scss",
})
export class MyRecordsComponent implements OnInit {
	sharedImages: any[] = [];
	filteredRecords: any[] = [];
	uniqueTags: string[] = [];
	searchQuery: string = "";
	selectedTag: string = "";
	selectedImage: any | null = null;
	isEditing: boolean = false;
	currentUserEmail: string = "";

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3Service: S3FileService
	) {}

	ngOnInit() {
		// Retrieve logged-in user's email from localStorage
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserEmail = user.email;
		}

		// Fetch shared records from backend
		this.fetchSharedFiles();
	}

	// 📌 Fetch shared files for the logged-in patient
	fetchSharedFiles() {
		this.s3Service.getSharedFiles(this.currentUserEmail).subscribe(
			(res) => {
				console.log("✅ Shared Files Retrieved:", res);

				this.sharedImages = res.sharedFiles.map((file: any) => ({
					name: file.file_name,
					sharedBy: file.uploaded_by, // Provider who shared the file
					sharedOn: file.shared_on || "N/A",
					expiresAt: file.expires_at || "N/A",
				}));

				// Copy for filtering
				this.filteredRecords = [...this.sharedImages];

				console.log("📌 Updated Shared Images List:", this.sharedImages);
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch shared files", error);
			}
		);
	}

	viewImage(image: any) {
		this.selectedImage = image;
		this.isEditing = false;
	}

	closeModal() {
		this.selectedImage = null;
	}

	// 📌 Filter records based on search query and tags
	filterRecords(): void {
		this.filteredRecords = this.sharedImages.filter((record) => {
			const matchesSearch =
				record.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				record.sharedBy.toLowerCase().includes(this.searchQuery.toLowerCase());

			const matchesTag = this.selectedTag
				? record.tags && record.tags.includes(this.selectedTag)
				: true;

			return matchesSearch && matchesTag;
		});
	}

	// 📌 Download the shared image
	downloadImage(image: any): void {
		this.s3Service.getFileUrl(image.name).subscribe((res) => {
			const link = document.createElement("a");
			link.href = res.viewUrl;
			link.download = image.name;
			link.click();
		});
	}

	// 📌 Logout the user
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}