import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { S3FileService } from "../../shared/services/s3-file.service";
import { MatSnackBar } from '@angular/material/snack-bar';

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
	isLoading: boolean = false;
	currentUserId: number = 0;
	currentUserName: string | null = null;
	showDisclaimerModal: boolean = false;
	downloadImagePending: any = null;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3Service: S3FileService,
		private snackBar: MatSnackBar
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

		this.fetchSharedFiles();
	}

	fetchSharedFiles() {
		if (!this.currentUserId) {
			console.error("❌ ERROR: User ID is missing. Cannot fetch shared files.");
			return;
		}

		this.isLoading = true;
		this.s3Service.getSharedFiles(this.currentUserId).subscribe(
			(res) => {
				console.log("✅ Shared Files Retrieved:", res);

				this.sharedImages = (res.sharedFiles || [])
				.sort((a: any, b: any) => new Date(b.shared_on).getTime() - new Date(a.shared_on).getTime())
				.map((file: any) => ({
					name: file.file_name,
					sharedBy: file.shared_by || "Unknown",
					sharedByEmail: file.shared_by_email || "N/A",
					uploadedBy: file.uploaded_by || 0,
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
					: "N/A",
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
					: "N/A",
					tags: file.tags ? file.tags.split(",") : [],
				}));

				this.extractUniqueTags();
				this.filteredRecords = [...this.sharedImages];
				this.isLoading = false;
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch shared files", error);
				this.isLoading = false;
			}
		);
	}

	extractUniqueTags() {
		const allTags = this.sharedImages.flatMap((file) => file.tags);
		this.uniqueTags = Array.from(new Set(allTags));
	}

	viewImage(image: any) {
		const uploadedBy = image.uploadedBy || image.sharedBy;
		this.s3Service.getFileUrl(image.name, uploadedBy).subscribe(
			(res) => {
				this.selectedImage = {
					name: image.name,
					url: res.viewUrl,
					tags: image.tags,
					sharedBy: image.sharedBy,
					sharedByEmail: image.sharedByEmail,
				};
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

	openDisclaimer(image: any) {
		this.downloadImagePending = image;
		this.showDisclaimerModal = true;
	}

	confirmDownload() {
		const image = this.downloadImagePending;
		if (!image) return;
		const uploadedBy = image.uploadedBy || image.sharedBy;
		this.s3Service.getDownloadUrl(image.name, uploadedBy).subscribe(
			(res) => {
				if (res.downloadUrl) {
					const link = document.createElement("a");
					link.href = res.downloadUrl;
					link.setAttribute("download", image.name);
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);

					this.snackBar.open("✅ Download started", "Close");

				} else {
					this.snackBar.open("❌ Download link unavailable", "Close");
				}
			},
			(error) => {
				console.error("❌ ERROR: Failed to generate download link", error);
				this.snackBar.open("❌ Failed to download file", "Close", { duration: 3000 });
			}
		);
		this.showDisclaimerModal = false;
		this.downloadImagePending = null;
	}

	cancelDownload() {
		this.showDisclaimerModal = false;
		this.downloadImagePending = null;
	}

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

	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]);
	}
}