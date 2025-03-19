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
	currentUserName: string | null = null;
	selectedImage: any | null = null;
	isEditing: boolean = false;

	uploadedImages: any[] = []; // Stores images fetched from S3
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
			this.currentUserName = user.userName;
		}
		this.fetchUploadedImages();
	}

	// 📌 Fetch images from S3 and correctly map filenames
	fetchUploadedImages() {
		this.s3Service.getUploadedFiles().subscribe(
			(res) => {
				console.log("DEBUG: Response from S3 ->", res);

				if (res.files && Array.isArray(res.files)) {
					this.uploadedImages = res.files.map((file: any) => ({
						name: file.fileName || "Unknown File",
						uploadedBy: "Unknown",
						uploadedOn: file.lastModified || "N/A",
						tags: [],
					}));

					console.log("✅ Uploaded Images ->", this.uploadedImages);
				} else {
					console.error("❌ ERROR: Unexpected API response format", res);
				}
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch uploaded files", error);
			}
		);
	}

	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]);
	}

	// 📌 View Image (Open file in a new tab)
	viewImage(imageName: string) {
		this.s3Service.getFileUrl(imageName).subscribe((res) => {
			window.open(res.viewUrl, "_blank");
		});
	}

	// 📌 Share Image (Generate a shareable link)
	shareImage(imageName: string) {
		this.s3Service.getShareUrl(imageName).subscribe((res) => {
			alert(`Shareable link: ${res.shareUrl}`);
		});
	}

	// 📌 Delete Image
	deleteImage(imageName: string) {
		if (confirm(`Are you sure you want to delete ${imageName}?`)) {
			this.s3Service.deleteFile(imageName).subscribe(() => {
				alert("File deleted successfully!");
				this.fetchUploadedImages();
			});
		}
	}

	// 📌 Upload Image
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
		if (!this.pendingFile) return;

		this.s3Service.uploadFile(this.pendingFile).subscribe((res) => {
			const uploadUrl = res.uploadUrl;

			// Upload the file to S3
			fetch(uploadUrl, {
				method: "PUT",
				body: this.pendingFile,
			})
				.then(() => {
					alert("File uploaded successfully!");
					this.fetchUploadedImages();
				})
				.catch((err) => console.error("Upload error:", err));
		});
	}

	// 📌 Drag & Drop Handlers
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

	resetUploadForm() {
		this.pendingFile = null;
		this.newFileName = "";
		this.newFileTags = "";
		if (this.fileInput) {
			this.fileInput.nativeElement.value = "";
		}
	}

	// 📌 Close the modal (cancel editing/viewing)
	closeModal() {
		this.selectedImage = null;
		this.isEditing = false;
	}

	// 📌 Save Changes (Handles renaming and metadata updates)
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