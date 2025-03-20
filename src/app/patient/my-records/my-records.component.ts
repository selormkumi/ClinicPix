import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { S3FileService } from "../../shared/services/s3-file.service";

@Component({
	selector: "app-my-records",
	standalone: true,
	imports: [RouterModule, CommonModule, FormsModule, ImageModalComponent],
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
	isLoading: boolean = false; // ✅ Added loading indicator
	currentUserId: number = 0;
	currentUserName: string | null = null;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3Service: S3FileService
	) {}

	ngOnInit() {
		console.log("📌 Initializing My Records Component...");
	
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserId = user.userId ?? 0;
			this.currentUserName = user.username;
		} else {
			console.error("❌ ERROR: No user found in localStorage");
		}

		if (!this.currentUserId) {
			console.error("❌ ERROR: No valid user ID found.");
		} else {
			console.log("✅ Current Patient ID:", this.currentUserId);
		}

		// 🔥 Fetch shared files
		this.fetchSharedFiles();
	}	

	// 📌 Fetch shared files for the logged-in patient using user ID
	fetchSharedFiles() {
		if (!this.currentUserId) {
			console.error("❌ ERROR: User ID is missing. Cannot fetch shared files.");
			return;
		}
	
		this.isLoading = true;
		this.s3Service.getSharedFiles(this.currentUserId).subscribe(
			(res) => {
				console.log("✅ Shared Files Retrieved:", res);
	
				this.sharedImages = res.sharedFiles.map((file: any) => ({
					name: file.file_name,
					sharedBy: file.shared_by,
					sharedByEmail: file.shared_by_email, // ✅ Ensure email is included
					sharedOn: file.shared_on
						? new Date(file.shared_on).toLocaleString("en-US", {
							month: "short",
							day: "2-digit",
							year: "numeric",
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
							hour12: true,
						})
						: "N/A", // ✅ Format date
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
						: "N/A", // ✅ Format date
					tags: file.tags ? file.tags.split(",") : [],
				}));
	
				this.extractUniqueTags();
				this.filteredRecords = [...this.sharedImages];
	
				console.log("📌 Updated Shared Images List:", this.sharedImages);
				this.isLoading = false;
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch shared files", error);
				this.isLoading = false;
			}
		);
	}			

	// 📌 Extract unique tags for filtering
	extractUniqueTags() {
		const allTags = this.sharedImages.flatMap((file) => file.tags);
		this.uniqueTags = Array.from(new Set(allTags));
	}

	// 📌 View Image (Generate signed URL)
	viewImage(image: any) {
		this.s3Service.getFileUrl(image.name).subscribe(
			(res) => {
				window.open(res.viewUrl, "_blank");
			},
			(error) => {
				console.error("❌ ERROR: Failed to retrieve file URL", error);
				alert("Failed to load the image. Please try again.");
			}
		);
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
				? record.tags.includes(this.selectedTag)
				: true;

			return matchesSearch && matchesTag;
		});
	}

	// 📌 Download the shared image
	downloadImage(image: any): void {
		this.s3Service.getFileUrl(image.name).subscribe(
			(res) => {
				if (res.viewUrl) {
					const link = document.createElement("a");
					link.href = res.viewUrl;
					link.download = image.name;
					link.click();
				} else {
					alert("❌ Error: Download link is unavailable.");
				}
			},
			(error) => {
				console.error("❌ ERROR: Failed to generate download link", error);
				alert("Failed to download file. Please try again.");
			}
		);
	}

	// 📌 Logout the user
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}