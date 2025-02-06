import { Component } from "@angular/core";
import { Router } from "@angular/router";
@Component({
	selector: "app-login",
	imports: [],
	templateUrl: "./login.component.html",
	styleUrl: "./login.component.scss",
})
export class LoginComponent {
	constructor(private router: Router) {}
	onLogin() {
		alert("Login successful!");
		this.router.navigate(["/home"]); // redirect to home page is not working
	}
}
