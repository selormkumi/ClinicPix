import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideRouter, withEnabledBlockingInitialNavigation } from "@angular/router";
import { routes } from "./app/app.routes";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { AuthInterceptor } from "./app/shared/interceptors/auth.interceptor";
import { provideToastr } from "ngx-toastr";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withEnabledBlockingInitialNavigation() // ✅ Prevent blank screen on direct route load
    ),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideAnimationsAsync(), // ✅ Required for both Toastr and Snackbar
    provideToastr({
      positionClass: "toast-top-right",
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
    }),
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 3000, // ✅ Auto-dismiss after 3s globally
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      },
    },
  ],
}).catch((err) => console.error(err));