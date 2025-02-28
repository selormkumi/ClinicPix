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

	selectedImage: any | null = null;

	constructor(
		private authService: AuthenticationService,
		private router: Router
	) {}
	ngOnInit() {}

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
