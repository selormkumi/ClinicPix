import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageService, ImageItem } from "../../shared/services/image.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
 
@Component({
  selector: "app-uploaded-images",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageModalComponent],
  templateUrl: "./uploaded-images.component.html",
  styleUrl: "./uploaded-images.component.scss",
})

export class UploadedImagesComponent implements OnInit {
  currentUserName: string | null = null;
  selectedImage: ImageItem | null = null;
  isEditing: boolean = false;
  isLoading: boolean = false;
  uploadedImages: ImageItem[] = [];
  filteredImages: ImageItem[] = [];
  searchTerm: string = "";
  newFileName: string = "";
  newFileTags: string = "";
  pendingFile: File | null = null;
  isDragging = false;
  uploadError: string | null = null;
 
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;
  constructor(
    private authService: AuthenticationService,
    private imageService: ImageService,
    private router: Router
  ) {}
 
  ngOnInit() {
    // Get current user

    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.currentUserName = user.userName;
    }
 
    // Subscribe to image service loading state

    this.imageService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
 
    // Subscribe to image list changes

    this.imageService.images$.subscribe(images => {
      this.uploadedImages = images;
      this.onSearch(); // Apply any existing search filter
    });
 
    // Load images on init

    this.loadImages();
  }
 
  async loadImages() {
    await this.imageService.listImages();
  }
 
  onSearch() {
    if (this.searchTerm.trim() === "") {
      this.filteredImages = this.uploadedImages;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredImages = this.uploadedImages.filter(
        (image) =>
          image.name.toLowerCase().includes(searchTermLower) ||
          image.uploadedBy.toLowerCase().includes(searchTermLower) ||
          image.uploadedOn.toLowerCase().includes(searchTermLower) ||
          image.tags.some((tag) => tag.toLowerCase().includes(searchTermLower))
      );
    }
  }
 
  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
 
  async viewImage(image: ImageItem) {
    this.selectedImage = image;
    this.isEditing = false;
  }
 
  async editImage(image: ImageItem) {
    // Get the latest image details

    const updatedImage = await this.imageService.getImageDetails(image.key);
    if (updatedImage) {
      this.selectedImage = updatedImage;
      this.isEditing = true;
    }
  }
 
  saveChanges(updatedImage: any) {
    // Note: For updating metadata, you would need additional 

    // implementation in the ImageService
    this.loadImages(); // Refresh the list
    this.selectedImage = null;
  }
 
  closeModal() {
    this.selectedImage = null;
  }
 
  shareImage(imageName: string) {
    // Implement sharing functionality
    alert(`Sharing: ${imageName}`);

  }
 
  async deleteImage(key: string) {
    if (confirm(`Are you sure you want to delete this image?`)) {
      const success = await this.imageService.deleteImage(key);
      if (!success) {
        alert('Failed to delete image. Please try again.');
      }
    }
  }
 
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
 
  uploadImage(event: Event) {
    this.uploadError = null;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.uploadError = 'Please select an image file.';
        return;
      }

      // Validate file size (5MB limit)

      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'File size must be less than 5MB.';
        return;
      }

      this.pendingFile = file;
      this.newFileName = this.pendingFile.name;
    }
  }
 
  async confirmUpload() {
    this.uploadError = null;
    if (!this.pendingFile) {
      this.uploadError = 'Please select a file to upload.';
      return;
    }

    if (!this.newFileName.trim()) {
      this.uploadError = 'Please enter a file name.';
      return;
    }

    const success = await this.imageService.uploadImage(
      this.pendingFile,
      this.newFileName.trim(),
      this.newFileTags,
      this.currentUserName || 'Unknown'
    );

    if (success) {
      this.resetUploadForm();
    } else {
      this.uploadError = 'Failed to upload image. Please try again.';
    }
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
    this.uploadError = null;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.uploadError = 'Please select an image file.';
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'File size must be less than 5MB.';
        return;
      }

      this.pendingFile = file;
      this.newFileName = this.pendingFile.name;
    }
  }
 
  resetUploadForm() {
    this.pendingFile = null;
    this.newFileName = "";
    this.newFileTags = "";
    this.uploadError = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = "";
    }
  }
}
