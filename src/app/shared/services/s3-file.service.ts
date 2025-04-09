import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class S3FileService {
  private apiUrl = "http://localhost:5001/api/files";        // File-related routes
  private userApiUrl = "http://localhost:5001/api/users";    // User-related routes

  constructor(private http: HttpClient) {}

  // 📌 Get all uploaded files for a provider
  getUploadedFiles(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?uploadedBy=${userId}`);
  }

  // 📌 Get pre-signed URL to upload a file
  getUploadUrl(fileName: string, fileType: string, uploadedBy: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, { fileName, fileType, uploadedBy });
  }

  // 📌 Upload a file to S3 using pre-signed URL
  uploadFile(fileName: string, fileType: string, uploadedBy: number, tags: string[]): Observable<any> {
    const apiUrl = "http://localhost:5001/api/files/upload";
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
      expiresIn,
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
      sharedWith,
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

  // ✅ Fetch shared files uploaded by the provider
  getProviderSharedFiles(providerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/provider-shared?uploadedBy=${encodeURIComponent(providerId)}`);
  }

  // 📌 Assign a patient to a provider
  assignPatient(providerId: number, patientEmail: string): Observable<any> {
    return this.http.post("http://localhost:5001/api/patients/assign", {
      providerId,
      patientEmail,
    });
  }

  // 📌 Get all patients assigned to a provider
  getPatientsByProvider(providerId: number): Observable<any> {
    return this.http.get(`http://localhost:5001/api/patients/${providerId}`);
  }

  // 📌 Get all available patients (for dropdown email selector)
  getAllPatientEmails(providerId: number): Observable<any> {
    return this.http.get(`http://localhost:5001/api/patients/all-patient-emails/${providerId}`);
  }

  // 📌 Unassign (remove) patient from provider
  unassignPatient(providerId: number, patientId: number): Observable<any> {
    return this.http.request("delete", "http://localhost:5001/api/patients/unassign", {
      body: { providerId, patientId }
    });
  }

  // ✅ Fetch a user's profile (merged from users + user_profiles)
  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.userApiUrl}/${userId}`);
  }

  // ✅ Update user's profile data (into user_profiles table)
  updateUserProfile(userId: number, data: any): Observable<any> {
    return this.http.put(`http://localhost:5001/api/users/${userId}/profile`, data);
  }  

  // ✅ Download file using pre-signed URL
  downloadFile(fileName: string, uploadedBy: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/download-url?fileName=${encodeURIComponent(fileName)}&uploadedBy=${uploadedBy}`);
  }

  getDownloadUrl(fileName: string, uploadedBy: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/download?fileName=${encodeURIComponent(fileName)}&uploadedBy=${uploadedBy}`);
  }  

}