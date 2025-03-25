import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { ManageUsersComponent } from "./manage-users/manage-users.component";
import { AuditComponent } from "./audit/audit.component";
import { AuthGuard } from "../shared/guards/auth.guard";

export const ADMIN_ROUTES: Routes = [
	{ path: "", component: HomeComponent, canActivate: [AuthGuard] },
	{
		path: "manage-users",
		component: ManageUsersComponent,
		canActivate: [AuthGuard],
	},

	{ path: "audit", component: AuditComponent, canActivate: [AuthGuard] },
];
