import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.prod"; // ✅ Import env

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
    this.http.get<any[]>(`${environment.apiUrl}/audit-logs`).subscribe(
      (res) => {
        this.auditLogs = res;
        this.filteredLogs = [...res];
      },
      (error) => {
        console.error("❌ Failed to load audit logs", error);
      }
    );
  }

  // ✅ Filter logs (including username)
  onSearch() {
    const query = this.searchTerm.toLowerCase();
    this.filteredLogs = this.auditLogs.filter(
      (log) =>
        log.action.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        (log.user_email && log.user_email.toLowerCase().includes(query)) ||
        (log.user_role && log.user_role.toLowerCase().includes(query)) ||
        (log.user_username && log.user_username.toLowerCase().includes(query)) ||
        String(log.user_id).includes(query)
    );
  }

  // ✅ Logout Function
  logout() {
    this.authService.logout();
    this.router.navigate(["/auth/login"]).then(() => {
      console.log("✅ Redirected to login page");
    });
  }
}