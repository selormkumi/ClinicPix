import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { MyRecordsComponent } from "./my-records/my-records.component";
import { ProfileComponent } from "./profile/profile.component";
import { AuthGuard } from "../shared/guards/auth.guard";

export const PATIENT_ROUTES: Routes = [
	{
		path: "",
		component: DashboardComponent,
		canActivate: [AuthGuard],
		data: { role: "patient" }, // Restrict to patients only
	},
	{
		path: "dashboard",
		component: DashboardComponent,
		canActivate: [AuthGuard],
		data: { role: "patient" },
	},
	{
		path: "my-records",
		component: MyRecordsComponent,
		canActivate: [AuthGuard],
		data: { role: "patient" },
	},
	{
		path: "profile",
		component: ProfileComponent,
		canActivate: [AuthGuard],
		data: { role: "patient" },
	},
];
