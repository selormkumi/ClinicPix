import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { PatientsComponent } from "./patients/patients.component";
import { UploadedImagesComponent } from "./uploaded-images/uploaded-images.component";
import { ProfileComponent } from "./profile/profile.component";
import { AuthGuard } from "../shared/guards/auth.guard";

export const PROVIDER_ROUTES: Routes = [
	{ path: "", component: DashboardComponent, canActivate: [AuthGuard] },
	{
		path: "dashboard",
		component: DashboardComponent,
		canActivate: [AuthGuard],
	},
	{ path: "patients", component: PatientsComponent, canActivate: [AuthGuard] },
	{
		path: "uploaded-images",
		component: UploadedImagesComponent,
		canActivate: [AuthGuard],
	},
	{ path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },
];
