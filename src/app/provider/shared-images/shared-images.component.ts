import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
@Component({
	selector: "app-shared-images",
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, ImageModalComponent],
	templateUrl: "./shared-images.component.html",
	styleUrl: "./shared-images.component.scss",
})
export class SharedImagesComponent {
	searchTerm: string = ""; // Holds the search term entered by the user
	filteredImages: any[] = []; // Array that holds the filtered shared images
	selectedImage: any = null; // Holds the selected image for the modal

	sharedImages = [
		{
			name: "CT_Scan_2025.jpg",
			sharedBy: "Dr. Smith",
			sharedOn: "2025-01-20",
			tags: ["CT Scan", "Abdomen"],
		},
		{
			name: "Ultrasound_Heart.jpg",
			sharedBy: "Dr. Lee",
			sharedOn: "2025-01-18",
			tags: ["Ultrasound", "Heart"],
		},
	];

	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {
		this.filteredImages = this.sharedImages;
	}
	ngOnInit() {}
	onSearch() {
		if (this.searchTerm.trim() === "") {
			this.filteredImages = this.sharedImages; // Show all images if the search term is empty
		} else {
			this.filteredImages = this.sharedImages.filter(
				(image) =>
					image.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
					image.sharedBy
						.toLowerCase()
						.includes(this.searchTerm.toLowerCase()) ||
					image.sharedOn
						.toLowerCase()
						.includes(this.searchTerm.toLowerCase()) ||
					image.tags.some((tag) =>
						tag.toLowerCase().includes(this.searchTerm.toLowerCase())
					)
			);
		}
	}
	viewImage(image: any) {
		this.selectedImage = image;
	}

	closeModal() {
		this.selectedImage = null;
	}
	revokeAccess(image: any) {
		alert(`Access to ${image.name} has been revoked.`);
	}

	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}
