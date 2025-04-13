import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { AdminService } from "../../shared/services/admin.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment-timezone';

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

  showResetModal: boolean = false;
  showStatusModal: boolean = false;
  userToReset: any = null;
  userToToggle: any = null;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe(
      (res) => {
        this.users = res.map(user => ({
          ...user,
          date_created_local: moment.utc(user.date_created).local().format("MMM D YYYY, hh:mm:ss A")
        }));
        this.filteredUsers = [...this.users];
        this.isLoading = false;
      },
      (error) => {
        console.error("❌ ERROR: Failed to fetch users", error);
        this.isLoading = false;
      }
    );
  }

  onSearch() {
    const query = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/auth/login"]);
  }

  // ✅ Step 1: Show modal before toggling status
  toggleUserStatus(user: any) {
    this.userToToggle = user;
    this.showStatusModal = true;
  }

  // ✅ Step 2: Confirm toggle
  confirmToggleStatus() {
    if (!this.userToToggle) return;

    const action = this.userToToggle.is_active
      ? this.adminService.deactivateUser
      : this.adminService.activateUser;

    action.call(this.adminService, this.userToToggle.id).subscribe({
      next: () => {
        this.userToToggle.is_active = !this.userToToggle.is_active;
        this.snackBar.open(`✅ User ${this.userToToggle.is_active ? 'activated' : 'deactivated'} successfully`);
        this.cancelToggle();
      },
      error: () => {
        this.snackBar.open("❌ Action failed");
        this.cancelToggle();
      },
    });
  }

  cancelToggle() {
    this.showStatusModal = false;
    this.userToToggle = null;
  }

  resetPassword(user: any) {
    this.userToReset = user;
    this.showResetModal = true;
  }

  confirmResetPassword() {
    if (!this.userToReset) return;

    const token = localStorage.getItem("token");
    if (!token) {
      this.snackBar.open("Admin token missing. Please log in again.");
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    this.adminService.adminResetPassword(this.userToReset.email, headers).subscribe({
      next: () => {
        this.snackBar.open(`✅ Password reset link sent to ${this.userToReset.email}`);
        this.cancelReset();
      },
      error: (err) => {
        console.error("❌ Admin reset failed:", err);
        this.snackBar.open(err.error?.message || "❌ Reset failed");
        this.cancelReset();
      }
    });
  }

  cancelReset() {
    this.showResetModal = false;
    this.userToReset = null;
  }
}