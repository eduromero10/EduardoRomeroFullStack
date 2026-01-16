import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  async takePhoto(): Promise<File | null> {
    try {
      const photo: Photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera, 
      });

      if (!photo.webPath) {
        return null;
      }

      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const fileName = `profile-${Date.now()}.jpg`;

      const file = new File([blob], fileName, {
        type: blob.type || 'image/jpeg',
      });

      return file;
    } catch (err) {
      console.error('Error al sacar foto con la cámara:', err);
      return null;
    }
  }
}
