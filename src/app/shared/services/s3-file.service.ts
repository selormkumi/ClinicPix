import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class S3FileService {
  private apiUrl = 'https://your-backend-api.com/api/files'; // Replace with actual backend URL

  constructor(private http: HttpClient) {}

  /**
   * Uploads a file to S3 via backend.
   * @param file - The file to be uploaded.
   * @param metadata - Additional metadata (e.g., tags).
   */
  uploadFile(file: File, metadata: any = {}): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Fetches a list of uploaded files from the backend.
   */
  getUploadedFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  /**
   * Retrieves a file URL for viewing from the backend.
   * @param fileName - The name of the file to retrieve.
   */
  getFileUrl(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/view/${encodeURIComponent(fileName)}`);
  }

  /**
   * Deletes a file from S3 via backend.
   * @param fileName - The name of the file to delete.
   */
  deleteFile(fileName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${encodeURIComponent(fileName)}`);
  }

  /**
   * Updates file name and tags in S3 via backend.
   * @param oldFileName - The current file name.
   * @param newFileName - The new file name.
   * @param tags - New metadata/tags for the file.
   */
  updateFileDetails(oldFileName: string, newFileName: string, tags: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, { oldFileName, newFileName, tags });
  }

  /**
   * Generates a shareable link for an S3 file.
   * @param fileName - The name of the file.
   */
  getShareableLink(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/share/${encodeURIComponent(fileName)}`);
  }
}
