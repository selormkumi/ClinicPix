import { Injectable } from '@angular/core';

import { Amplify } from 'aws-amplify';

import { fetchAuthSession } from 'aws-amplify/auth';

import { 

  getUrl, uploadData, list, remove, getProperties 

} from 'aws-amplify/storage';

import { BehaviorSubject, Observable } from 'rxjs';
 
export interface ImageItem {

  key: string;

  name: string;

  uploadedBy: string;

  uploadedOn: string;

  tags: string[];

  url?: string;

}
 
@Injectable({

  providedIn: 'root'

})

export class ImageService {

  private imagesSubject = new BehaviorSubject<ImageItem[]>([]);

  public images$: Observable<ImageItem[]> = this.imagesSubject.asObservable();

  private loading = new BehaviorSubject<boolean>(false);

  public loading$ = this.loading.asObservable();
 
  constructor() {}
 
  async uploadImage(file: File, fileName: string, tags: string, userName: string): Promise<boolean> {

    if (!file) return false;
 
    try {

      this.loading.next(true);

      // Create metadata

      const metadata = {

        tags: tags,

        uploadedBy: userName,

        uploadedOn: new Date().toISOString()

      };
 
      // Ensure unique file name if needed

      const uniqueFileName = `${Date.now()}-${fileName || file.name}`;
 
      // Upload to S3 via Amplify Storage

      await Storage.put(uniqueFileName, file, {

        contentType: file.type,

        metadata: metadata,

        level: 'private' as StorageAccessLevel

      });
 
      // Refresh the image list

      await this.listImages();

      return true;

    } catch (error) {

      console.error('Error uploading image:', error);

      return false;

    } finally {

      this.loading.next(false);

    }

  }
 
  async listImages(): Promise<void> {

    try {

      this.loading.next(true);

      // Get all files from S3

      const result = await Storage.list('', { level: 'private' as StorageAccessLevel });

      // Get signed URLs and create image items

      const imagePromises = result.results.map(async (item: any) => {

        // Get the signed URL for each image

        const url = await Storage.get(item.key, { level: 'private' as StorageAccessLevel });

        // Parse metadata if available (might need adjustment based on how S3 returns metadata)

        const metadata = item.metadata || {};

        return {

          key: item.key,

          name: item.key.split('-').slice(1).join('-'), // Remove timestamp prefix

          url: url.toString(),

          uploadedBy: metadata.uploadedBy || 'Unknown',

          uploadedOn: metadata.uploadedOn || new Date().toISOString(),

          tags: metadata.tags ? metadata.tags.split(',').map((tag: string) => tag.trim()) : []

        } as ImageItem;

      });
 
      const images = await Promise.all(imagePromises);

      this.imagesSubject.next(images);

    } catch (error) {

      console.error('Error listing images:', error);

      this.imagesSubject.next([]);

    } finally {

      this.loading.next(false);

    }

  }
 
  async deleteImage(key: string): Promise<boolean> {

    try {

      this.loading.next(true);

      await Storage.remove(key, { level: 'private' as StorageAccessLevel });

      await this.listImages(); // Refresh the list after deletion

      return true;

    } catch (error) {

      console.error('Error deleting image:', error);

      return false;

    } finally {

      this.loading.next(false);

    }

  }
 
  async getImageDetails(key: string): Promise<ImageItem | null> {

    try {

      const url = await Storage.get(key, { level: 'private' as StorageAccessLevel });

      const headInfo = await Storage.getProperties(key, { level: 'private' as StorageAccessLevel });

      // Parse metadata from headInfo

      const metadata = headInfo.Metadata || {};

      return {

        key: key,

        name: key.split('-').slice(1).join('-'), // Remove timestamp prefix

        url: url.toString(),

        uploadedBy: metadata.uploadedBy || 'Unknown',

        uploadedOn: metadata.uploadedOn || new Date().toISOString(),

        tags: metadata.tags ? metadata.tags.split(',').map((tag: string) => tag.trim()) : []

      };

    } catch (error) {

      console.error('Error getting image details:', error);

      return null;

    }

  }

}
 