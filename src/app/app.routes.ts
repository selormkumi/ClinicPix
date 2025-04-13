import { Routes } from "@angular/router";
import { LandingComponent } from "./landing/landing.component";
import { AuthGuard } from "./shared/guards/auth.guard"; // ✅ Ensure guard is imported

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
		canActivate: [AuthGuard], // ✅ Protect provider routes
		data: { role: "provider" }, // ✅ Ensure only providers can access
	},
	{
		path: "patient",
		loadChildren: () =>
			import("./patient/patient.routes").then((m) => m.PATIENT_ROUTES),
		canActivate: [AuthGuard], // ✅ Protect patient routes
		data: { role: "patient" }, // ✅ Ensure only patients can access
	},
	{
		path: "admin",
		loadChildren: () =>
			import("./admin/admin.routes").then((m) => m.ADMIN_ROUTES),
		canActivate: [AuthGuard], // ✅ Protect admin routes
		data: { role: "admin" },
	},

	{
		path: "forgot-password",
		loadComponent: () =>
			import("./auth/forgot-password/forgot-password.component").then(
				(m) => m.ForgotPasswordComponent
			),
	},

	{
		path: "reset-password",
		loadComponent: () =>
			import("./auth/reset-password/reset-password.component").then(
				(m) => m.ResetPasswordComponent
			),
	},

	{ path: "**", redirectTo: "/auth/login" },
];
