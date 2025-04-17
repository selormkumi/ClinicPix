import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
import { S3FileService } from "../../shared/services/s3-file.service";
import { MatSnackBar } from '@angular/material/snack-bar';

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

  assignedPatients: any[] = [];
  selectedPatientEmail: string = "";

  showDeleteModal: boolean = false;
  imageToDelete: any = null;

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private s3Service: S3FileService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentUserId = Number(user.userId) || 0;
      this.currentUserName = user.username || null;
    }

    this.fetchUploadedImages();
    this.loadAssignedPatients();
  }

  fetchUploadedImages() {
    this.isLoading = true;
  
    this.s3Service.getUploadedFiles(this.currentUserId).subscribe(
      (res) => {
        this.uploadedImages = res.files
          .map((file: any) => ({
            name: file.fileName || "Unknown File",
            uploadedBy: file.uploadedBy || "Unknown",
            uploaderEmail: file.uploaderEmail || "",
            rawUploadedOn: file.uploadedOn, // used for sorting
            uploadedOn: file.uploadedOn
              ? new Date(file.uploadedOn).toLocaleString("en-US", {
                  timeZone: "America/New_York",
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })
              : "N/A",
            tags: Array.isArray(file.tags) ? file.tags : [],
            showDropdown: false,
          }))
          .sort((a: any, b: any) => new Date(b.rawUploadedOn).getTime() - new Date(a.rawUploadedOn).getTime());
  
        this.isLoading = false;
      },
      (error) => {
        console.error("❌ ERROR: Failed to fetch uploaded files", error);
        this.isLoading = false;
      }
    );
  }  

  loadAssignedPatients() {
    this.s3Service.getPatientsByProvider(this.currentUserId).subscribe(
      (res) => {
        this.assignedPatients = res.patients || [];
      },
      (error) => {
        console.error("❌ Failed to load assigned patients:", error);
      }
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }

  viewImage(fileName: string) {
    this.s3Service.getFileUrl(fileName, this.currentUserId).subscribe(
      (res) => {
        this.selectedImage = {
          name: fileName,
          viewUrl: res.viewUrl,
        };
      },
      (error) => {
        console.error("❌ ERROR: Failed to generate view URL", error);
        this.snackBar.open("Unable to view image. Try again.");
      }
    );
  }

  toggleShareDropdown(image: any) {
    this.uploadedImages.forEach((img) => {
      if (img !== image) img.showDropdown = false;
    });
    image.showDropdown = !image.showDropdown;
  }

  shareImageToPatient(image: any) {
    const selected = this.assignedPatients.find((p) => p.email === this.selectedPatientEmail);
    if (!selected) {
      this.snackBar.open("Please select a valid patient.");
      return;
    }

    const expiresIn = 86400;
    this.s3Service.shareFile(image.name, this.currentUserId, selected.id, expiresIn).subscribe(
      () => {
        this.snackBar.open("✅ Image shared successfully!");
        image.showDropdown = false;
        this.selectedPatientEmail = "";
      },
      (err) => {
        console.error("❌ Failed to share image", err);
        this.snackBar.open("❌ Failed to share image.");
      }
    );
  }

  shareImage(imageName: string, patientId: number) {
    if (!patientId || patientId === 0) {
      this.snackBar.open("Invalid user ID for sharing.");
      return;
    }

    const expiresIn = 86400;

    this.s3Service.shareFile(imageName, this.currentUserId, patientId, expiresIn).subscribe(
      (res) => {
        this.snackBar.open(`✅ Image shared successfully with User ID: ${patientId}`);
        console.log("Shared Link:", res.viewUrl);
      },
      (error) => {
        console.error("❌ ERROR: Failed to share image", error);
        this.snackBar.open("Failed to share image. Please try again.");
      }
    );
  }

  deleteImage(image: any) {
  this.imageToDelete = image;
  this.showDeleteModal = true;
}

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

  confirmDelete() {
    if (!this.imageToDelete) return;
  
    this.s3Service.deleteFile(this.imageToDelete.name, this.currentUserId).subscribe(
      () => {
        this.snackBar.open("✅ File deleted successfully!");
        this.fetchUploadedImages();
      },
      (error) => {
        console.error("❌ ERROR: Failed to delete file", error);
        this.snackBar.open("Failed to delete file. Please try again.");
      }
    );
  
    this.showDeleteModal = false;
    this.imageToDelete = null;
  }
  
  cancelDelete() {
    this.showDeleteModal = false;
    this.imageToDelete = null;
  }  

  confirmUpload() {
    if (!this.pendingFile) {
      this.snackBar.open("Please select a file to upload.");
      return;
    }

    if (!this.currentUserId || this.currentUserId === 0) {
      this.snackBar.open("You must be logged in to upload files.");
      return;
    }

    const fileName = this.pendingFile.name;
    const fileType = this.pendingFile.type;
    const tags = this.newFileTags ? this.newFileTags.split(",").map(tag => tag.trim()) : [];

    this.s3Service.uploadFile(fileName, fileType, this.currentUserId, tags).subscribe(
      (res) => {
        if (res.uploadUrl) {
          fetch(res.uploadUrl, {
            method: "PUT",
            mode: "cors",
            headers: new Headers({
              "Content-Type": fileType,
              "x-amz-server-side-encryption": "aws:kms",
              "x-amz-server-side-encryption-aws-kms-key-id": "arn:aws:kms:us-east-2:135808935445:key/a507c38c-1440-434c-8ef0-db8f40ad7018"
            }),
            body: this.pendingFile
          })
                  
            .then(() => {
              this.snackBar.open("✅ File uploaded successfully!");
              this.fetchUploadedImages();
              this.resetUploadForm();
            })
            .catch((err) => {
              console.error("❌ Upload error:", err);
              this.snackBar.open("Upload failed. Please try again.");
            });
        }
      },
      (error) => {
        console.error("❌ ERROR: Failed to upload file", error);
        this.snackBar.open("Failed to upload file. Please try again.");
      }
    );
  }

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

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = "";
    }

    this.isDragging = false;
  }

  closeModal() {
    this.selectedImage = null;
    this.isEditing = false;
  }

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
