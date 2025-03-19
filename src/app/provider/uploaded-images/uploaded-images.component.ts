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
			this.currentUserName = user.email; // ✅ Retrieve email instead of userName
		}
	
		if (!this.currentUserName) {
			console.error("❌ ERROR: No logged-in user found.");
		} else {
			console.log("✅ Logged-in User Email:", this.currentUserName);
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
						uploadedBy: file.uploadedBy || "Unknown",
						uploadedOn: file.uploadedOn || "N/A",
						tags: file.tags || []  // <-- Assign tags properly
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

	// 📌 Share an image with a patient
	shareImage(imageName: string) {
		const patientEmail = prompt("Enter the patient's email address:");
		if (!patientEmail) return;
	
		const expiresIn = 86400; // 1 day in seconds
	
		this.s3Service.shareFile(imageName, this.currentUserName ?? "Unknown", patientEmail, expiresIn).subscribe(
			(res) => {
				alert(`Image shared successfully with ${patientEmail}`);
				console.log("Shared Link:", res.viewUrl);
			},
			(error) => {
				console.error("❌ ERROR: Failed to share image", error);
				alert("Failed to share image. Please try again.");
			}
		);
	}	

	// 📌 Delete Image
	deleteImage(imageName: string) {
		if (confirm(`Are you sure you want to delete ${imageName}?`)) {
			this.s3Service.deleteFile(imageName).subscribe(
				(res) => {
					alert("File deleted successfully!");
					this.fetchUploadedImages(); // 🔄 Refresh file list after deletion
				},
				(error) => {
					console.error("❌ ERROR: Failed to delete file", error);
					alert("Failed to delete file. Please try again.");
				}
			);
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
		if (!this.pendingFile || !this.currentUserName) {
			alert("You must be logged in and select a file to upload.");
			return;
		}
	
		const fileName = this.pendingFile.name;
		const fileType = this.pendingFile.type;
		const uploadedBy = this.currentUserName;
		const tags = this.newFileTags ? this.newFileTags.split(",").map(tag => tag.trim()) : []; // Convert tags to array
	
		this.s3Service.uploadFile(fileName, fileType, uploadedBy, tags).subscribe(
			(res) => {
				if (res.uploadUrl) {
					fetch(res.uploadUrl, {
						method: "PUT",
						body: this.pendingFile,
						headers: { "Content-Type": fileType },
					})
						.then(() => {
							alert("File uploaded successfully!");
							this.fetchUploadedImages(); // 🔥 Refresh file list
							this.resetUploadForm();
						})
						.catch((err) => console.error("❌ Upload error:", err));
				}
			},
			(error) => {
				console.error("❌ ERROR: Failed to upload file", error);
				alert("Failed to upload file. Please try again.");
			}
		);
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

		// 🔥 Ensure input field resets properly
		if (this.fileInput && this.fileInput.nativeElement) {
			this.fileInput.nativeElement.value = "";
		}

		this.isDragging = false;
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

	// 📌 Open Share Modal
	openShareModal(imageName: string) {
		const patientEmail = prompt("Enter patient's email:");
		if (!patientEmail) return;

		this.s3Service
			.shareFile(imageName, this.currentUserName || "", patientEmail, 86400)
			.subscribe(
				(response) => {
					alert(`File shared successfully! Link: ${response.viewUrl}`);
				},
				(error) => {
					console.error("Sharing failed", error);
				}
			);
	}

	updateTags(fileName: string, tags: string) {
		this.s3Service.updateFileTags(fileName, tags).subscribe(
			() => console.log(`✅ Tags updated for ${fileName}`),
			(error) => console.error("❌ ERROR: Failed to update tags", error)
		);
	}
	
}