import { useState, useEffect } from 'react';
import { isPlatform } from '@ionic/react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

// Storage key for photos in preferences
const PHOTO_STORAGE = 'photos';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

export function usePhotoGallery() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);

  /**
   * useEffect - Load saved photos from Preferences when the hook loads
   */
  useEffect(() => {
    const loadSaved = async () => {
      try {
        // Retrieve photos saved in Preferences
        const { value } = await Preferences.get({ key: PHOTO_STORAGE });
        const photosInPreferences = (value ? JSON.parse(value) : []) as UserPhoto[];

        if (!isPlatform('hybrid')) {
          // On web platforms, load Base64 data for display
          for (let photo of photosInPreferences) {
            try {
              const file = await Filesystem.readFile({
                path: photo.filepath,
                directory: Directory.Data,
              });
              photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
            } catch (err) {
              console.error(`Failed to read file: ${photo.filepath}`, err);
            }
          }
        }

        setPhotos(photosInPreferences);
      } catch (err) {
        console.error('Failed to load saved photos', err);
      }
    };

    loadSaved(); // Call the async function to load photos
  }, []); // Run only once when the hook is initialized

  /**
   * takePhoto - Capture a new photo and save it
   */
  const takePhoto = async () => {
    try {
      // Capture a photo using the Capacitor Camera plugin
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100,
      });

      const fileName = `${Date.now()}.jpeg`; // Create a unique filename
      const savedFileImage = await savePicture(photo, fileName); // Save the photo

      // Update the state and persist photos
      const newPhotos = [savedFileImage, ...photos];
      setPhotos(newPhotos);
      await Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });
    } catch (err) {
      console.error('Failed to take photo', err);
    }
  };

  /**
   * savePicture - Save the photo to the filesystem
   * @param photo The photo object from Capacitor Camera
   * @param fileName The desired filename for the photo
   */
  const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
    try {
      let base64Data: string | Blob;

      if (isPlatform('hybrid')) {
        // For hybrid platforms, read the file directly from the path
        if (!photo.path) throw new Error('Photo path is undefined on hybrid platform');
        const file = await Filesystem.readFile({
          path: photo.path,
        });
        base64Data = file.data;
      } else {
        // For web platforms, convert the photo's webPath to Base64
        if (!photo.webPath) throw new Error('Photo webPath is undefined on web platform');
        base64Data = await base64FromPath(photo.webPath);
      }

      // Write the photo file to the filesystem
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
      });

      if (isPlatform('hybrid')) {
        // On hybrid platforms, return the URI for the saved photo
        return {
          filepath: savedFile.uri,
          webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        };
      } else {
        // On web platforms, return the file path and webPath
        return {
          filepath: fileName,
          webviewPath: photo.webPath,
        };
      }
    } catch (err) {
      console.error('Failed to save picture', err);
      throw err;
    }
  };

  /**
   * Return hook values
   */
  return {
    photos,
    takePhoto,
  };
}

/**
 * base64FromPath - Convert an image path to a Base64 string
 * @param path The image path (e.g., webPath)
 */
export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject('method did not return a string');
      }
    };
    reader.readAsDataURL(blob);
  });
}