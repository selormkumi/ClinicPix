import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // ✅ Get all users
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  // ✅ Update user info (e.g., role, email, username)
  updateUser(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}`, data);
  }

  // ✅ Activate user
  activateUser(userId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/activate/${userId}`, {});
  }

  // ✅ Deactivate user
  deactivateUser(userId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/deactivate/${userId}`, {});
  }

  // ✅ Admin-triggered password reset
  adminResetPassword(targetEmail: string, options: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/auth/admin-reset-password`,
      { targetEmail },
      options
    );
  }

  // ✅ Fetch audit logs
  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/audit-logs`);
  }

}