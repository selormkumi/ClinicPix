import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { AdminService } from "../../shared/services/admin.service";
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

  // ✅ Modal State
  showResetModal: boolean = false;
  userToReset: any = null;

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
    const action = user.is_active
      ? this.adminService.deactivateUser
      : this.adminService.activateUser;

    action.call(this.adminService, user.id).subscribe({
      next: () => {
        user.is_active = !user.is_active;
        this.toastr.success(`User ${user.is_active ? 'activated' : 'deactivated'} successfully`);
      },
      error: () => {
        this.toastr.error("Action failed");
      },
    });
  }

  // ✅ Open custom confirmation modal
  resetPassword(user: any) {
    this.userToReset = user;
    this.showResetModal = true;
  }

  // ✅ Confirm password reset
  confirmResetPassword() {
    if (!this.userToReset) return;

    const token = localStorage.getItem("token");
    if (!token) {
      this.toastr.error("Admin token missing. Please log in again.");
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    this.adminService.adminResetPassword(this.userToReset.email, headers).subscribe({
      next: () => {
        this.toastr.success(`✅ Password reset link sent to ${this.userToReset.email}`);
        this.cancelReset();
      },
      error: (err) => {
        console.error("❌ Admin reset failed:", err);
        this.toastr.error(err.error?.message || "Reset failed");
        this.cancelReset();
      }
    });
  }

  // ✅ Cancel modal
  cancelReset() {
    this.showResetModal = false;
    this.userToReset = null;
  }
}