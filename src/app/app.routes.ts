import { Routes } from "@angular/router";

export const routes: Routes = [
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
	{ path: "", redirectTo: "/", pathMatch: "full" },
	{ path: "**", redirectTo: "/auth/login" },
];
