import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private baseUrl = "http://localhost:5001/api/users";

  constructor(private http: HttpClient) {}

  // ✅ Get all users
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  // ✅ Update user info (e.g., role, email, username)
  updateUser(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}`, data);
  }

  activateUser(userId: number) {
    return this.http.patch(`${this.baseUrl}/activate/${userId}`, {});
  }
  
  deactivateUser(userId: number) {
    return this.http.patch(`${this.baseUrl}/deactivate/${userId}`, {});
  }

  adminResetPassword(targetEmail: string, options: any) {
    return this.http.post('http://localhost:5001/api/auth/admin-reset-password', {
      targetEmail
    }, options);
  }  
  
}