import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.prod";

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

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchAuditLogs();
  }

  // ✅ Explicitly convert to Date object
  fetchAuditLogs() {
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/audit-logs`).subscribe(
      (res) => {
        this.auditLogs = res.map((log) => ({
          ...log,
          created_at: new Date(log.created_at)
        }));
        this.filteredLogs = [...this.auditLogs];
        this.isLoading = false;
      },
      (error) => {
        console.error("❌ Failed to load audit logs", error);
        this.isLoading = false;
      }
    );
  }

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

  logout() {
    this.authService.logout();
    this.router.navigate(["/auth/login"]).then(() => {
      console.log("✅ Redirected to login page");
    });
  }
}