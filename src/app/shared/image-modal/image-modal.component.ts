import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
	selector: "app-image-modal",
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: "./image-modal.component.html",
	styleUrl: "./image-modal.component.scss",
})
export class ImageModalComponent {
	@Input() image: any | null = null; // Image data (name, tags, etc.)
	@Input() isEditing: boolean = false; // Determines if in edit mode
	@Output() closeModal = new EventEmitter<void>(); // Event to close modal
	@Output() saveChanges = new EventEmitter<any>(); // Event to save changes

	editedImageName: string = "";
	editedTags: string = "";

	ngOnChanges() {
		if (this.image) {
			this.editedImageName = this.image.name;
			this.editedTags = this.image.tags ? this.image.tags.join(", ") : "";
		}
	}

	save() {
		this.saveChanges.emit({
			name: this.editedImageName,
			tags: this.editedTags.split(",").map((tag) => tag.trim()),
		});
	}

	close() {
		this.closeModal.emit();
	}
}
