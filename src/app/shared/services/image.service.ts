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
		{
			name: "Ultrasound_Heart_2025.jpg",
			uploadedOn: "2025-02-01",
			tags: "Ultrasound, Heart",
			url: "assets/images/ultrasound_heart_2025.jpg",
		},
	];

	getImageRecords() {
		return this.imageRecords;
	}

	generateShareableLink(record: any): string {
		const expirationTime = new Date().getTime() + 10 * 60 * 1000; // 10 minutes from now
		const uniqueToken = Math.random().toString(36).substr(2, 9);
		const link = `https://yourapp.com/shared/${uniqueToken}?image=${encodeURIComponent(
			record.url
		)}&expires=${expirationTime}`;

		// Store link and expiration in localStorage
		const sharedLinks = JSON.parse(localStorage.getItem("sharedLinks") || "{}");
		sharedLinks[uniqueToken] = { url: record.url, expires: expirationTime };
		localStorage.setItem("sharedLinks", JSON.stringify(sharedLinks));

		return link;
	}

	validateSharedLink(token: string): boolean {
		const sharedLinks = JSON.parse(localStorage.getItem("sharedLinks") || "{}");
		if (!sharedLinks[token]) return false;

		const { expires } = sharedLinks[token];
		const currentTime = new Date().getTime();
		if (currentTime > expires) {
			delete sharedLinks[token]; // Remove expired link
			localStorage.setItem("sharedLinks", JSON.stringify(sharedLinks));
			return false;
		}
		return true;
	}
}
