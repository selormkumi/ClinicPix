import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const AUTH_ROUTES: Routes = [
	{ path: "login", component: LoginComponent },
	{ path: "signup", component: SignupComponent },
	{ path: 'forgot-password', component: ForgotPasswordComponent },
];
