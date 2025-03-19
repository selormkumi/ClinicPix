import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { ImageModalComponent } from "../../shared/image-modal/image-modal.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { S3FileService } from "../../shared/services/s3-file.service";

@Component({
	selector: "app-my-records",
	imports: [RouterModule, CommonModule, FormsModule, ImageModalComponent],
	standalone: true,
	templateUrl: "./my-records.component.html",
	styleUrl: "./my-records.component.scss",
})
export class MyRecordsComponent implements OnInit {
	sharedImages: any[] = [];
	filteredRecords: any[] = [];
	uniqueTags: string[] = [];
	searchQuery: string = "";
	selectedTag: string = "";
	selectedImage: any | null = null;
	isEditing: boolean = false;
	currentUserEmail: string = "";

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private s3Service: S3FileService
	) {}

	ngOnInit() {
		console.log("📌 Initializing My Records Component...");
	
		const currentUser = localStorage.getItem("user");
		if (currentUser) {
			const user = JSON.parse(currentUser);
			this.currentUserEmail = user.email;
			console.log("✅ Current Patient Email:", this.currentUserEmail);
		} else {
			console.error("❌ ERROR: No user found in localStorage");
		}
	
		// 🔥 Call the function to fetch shared files
		this.fetchSharedFiles();
	}	

	// 📌 Fetch shared files for the logged-in patient
	fetchSharedFiles() {
		console.log("📌 Fetching shared files for:", this.currentUserEmail);
	
		this.s3Service.getSharedFiles(this.currentUserEmail).subscribe(
			(res) => {
				console.log("✅ DEBUG: Shared Files Response:", res);
	
				if (!res.sharedFiles || res.sharedFiles.length === 0) {
					console.log("❌ No shared files received from backend");
				}
	
				this.sharedImages = res.sharedFiles.map((file: any) => ({
					name: file.file_name,
					sharedBy: file.uploaded_by,
					sharedOn: file.shared_on || "N/A",
					expiresAt: file.expires_at || "N/A",
					tags: file.tags ? file.tags.split(",") : ["No tags"]
				}));
	
				this.filteredRecords = [...this.sharedImages];
	
				console.log("📌 Updated Shared Images List:", this.sharedImages);
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch shared files", error);
			}
		);
	}		

	// 📌 View Image (Generate signed URL)
	viewImage(image: any) {
		this.s3Service.getFileUrl(image.name).subscribe((res) => {
			window.open(res.viewUrl, "_blank");
		});
	}

	closeModal() {
		this.selectedImage = null;
	}

	// 📌 Filter records based on search query and tags
	filterRecords(): void {
		this.filteredRecords = this.sharedImages.filter((record) => {
			const matchesSearch =
				record.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
				record.sharedBy.toLowerCase().includes(this.searchQuery.toLowerCase());

			const matchesTag = this.selectedTag
				? record.tags.includes(this.selectedTag)
				: true;

			return matchesSearch && matchesTag;
		});
	}

	// 📌 Download the shared image
	downloadImage(image: any): void {
		this.s3Service.getFileUrl(image.name).subscribe((res) => {
			const link = document.createElement("a");
			link.href = res.viewUrl;
			link.download = image.name;
			link.click();
		});
	}

	// 📌 Logout the user
	logout() {
		this.authService.logout();
		this.router.navigate(["/login"]); // Redirect to login after logout
	}
}
