import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { AdminService } from "../../shared/services/admin.service"; // ✅ your admin service
import { ToastrService } from 'ngx-toastr';
@Component({
	selector: "app-manage-users",
	standalone: true,
	imports: [RouterModule, FormsModule, CommonModule],
	templateUrl: "./manage-users.component.html",
	styleUrl: "./manage-users.component.scss",
})
export class ManageUsersComponent implements OnInit {
	searchTerm: string = "";
	users: any[] = [];
	filteredUsers: any[] = [];
	isLoading: boolean = false;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		private adminService: AdminService,
		private toastr: ToastrService
	) {}

	ngOnInit() {
		this.fetchUsers();
	}

	// ✅ Fetch users from backend
	fetchUsers() {
		this.isLoading = true;
		this.adminService.getAllUsers().subscribe(
			(res) => {
				this.users = res;
				this.filteredUsers = [...res];
				this.isLoading = false;
			},
			(error) => {
				console.error("❌ ERROR: Failed to fetch users", error);
				this.isLoading = false;
			}
		);
	}

	// ✅ Filter users by search
	onSearch() {
		const query = this.searchTerm.toLowerCase();
		this.filteredUsers = this.users.filter(
			(user) =>
				user.username.toLowerCase().includes(query) ||
				user.email.toLowerCase().includes(query)
		);
	}

	// ✅ Logout
	logout() {
		this.authService.logout();
		this.router.navigate(["/auth/login"]);
	}

	// ✅ Toggle user active status
	toggleUserStatus(user: any) {
		const action = user.is_active ? this.adminService.deactivateUser : this.adminService.activateUser;
	  
		action.call(this.adminService, user.id).subscribe({
		  next: () => {
			user.is_active = !user.is_active;
			this.toastr.success(`User ${user.is_active ? 'activated' : 'deactivated'} successfully`);
		  },
		  error: () => {
			this.toastr.error('Action failed');
		  }
		});
	  }	  

	// ✅ Placeholder for reset password
	resetPassword(user: any) {
		console.log("🔐 Resetting password for:", user.email);
		// Future: Trigger backend to send reset email or auto-generate password
	}
}