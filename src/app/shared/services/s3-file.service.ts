import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class S3FileService {
  private apiUrl = "http://localhost:5001/api/files"; // Update if needed

  constructor(private http: HttpClient) {}

  // 📌 Get list of uploaded files
  getUploadedFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // 📌 Get pre-signed URL to upload a new file
  getUploadUrl(fileName: string, fileType: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, {
      fileName,
      fileType,
    });
  }

  // 📌 Upload a file to S3 using pre-signed URL
  uploadFile(file: File): Observable<any> {
    return new Observable((observer) => {
      this.getUploadUrl(file.name, file.type).subscribe(
        (res) => {
          if (res.uploadUrl) {
            fetch(res.uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type },
            })
              .then(() => {
                observer.next({ message: "File uploaded successfully!" });
                observer.complete();
              })
              .catch((err) => observer.error(err));
          }
        },
        (error) => observer.error(error)
      );
    });
  }

  // 📌 Get pre-signed URL to view a file
  getFileUrl(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/view/${encodeURIComponent(fileName)}`);
  }

  // 📌 Rename a file in S3
  renameFile(oldFileName: string, newFileName: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, {
      oldFileName,
      newFileName,
    });
  }

  // 📌 Generate a shareable link for a file
  getShareUrl(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/share/${encodeURIComponent(fileName)}`);
  }

  // 📌 Delete a file
  deleteFile(fileName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${encodeURIComponent(fileName)}`);
  }
}