import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import * as moment from 'moment-timezone';

@Component({
  selector: "app-audit",
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: "./audit.component.html",
  styleUrl: "./audit.component.scss",
})
export class AuditComponent implements OnInit {
  searchTerm: string = "";
  auditLogs: any[] = [];
  filteredLogs: any[] = [];
  isLoading: boolean = false;

  // 👁️ Track which user emails are visible (per-row masking)
  visibleEmailRows: Set<number> = new Set<number>();

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchAuditLogs();
  }

  // ✅ Fetch logs from backend
  fetchAuditLogs() {
    this.isLoading = true;

    this.http.get<any[]>(`${environment.apiUrl}/audit-logs`).subscribe({
      next: (res) => {
        this.auditLogs = res.map((log) => ({
          ...log,
          created_at_local: moment.utc(log.created_at).local().format("MMM D YYYY, hh:mm:ss A")
        }));

        this.filteredLogs = [...this.auditLogs];
        this.isLoading = false;
      },
      error: (error) => {
        console.error("❌ Failed to load audit logs", error);
        this.isLoading = false;
      }
    });
  }

  // ✅ Filter logs
  onSearch() {
    const query = this.searchTerm.toLowerCase();
    this.filteredLogs = this.auditLogs.filter((log) =>
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      (log.user_email && log.user_email.toLowerCase().includes(query)) ||
      (log.user_role && log.user_role.toLowerCase().includes(query)) ||
      (log.user_username && log.user_username.toLowerCase().includes(query)) ||
      String(log.user_id).includes(query)
    );
  }

  // ✅ Toggle email visibility per user row
  toggleEmailVisibility(userId: number): void {
    if (this.visibleEmailRows.has(userId)) {
      this.visibleEmailRows.delete(userId);
    } else {
      this.visibleEmailRows.add(userId);
    }
  }

  isEmailVisible(userId: number): boolean {
    return this.visibleEmailRows.has(userId);
  }

  maskEmail(email: string): string {
    if (!email) return "N/A";
    const [user, domain] = email.split("@");
    return user[0] + "***@" + domain;
  }

  // ✅ Logout
  logout() {
    this.authService.logout();
    this.router.navigate(["/auth/login"]).then(() => {
      console.log("✅ Redirected to login page");
    });
  }
}