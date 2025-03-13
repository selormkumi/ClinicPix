import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideRouter } from "@angular/router";
import { routes } from "./app/app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { AuthInterceptor } from "./app/shared/interceptors/auth.interceptor";
import { Amplify } from "aws-amplify";
import { awsconfig } from "./aws-exports";

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolId: "ap-south-1_xxxxx",
			userPoolClientId: "71h7gnxxxxxxxxx",
		},
	},
});

bootstrapApplication(AppComponent, {
	providers: [
		provideRouter(routes),
		provideHttpClient(withInterceptors([AuthInterceptor])),
		provideAnimationsAsync(),
	],
}).catch((err) => console.error(err));
