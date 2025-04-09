import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private baseUrl = "http://localhost:5001/api/users"; // ✅ Correct base path

  constructor(private http: HttpClient) {}

  // ✅ Get all users
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }

  // ✅ Update user info (e.g., role, email, username)
  updateUser(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}`, data);
  }

  // ✅ Activate/deactivate user
  toggleUserActiveStatus(userId: number, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${userId}/status`, { isActive });
  }
}