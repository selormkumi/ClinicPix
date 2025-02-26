import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { PatientsComponent } from "./patients/patients.component";
import { UploadedImagesComponent } from "./uploaded-images/uploaded-images.component";
import { ProfileComponent } from "./profile/profile.component";
import { AuthGuard } from "../shared/guards/auth.guard";
import { SharedImagesComponent } from "./shared-images/shared-images.component";

export const PROVIDER_ROUTES: Routes = [
	{
		path: "",
		component: DashboardComponent,
		canActivate: [AuthGuard],
		data: { role: "provider" }, // Restrict to providers
	},
	{
		path: "dashboard",
		component: DashboardComponent,
		canActivate: [AuthGuard],
		data: { role: "provider" },
	},
	{
		path: "patients",
		component: PatientsComponent,
		canActivate: [AuthGuard],
		data: { role: "provider" },
	},
	{
		path: "uploaded-images",
		component: UploadedImagesComponent,
		canActivate: [AuthGuard],
		data: { role: "provider" },
	},
	{
		path: "shared-images",
		component: SharedImagesComponent,
		canActivate: [AuthGuard],
		data: { role: "provider" },
	},
	{
		path: "profile",
		component: ProfileComponent,
		canActivate: [AuthGuard],
		data: { role: "provider" },
	},
];
