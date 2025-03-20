import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
import { S3FileService } from "../../shared/services/s3-file.service";

@Component({
	selector: "app-uploaded-images",
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, ImageModalComponent],
	templateUrl: "./uploaded-images.component.html",
	styleUrl: "./uploaded-images.component.scss",
})
export class UploadedImagesComponent implements OnInit {
	currentUserId: number = 0;
	currentUserName: string | null = null;
	selectedImage: any | null = null;
	isEditing: boolean = false;
	isLoading: boolean = false;

	uploadedImages: any[] = [];
	newFileName: string = "";
	newFileTags: string = "";
	pendingFile: File | null = null;
	isDragging = false;

	@ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3Service: S3FileService
	) {}

	ngOnInit() {
		const currentUser = localStorage.getItem("user");

		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserId = Number(user.userId) || 0; // Ensure it's a number
			this.currentUserName = user.username || null;
		}

		console.log("✅ Current User ID:", this.currentUserId);
		this.fetchUploadedImages();
	}

	// ✅ Fetch uploaded images
	fetchUploadedImages() {
		this.isLoading = true;

		this.s3Service.getUploadedFiles(this.currentUserId).subscribe(
			(res) => {
				console.log("📌 API Response:", res);

				this.uploadedImages = res.files.map((file: any) => ({
					name: file.fileName || "Unknown File",
					uploadedBy: file.uploadedBy || "Unknown",
					uploaderEmail: file.uploaderEmail || "",
					uploadedOn: file.uploadedOn || "N/A",
					tags: Array.isArray(file.tags) ? file.tags : [], 
				}));

				console.log("📌 Processed Data:", this.uploadedImages);
				this.isLoading = false;
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch uploaded files", error);
				this.isLoading = false;
			}
		);
	}

	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]);
	}

	// ✅ Open Image
	viewImage(imageName: string) {
		this.s3Service.getFileUrl(imageName).subscribe((res) => {
			window.open(res.viewUrl, "_blank");
		});
	}

	// ✅ Open Share Modal (Uses Email, then Fetches User ID)
	openShareModal(imageName: string) {
		const patientEmail = prompt("Enter the patient's email:");
		if (!patientEmail) return;

		this.s3Service.getUserIdByEmail(patientEmail).subscribe(
			(res) => {
				if (res.userId) {
					this.shareImage(imageName, Number(res.userId));
				} else {
					alert("❌ ERROR: No user found with that email.");
				}
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch user ID", error);
				alert("Failed to find the user. Please try again.");
			}
		);
	}

	// ✅ Share Image with Validated User ID
	shareImage(imageName: string, patientId: number) {
		if (!patientId || patientId === 0) {
			alert("Invalid user ID for sharing.");
			return;
		}

		const expiresIn = 86400; // 1 day in seconds

		this.s3Service.shareFile(imageName, this.currentUserId, patientId, expiresIn).subscribe(
			(res) => {
				alert(`✅ Image shared successfully with User ID: ${patientId}`);
				console.log("Shared Link:", res.viewUrl);
			},
			(error) => {
				console.error("❌ ERROR: Failed to share image", error);
				alert("Failed to share image. Please try again.");
			}
		);
	}

	// ✅ Delete Image
	deleteImage(imageName: string) {
		if (confirm(`Are you sure you want to delete ${imageName}?`)) {
			this.s3Service.deleteFile(imageName).subscribe(
				() => {
					alert("✅ File deleted successfully!");
					this.fetchUploadedImages();
				},
				(error) => {
					console.error("❌ ERROR: Failed to delete file", error);
					alert("Failed to delete file. Please try again.");
				}
			);
		}
	}

	// ✅ Upload Image
	triggerFileInput() {
		this.fileInput.nativeElement.click();
	}

	uploadImage(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			this.pendingFile = input.files[0];
			this.newFileName = this.pendingFile.name;
		}
	}

	confirmUpload() {
		console.log("🔍 Current User ID:", this.currentUserId);

		if (!this.pendingFile) {
			alert("Please select a file to upload.");
			return;
		}

		if (!this.currentUserId || this.currentUserId === 0) {
			alert("You must be logged in to upload files.");
			return;
		}

		const fileName = this.pendingFile.name;
		const fileType = this.pendingFile.type;
		const uploadedBy = this.currentUserId;
		const tags = this.newFileTags ? this.newFileTags.split(",").map(tag => tag.trim()) : [];

		this.s3Service.uploadFile(fileName, fileType, uploadedBy, tags).subscribe(
			(res) => {
				if (res.uploadUrl) {
					fetch(res.uploadUrl, {
						method: "PUT",
						body: this.pendingFile,
						headers: { "Content-Type": fileType },
					})
					.then(() => {
						alert("✅ File uploaded successfully!");
						this.fetchUploadedImages();
						this.resetUploadForm();
					})
					.catch((err) => {
						console.error("❌ Upload error:", err);
						alert("Upload failed. Please try again.");
					});
				}
			},
			(error) => {
				console.error("❌ ERROR: Failed to upload file", error);
				alert("Failed to upload file. Please try again.");
			}
		);
	}	

	// ✅ Drag & Drop Handlers
	handleDragOver(event: DragEvent) {
		event.preventDefault();
		this.isDragging = true;
	}

	handleDragLeave() {
		this.isDragging = false;
	}

	handleDrop(event: DragEvent) {
		event.preventDefault();
		this.isDragging = false;
		if (event.dataTransfer && event.dataTransfer.files.length > 0) {
			this.pendingFile = event.dataTransfer.files[0];
			this.newFileName = this.pendingFile.name;
		}
	}

	// ✅ Reset Upload Form
	resetUploadForm() {
		this.pendingFile = null;
		this.newFileName = "";
		this.newFileTags = "";

		if (this.fileInput && this.fileInput.nativeElement) {
			this.fileInput.nativeElement.value = "";
		}

		this.isDragging = false;
	}

	// ✅ Close Modal
	closeModal() {
		this.selectedImage = null;
		this.isEditing = false;
	}

	// ✅ Save Changes
	saveChanges(updatedImage: any) {
		if (this.selectedImage) {
			const index = this.uploadedImages.findIndex(
				(img) => img.name === this.selectedImage.name
			);
			if (index !== -1) {
				this.uploadedImages[index] = { ...this.selectedImage, ...updatedImage };
			}
		}
		this.selectedImage = null;
		this.isEditing = false;
	}
}