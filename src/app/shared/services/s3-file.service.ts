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
  uploadFile(fileName: string, fileType: string, uploadedBy: string, tags: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, {
        fileName,
        fileType,
        uploadedBy,
        tags,  // ✅ Include tags
    });
}

  // 📌 Get pre-signed URL to view a file
  getFileUrl(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/view/${encodeURIComponent(fileName)}`);
  }

  // 📌 Rename a file in S3
  renameFile(oldFileName: string, newFileName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, { oldFileName, newFileName });
  }

  // 📌 Generate a shareable link for a file
  getShareUrl(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/share/${encodeURIComponent(fileName)}`);
  }

  // 📌 Delete a file from S3
  deleteFile(fileName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${encodeURIComponent(fileName)}`);
  }

  // 📌 Share file with a patient
shareFile(fileName: string, uploadedBy: string, sharedWith: string, expiresIn: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/share`, {
      fileName,
      uploadedBy,
      sharedWith,
      expiresIn
  });
}

  // 📌 Retrieve shared files for a logged-in patient
  getSharedFiles(patientEmail: string): Observable<any> {
    console.log("📌 Fetching shared files for:", patientEmail);
    return this.http.get(`${this.apiUrl}/shared?sharedWith=${encodeURIComponent(patientEmail)}`);
}

  // 📌 Revoke a shared file (Provider removes access for a patient)
  revokeSharedFile(fileName: string, patientEmail: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/revoke`, {
      fileName,
      patientEmail,
    });
  }

  updateFileTags(fileName: string, tags: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-tags`, { fileName, tags });
}

}
