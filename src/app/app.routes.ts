import { Routes } from "@angular/router";
import { LandingComponent } from "./landing/landing.component";
export const routes: Routes = [
	{ path: "", component: LandingComponent },
	{
		path: "auth",
		loadChildren: () => import("./auth/auth.routes").then((m) => m.AUTH_ROUTES),
	},
	{
		path: "provider",
		loadChildren: () =>
			import("./provider/provider.routes").then((m) => m.PROVIDER_ROUTES),
	},
	{
		path: "patient",
		loadChildren: () =>
			import("./patient/patient.routes").then((m) => m.PATIENT_ROUTES),
	},
	{
		path: "admin",
		loadChildren: () =>
			import("./admin/admin.routes").then((m) => m.ADMIN_ROUTES),
	},
	// { path: "", redirectTo: "/auth/login", pathMatch: "full" },
	{ path: "**", redirectTo: "/auth/login" },
];
