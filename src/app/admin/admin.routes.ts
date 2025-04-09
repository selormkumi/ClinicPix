import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ManageUsersComponent } from "./manage-users/manage-users.component";
import { AuditComponent } from "./audit/audit.component";
import { AuthGuard } from "../shared/guards/auth.guard";

export const ADMIN_ROUTES: Routes = [
	{
		path: "",
		component: DashboardComponent,
		canActivate: [AuthGuard],
		data: { role: "admin" } // ✅ Enforce role check
	},
	{
		path: "dashboard",
		component: DashboardComponent,
		canActivate: [AuthGuard],
		data: { role: "admin" }
	},
	{
		path: "manage-users",
		component: ManageUsersComponent,
		canActivate: [AuthGuard],
		data: { role: "admin" }
	},
	{
		path: "audit",
		component: AuditComponent,
		canActivate: [AuthGuard],
		data: { role: "admin" }
	}
];