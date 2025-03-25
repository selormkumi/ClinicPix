import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { S3FileService } from "../../shared/services/s3-file.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";

@Component({
	selector: "app-shared-images",
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, ImageModalComponent],
	templateUrl: "./shared-images.component.html",
	styleUrl: "./shared-images.component.scss",
})
<<<<<<< HEAD
export class SharedImagesComponent {
	searchTerm: string = ""; // Holds the search term entered by the user
	filteredImages: any[] = []; // Array that holds the filtered shared images
	selectedImage: any = null; // Holds the selected image for the modal

	sharedImages = [
		{
			name: "CT_Scan_2025.jpg",
			sharedBy: "Dr. Smith",
			sharedOn: "2025-01-20",
			tags: ["CT Scan", "Abdomen"],
		},
		{
			name: "Ultrasound_Heart.jpg",
			sharedBy: "Dr. Lee",
			sharedOn: "2025-01-18",
			tags: ["Ultrasound", "Heart"],
		},
	];

	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {
		this.filteredImages = this.sharedImages;
	}
	ngOnInit() {}
	onSearch() {
		if (this.searchTerm.trim() === "") {
			this.filteredImages = this.sharedImages; // Show all images if the search term is empty
		} else {
			this.filteredImages = this.sharedImages.filter(
				(image) =>
					image.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
					image.sharedBy
						.toLowerCase()
						.includes(this.searchTerm.toLowerCase()) ||
					image.sharedOn
						.toLowerCase()
						.includes(this.searchTerm.toLowerCase()) ||
					image.tags.some((tag) =>
						tag.toLowerCase().includes(this.searchTerm.toLowerCase())
					)
			);
		}
	}
=======
export class SharedImagesComponent implements OnInit {
	sharedImages: any[] = []; // Holds shared files from backend
	currentUserId: number = 0;
	currentUserEmail: string | null = null;
	selectedImage: any | null = null;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3Service: S3FileService
	) {}

	ngOnInit() {
		console.log("📌 Initializing Shared Images Component...");
		const currentUser = localStorage.getItem("user");

		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserId = user.userId ?? 0;
			this.currentUserEmail = user.email;
		}

		if (!this.currentUserId) {
			console.error("❌ ERROR: No valid user ID found.");
			return;
		}

		console.log("✅ Current Provider ID:", this.currentUserId);
		this.fetchSharedFiles();
	}

	// ✅ Fetch files that have been shared by this provider
	fetchSharedFiles() {
		if (!this.currentUserId) {
			console.error("❌ ERROR: No provider ID found.");
			return;
		}

		this.s3Service.getSharedFiles(this.currentUserId).subscribe(
			(res) => {
				console.log("✅ Shared Files Response:", res);

				this.sharedImages = res.sharedFiles.map((file: any) => ({
					name: file.file_name, // File name
					sharedBy: file.uploaded_by, // Provider ID
					sharedByEmail: file.shared_by_email, // Provider email
					sharedWith: file.shared_with, // Patient ID
					sharedWithEmail: file.shared_with_email, // Patient email
					expiresAt: file.expires_at
						? new Date(file.expires_at).toLocaleString("en-US", {
							month: "short",
							day: "2-digit",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
							hour12: true,
						})
						: "N/A", // ✅ Format expiration date
				}));

				console.log("📌 Updated Shared Images List:", this.sharedImages);
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch shared files", error);
			}
		);
	}

	// ✅ View Image (Generate signed URL)
>>>>>>> zhi
	viewImage(image: any) {
		this.selectedImage = image;
	}

	// ✅ Close Modal
	closeModal() {
		this.selectedImage = null;
	}

	// ✅ Revoke Access - ✅ FIXED
	revokeAccess(image: any) {
		if (!this.currentUserId) {
			console.error("❌ ERROR: No provider ID found.");
			return;
		}

		if (confirm(`Are you sure you want to revoke access to ${image.name}?`)) {
			const sharedWithId: number = Number(image.sharedWith);
			if (isNaN(sharedWithId)) {
				console.error("❌ ERROR: Invalid patient ID (expected a number)");
				return;
			}

			this.s3Service.revokeSharedFile(image.name, this.currentUserId, sharedWithId).subscribe(
				() => {
					alert("✅ Access revoked successfully!");
					this.fetchSharedFiles(); // Refresh list after revocation
				},
				(error) => {
					console.error("❌ ERROR: Failed to revoke access", error);
					alert("❌ Failed to revoke access. Please try again.");
				}
			);
		}
	}

	// ✅ Logout Function
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login
	}
}