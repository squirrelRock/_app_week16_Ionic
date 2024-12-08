import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonButton,
  IonAlert,
} from '@ionic/react';

import { camera, close } from 'ionicons/icons';
import { useState } from 'react';
import { usePhotoGallery } from '../hooks/usePhotoGallery';
import './Tab2.css';

const Tab2: React.FC = () => {
  const { photos, takePhoto, deletePhoto } = usePhotoGallery();
  const [showAlert, setShowAlert] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleDelete = (filepath: string) => {
    setSelectedPhoto(filepath); // store the selected photo
    setShowAlert(true); // 
  }
  const confirmDelete = () => {
    if (selectedPhoto) {
      deletePhoto(selectedPhoto); // deletePhoto for the selected photo
      setSelectedPhoto(null); // reset selection
    }
    setShowAlert(false); // close alert
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className ="merienda-thick">Photo Gallery</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 2</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid>
          <IonRow>
            {photos.map((photo, index) => (
              <IonCol size="6" key={photo.filepath} className="photo-container">
                <div className="photo-wrapper">
                  <IonImg src={photo.webviewPath} className="photo" />
                  {/* Delete Button */}
                  <IonButton
                    fill="clear"
                    className="delete-button"
                    onClick={() => handleDelete(photo.filepath)}
                  >
                    <IonIcon icon={close}></IonIcon>
                  </IonButton>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* Confirmation Dialog */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Delete Photo"
          message="Do you really want to lose this recording of the photons that were being reflected off your chosen subject at this particular moment in time? This action cannot be undone."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                setSelectedPhoto(null); // reset on cancel
              },
            },
            {
              text: 'Delete',
              handler: confirmDelete,
            },
          ]}
        />

        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto()}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;