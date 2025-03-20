import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class S3FileService {
  private apiUrl = "http://localhost:5001/api/files"; // Backend API base URL

  constructor(private http: HttpClient) {}

  // 📌 Get all uploaded files for a provider
  getUploadedFiles(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?uploadedBy=${userId}`); // Send provider ID to backend
  }

  // 📌 Get pre-signed URL to upload a file
  getUploadUrl(fileName: string, fileType: string, uploadedBy: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, { fileName, fileType, uploadedBy });
  }

  // 📌 Upload a file to S3 using pre-signed URL
  uploadFile(fileName: string, fileType: string, uploadedBy: number, tags: string[]): Observable<any> {
    const apiUrl = "http://localhost:5001/api/files/upload";  // ✅ Correct URL
    return this.http.post<{ uploadUrl: string }>(apiUrl, { fileName, fileType, uploadedBy, tags });
  }

  // 📌 Get pre-signed URL to view a file
  getFileUrl(fileName: string, uploadedBy: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/view/${encodeURIComponent(fileName)}?uploadedBy=${uploadedBy}`);
  }

  // 📌 Generate a shareable link for a file
  getShareUrl(fileName: string, uploadedBy: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/share/${encodeURIComponent(fileName)}?uploadedBy=${uploadedBy}`);
  }

  // 📌 Delete a file from S3
  deleteFile(fileName: string, uploadedBy: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${encodeURIComponent(fileName)}?uploadedBy=${uploadedBy}`);
  }

  // 📌 Share file using User ID (Provider -> Patient)
  shareFile(fileName: string, uploadedBy: number, sharedWith: number, expiresIn: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/share`, {
      fileName,
      uploadedBy,
      sharedWith,
      expiresIn
    });
  }

  // 📌 Retrieve shared files for any user (provider or patient)
  getSharedFiles(userId: number): Observable<any> {
    console.log("📌 Fetching shared files for User ID:", userId);
    return this.http.get(`${this.apiUrl}/shared?sharedWith=${encodeURIComponent(userId)}`);
  }

  // 📌 Revoke a shared file (Provider removes access for a user)
  revokeSharedFile(fileName: string, uploadedBy: number, sharedWith: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/revoke`, {
      fileName,
      uploadedBy,
      sharedWith
    });
  }

  // 📌 Update file tags
  updateFileTags(fileName: string, uploadedBy: number, tags: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-tags`, { fileName, uploadedBy, tags });
  }

  // 📌 Get User ID by Email (For Email-Based Sharing)
  getUserIdByEmail(email: string): Observable<any> {
    return this.http.get(`http://localhost:5001/api/user-id?email=${encodeURIComponent(email)}`);
  }
}