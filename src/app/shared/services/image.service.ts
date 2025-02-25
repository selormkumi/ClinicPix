import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class ImageService {
	private imageRecords = [
		{
			name: "X-ray_2025.jpg",
			uploadedOn: "2025-01-15",
			tags: "X-ray, Chest",
			url: "https://medlineplus.gov/images/Xray_share.jpg",
		},
		{
			name: "MRI_Brain_2025.jpg",
			uploadedOn: "2025-01-10",
			tags: "MRI, Brain",
			url: "assets/images/mri_brain_2025.jpg",
		},
	];

	getImageRecords() {
		return this.imageRecords;
	}

	generateShareableLink(record: any): string {
		const expirationTime = new Date();
		expirationTime.setMinutes(expirationTime.getMinutes() + 10); // Link expires in 10 minutes
		const uniqueToken = Math.random().toString(36).substr(2, 9);
		return `https://yourapp.com/shared/${uniqueToken}?image=${encodeURIComponent(
			record.url
		)}&expires=${expirationTime.getTime()}`;
	}
}
