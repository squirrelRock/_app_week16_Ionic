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
   * useEffect -loading the saved photos from Preferences when the hook loads
   */
  useEffect(() => {
    const loadSaved = async () => {
      try {
        // getphotos saved in preferences
        const { value } = await Preferences.get({ key: PHOTO_STORAGE });
        const photosInPreferences = (value ? JSON.parse(value) : []) as UserPhoto[];
      // If running on the web...
        if (!isPlatform('hybrid')) {
          //for web platforms, load Base64 data 
          for (let photo of photosInPreferences) {
            try {
              const file = await Filesystem.readFile({
                path: photo.filepath,
                directory: Directory.Data,
              });
      // Web platform only: Load the photo as base64 data
              photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
            } catch (err) {
              console.error(`fail - reading file: ${photo.filepath}`, err);
            }
          }
        }

        setPhotos(photosInPreferences);
      } catch (err) {
        console.error('watch out - fail loading saved photos', err);
      }
    };

    loadSaved(); // call the function to load up photos
  }, []); // [] - establishes to run only once: when the hook is initialized

  //
   //takePhoto - snap a beautiful new photo and save it
  // 
  const takePhoto = async () => {
    try {
      // snap a photo using the Capacitor Camera plugin
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100,
      });

      const fileName = `${Date.now()}.jpeg`; // make a unique filename
      const savedFileImage = await savePicture(photo, fileName); // save the photo

      // update the state and store the photos
      const newPhotos = [savedFileImage, ...photos];
      setPhotos(newPhotos);


      await Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });

    } catch (err) {
      console.error('taking photo failed', err);
    }
  };

  
   //savePicture - saving the photo to the filesystem
   // param photo : photo object from Capacitor Camera
   // param fileName :  filename for the photo

  const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
    try {
      let base64Data: string | Blob;
       // "hybrid" will detect Cordova or Capacitor;

      if (isPlatform('hybrid')) {
        // For hybrid platforms, read the file directly from the path
        if (!photo.path) throw new Error('undefined photo path on hybrid platform');
        const file = await Filesystem.readFile({
          path: photo.path,
        });
        base64Data = file.data;
      } else {
        // For web platforms, convert the photo's webPath to Base64
        if (!photo.webPath) throw new Error('undefined photo webPath  on web platform');
        base64Data = await base64FromPath(photo.webPath);
      }

      // writing the photo file to the filesystem
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
      });

      if (isPlatform('hybrid')) {
        // Display the new image by rewriting the 'file://' path to HTTP
    // Details: https://ionicframework.com/docs/building/webview#file-protocol
        return {
          filepath: savedFile.uri,
          webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        };
      } else {
         // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
        // on web platforms, return the file path and webPath
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

  ///deleting function
const deletePhoto = async (filepath: string) => {
  // Remove photo from filesystem
  await Filesystem.deleteFile({
    path: filepath,
    directory: Directory.Data,
  });

  // Update state
  const updatedPhotos = photos.filter((photo) => photo.filepath !== filepath);
  setPhotos(updatedPhotos);

  // Update Preferences
  Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(updatedPhotos) });
};
  //returning the hook values

  return {
    photos,
    takePhoto,
    deletePhoto,
  };
}

//


// base64FromPath - convert an image path to a Base64 string
//param path --- where the image path is the webPath)
//
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

