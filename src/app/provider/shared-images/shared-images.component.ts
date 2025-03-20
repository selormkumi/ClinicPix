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
export class SharedImagesComponent implements OnInit {
	sharedImages: any[] = []; // Holds shared files from backend
	currentUserEmail: string | null = null;
	selectedImage: any | null = null;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3Service: S3FileService
	) {}

	ngOnInit() {
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserEmail = user.email; // Get logged-in provider's email
		}
		this.fetchSharedFiles(); // Fetch shared files on load
	}

	// ✅ Fetch files that have been shared by this provider
	fetchSharedFiles() {
		if (!this.currentUserEmail) {
			console.error("❌ ERROR: No provider email found.");
			return;
		}

		// Ensure correct data type (convert to number when necessary)
		const sharedById: number = Number(this.currentUserEmail);
		if (isNaN(sharedById)) {
			console.error("❌ ERROR: Invalid provider ID (expected a number)");
			return;
		}

		this.s3Service.getSharedFiles(sharedById).subscribe(
			(res) => {
				console.log("✅ Shared Files Response:", res);

				this.sharedImages = res.sharedFiles.map((file: any) => ({
					name: file.file_name, // File name
					sharedBy: file.uploaded_by, // Provider who shared it
					sharedWith: file.shared_with, // Patient email or ID
					expiresAt: file.expires_at, // Expiration date
				}));

				console.log("✅ Shared Files Processed:", this.sharedImages);
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch shared files", error);
			}
		);
	}

	// ✅ View Image
	viewImage(image: any) {
		this.selectedImage = image;
	}

	// ✅ Close Modal
	closeModal() {
		this.selectedImage = null;
	}

	// ✅ Revoke Access
	revokeAccess(image: any) {
		if (!this.currentUserEmail) {
			console.error("❌ ERROR: No provider email found.");
			return;
		}

		if (confirm(`Are you sure you want to revoke access to ${image.name}?`)) {
			// Convert sharedWith to a number if it's a valid numeric ID
			const sharedWithId: number = Number(image.sharedWith);
			if (isNaN(sharedWithId)) {
				console.error("❌ ERROR: Invalid patient ID (expected a number)");
				return;
			}

			this.s3Service.revokeSharedFile(image.name, sharedWithId).subscribe(
				() => {
					alert("Access revoked successfully!");
					this.fetchSharedFiles(); // Refresh list after revocation
				},
				(error) => {
					console.error("❌ ERROR: Failed to revoke access", error);
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