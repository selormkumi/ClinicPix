import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { MyRecordsComponent } from "./my-records/my-records.component";
import { UploadedImagesComponent } from "./uploaded-images/uploaded-images.component";
import { ProfileComponent } from "./profile/profile.component";
import { AuthGuard } from "../shared/guards/auth.guard";

export const PATIENT_ROUTES: Routes = [
	{ path: "", component: HomeComponent, canActivate: [AuthGuard] },
	{
		path: "my-records",
		component: MyRecordsComponent,
		canActivate: [AuthGuard],
	},
	{
		path: "uploaded-images",
		component: UploadedImagesComponent,
		canActivate: [AuthGuard],
	},
	{ path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },
];
