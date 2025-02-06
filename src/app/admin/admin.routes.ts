import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ManageUsersComponent } from "./manage-users/manage-users.component";
import { ManageImagesComponent } from "./manage-images/manage-images.component";
import { AuditComponent } from "./audit/audit.component";
import { AuthGuard } from "../shared/guards/auth.guard";

export const ADMIN_ROUTES: Routes = [
	{ path: "", component: HomeComponent, canActivate: [AuthGuard] },
	{
		path: "manage-users",
		component: ManageUsersComponent,
		canActivate: [AuthGuard],
	},
	{
		path: "manage-images",
		component: ManageImagesComponent,
		canActivate: [AuthGuard],
	},
	{ path: "audit", component: AuditComponent, canActivate: [AuthGuard] },
];
