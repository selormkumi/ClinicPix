import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class S3FileService {
  private apiUrl = "http://localhost:5001/api/files"; // Backend API base URL

  constructor(private http: HttpClient) {}

  // 📌 Get all uploaded files
  getUploadedFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // 📌 Get pre-signed URL to upload a file
  getUploadUrl(fileName: string, fileType: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, { fileName, fileType });
  }

  // 📌 Upload a file to S3 using pre-signed URL
  uploadFile(fileName: string, fileType: string, uploadedBy: number, tags: string[]) {
    const apiUrl = "http://localhost:5001/api/files/upload";  // ✅ Correct URL
    return this.http.post<{ uploadUrl: string }>(apiUrl, { fileName, fileType, uploadedBy, tags });
}

  // 📌 Get pre-signed URL to view a file
  getFileUrl(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/view/${encodeURIComponent(fileName)}`);
  }

  // 📌 Generate a shareable link for a file
  getShareUrl(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/share/${encodeURIComponent(fileName)}`);
  }

  // 📌 Delete a file from S3
  deleteFile(fileName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${encodeURIComponent(fileName)}`);
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
  revokeSharedFile(fileName: string, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/revoke`, {
      fileName,
      userId, // ✅ Use User ID instead of patientId
    });
  }

  // 📌 Update file tags
  updateFileTags(fileName: string, tags: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-tags`, { fileName, tags });
  }

  // 📌 Get User ID by Email (For Email-Based Sharing)
  getUserIdByEmail(email: string): Observable<any> {
    return this.http.get(`http://localhost:5001/api/user-id?email=${encodeURIComponent(email)}`);
}

}