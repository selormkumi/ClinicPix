import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageService } from "../../shared/services/image.service";
import { CommonModule } from "@angular/common";
@Component({
	selector: "app-my-records",
	imports: [RouterModule, CommonModule],
	templateUrl: "./my-records.component.html",
	styleUrl: "./my-records.component.scss",
})
export class MyRecordsComponent implements OnInit {
	currentUserFullName: string | null = null;
	imageRecords: any[] = [];
	selectedImage: string | null = null;
	sharedLink: string | null = null;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private imageService: ImageService
	) {}

	ngOnInit() {
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserFullName = user.fullName;
		}
		this.loadImageRecords();
	}

	loadImageRecords() {
		this.imageRecords = this.imageService.getImageRecords();
	}

	viewImage(record: any): void {
		this.selectedImage = record.url; // Assuming each record has a 'url' property
	}
	closeViewer(): void {
		this.selectedImage = null;
	}

	shareImage(record: any): void {
		this.sharedLink = this.imageService.generateShareableLink(record);
	}

	copyToClipboard(): void {
		if (this.sharedLink) {
			navigator.clipboard.writeText(this.sharedLink).then(() => {
				alert("Link copied to clipboard!");
			});
		}
	}

	closeShareModal(): void {
		this.sharedLink = null;
	}

	//  The `logout` function logs the user out and redirects them to the login page.
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}
