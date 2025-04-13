import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideRouter, withEnabledBlockingInitialNavigation } from "@angular/router";
import { routes } from "./app/app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { AuthInterceptor } from "./app/shared/interceptors/auth.interceptor";
import { provideToastr } from "ngx-toastr";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation() // ✅ Prevent blank screen on direct route load
    ),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideAnimationsAsync(),
    provideToastr({
      positionClass: "toast-top-right",
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
  ],
}).catch((err) => console.error(err));