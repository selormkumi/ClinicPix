import { Component, ViewChild, ElementRef } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthenticationService } from "../../shared/services/authentication.service";

@Component({
	selector: "app-uploaded-images",
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule],
	templateUrl: "./uploaded-images.component.html",
	styleUrl: "./uploaded-images.component.scss",
})
export class UploadedImagesComponent {
	currentUserFullName: string | null = null;

	uploadedImages = [
		{ name: "CT_Scan_2025.jpg", uploadedBy: "John Doe", uploadedOn: "2025-01-15", tags: ["CT", "Scan"] },
		{ name: "MRI_Brain_2025.jpg", uploadedBy: "Jane Smith", uploadedOn: "2025-01-10", tags: ["MRI", "Brain"] },
	];

	newFileName: string = "";
	newFileTags: string = "";
	pendingFile: File | null = null; // Stores the dragged file for confirmation
	isDragging = false; // Tracks drag-over state for UI effect

	@ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

	constructor(private authService: AuthenticationService, private router: Router) {}

	ngOnInit() {
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserFullName = user.fullName;
		}
	}

	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]);
	}

	viewImage(imageName: string) {
		alert(`Viewing: ${imageName}`);
	}

	editImage(imageName: string) {
		alert(`Editing: ${imageName}`);
	}

	shareImage(imageName: string) {
		alert(`Sharing: ${imageName}`);
	}

	deleteImage(imageName: string) {
		if (confirm(`Are you sure you want to delete ${imageName}?`)) {
			this.uploadedImages = this.uploadedImages.filter((img) => img.name !== imageName);
		}
	}

	triggerFileInput() {
		this.fileInput.nativeElement.click();
	}

	uploadImage(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			this.pendingFile = input.files[0];
			this.newFileName = this.pendingFile.name; // Prefill the file name field
		}
	}

	confirmUpload() {
		if (this.pendingFile) {
			const newImage = {
				name: this.newFileName.trim() || this.pendingFile.name,
				uploadedBy: this.currentUserFullName || "Unknown",
				uploadedOn: new Date().toISOString().split("T")[0],
				tags: this.newFileTags.split(",").map((tag) => tag.trim()),
			};
			this.uploadedImages.push(newImage);
			this.resetUploadForm();
		}
	}

	// Drag & Drop Functions
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
			this.newFileName = this.pendingFile.name; // Prefill file name field
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
}
