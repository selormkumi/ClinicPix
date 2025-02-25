import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageService } from "../../shared/services/image.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
@Component({
	selector: "app-my-records",
	imports: [RouterModule, CommonModule, FormsModule],
	standalone: true,
	templateUrl: "./my-records.component.html",
	styleUrl: "./my-records.component.scss",
})
export class MyRecordsComponent implements OnInit {
	currentUserFullName: string | null = null;
	imageRecords: any[] = [];
	filteredRecords: any[] = [];
	uniqueTags: string[] = [];
	searchQuery: string = "";
	selectedTag: string = "";
	selectedImage: string | null = null;
	sharedLink: string | null = null;
	linkExpired: boolean = false;

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

	loadImageRecords(): void {
		this.imageRecords = this.imageService.getImageRecords();
		this.filteredRecords = [...this.imageRecords];

		// Extract unique tags for filtering
		this.uniqueTags = Array.from(
			new Set(this.imageRecords.flatMap((record) => record.tags.split(", ")))
		);
	}

	filterRecords(): void {
		this.filteredRecords = this.imageRecords.filter((record) => {
			const matchesSearch =
				record.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				record.tags.toLowerCase().includes(this.searchQuery.toLowerCase());

			const matchesTag = this.selectedTag
				? record.tags.includes(this.selectedTag)
				: true;

			return matchesSearch && matchesTag;
		});
	}

	viewImage(record: any): void {
		this.selectedImage = record.url; // Assuming each record has a 'url' property
	}
	closeViewer(): void {
		this.selectedImage = null;
	}

	shareImage(record: any): void {
		this.sharedLink = this.imageService.generateShareableLink(record);
		this.linkExpired = false; // Reset expired flag when generating a new link
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
		this.linkExpired = false;
	}

	checkLink(token: string): void {
		this.linkExpired = !this.imageService.validateSharedLink(token);
	}

	downloadImage(record: any): void {}

	//  The `logout` function logs the user out and redirects them to the login page.
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}
