import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { S3FileService } from "../../shared/services/s3-file.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as moment from 'moment-timezone';

@Component({
	selector: "app-shared-images",
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, ImageModalComponent],
	templateUrl: "./shared-images.component.html",
	styleUrl: "./shared-images.component.scss",
})
export class SharedImagesComponent implements OnInit {
	sharedImages: any[] = []; // Holds shared files from backend
	currentUserId: number = 0;
	currentUserEmail: string | null = null;
	selectedImage: any | null = null;
	isLoading: boolean = false;
	showRevokeModal: boolean = false;
	imageToRevoke: any = null;


	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3Service: S3FileService,
		private snackBar: MatSnackBar
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

		this.s3Service.getProviderSharedFiles(this.currentUserId).subscribe(
			(res) => {
				console.log("✅ Shared Files Response:", res);

				this.sharedImages = res.sharedFiles.map((file: any) => ({
					name: file.file_name,
					sharedBy: file.uploaded_by,
					sharedByEmail: file.shared_by_email,
					sharedWith: file.shared_with,
					sharedWithName: file.shared_with_name,
					sharedWithEmail: file.shared_with_email,
					sharedOn: file.shared_on
					? moment.utc(file.shared_on).local().format("MMM D YYYY, hh:mm:ss A")
					: "N/A",
					expiresAt: file.expires_at
					? moment.utc(file.expires_at).local().format("MMM D YYYY, hh:mm:ss A")
					: "N/A",

				  }));
				  

				console.log("📌 Updated Shared Images List:", this.sharedImages);
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch shared files", error);
			}
		);
	}

	// ✅ View Image (Generate signed URL)
	viewImage(image: any) {
		this.s3Service.getFileUrl(image.name, image.sharedBy).subscribe(
		  (res) => {
			this.selectedImage = {
			  ...image,
			  viewUrl: res.viewUrl // pre-signed URL from backend
			};
		  },
		  (error) => {
			console.error("❌ ERROR: Failed to generate view URL", error);
			this.snackBar.open("Unable to view image. Try again.");
		  }
		);
	  }	  

	// ✅ Close Modal
	closeModal() {
		this.selectedImage = null;
	}

	// ✅ Revoke Access
	revokeAccess(image: any) {
		this.imageToRevoke = image;
		this.showRevokeModal = true;
	}	

	confirmRevoke() {
		if (!this.imageToRevoke || !this.currentUserId) return;
	
		const sharedWithId: number = Number(this.imageToRevoke.sharedWith);
		if (isNaN(sharedWithId)) {
			console.error("❌ ERROR: Invalid patient ID (expected a number)");
			return;
		}
	
		this.s3Service.revokeSharedFile(this.imageToRevoke.name, this.currentUserId, sharedWithId).subscribe(
			() => {
				this.snackBar.open("✅ Access revoked successfully!");
				this.fetchSharedFiles();
			},
			(error) => {
				console.error("❌ ERROR: Failed to revoke access", error);
				this.snackBar.open("❌ Failed to revoke access. Please try again.");
			}
		);
	
		this.showRevokeModal = false;
		this.imageToRevoke = null;
	}
	
	cancelRevoke() {
		this.showRevokeModal = false;
		this.imageToRevoke = null;
	}
	

	// ✅ Logout Function
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login
	}
}