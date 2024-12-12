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
  IonModal,
  IonText,
} from '@ionic/react';

import { camera, close } from 'ionicons/icons';
import { useState } from 'react';
import { usePhotoGallery } from '../hooks/usePhotoGallery';
import './Tab2.css';

const Tab2: React.FC = () => {
  const { photos, takePhoto, deletePhoto } = usePhotoGallery();
  const [showModal, setShowModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleDelete = (filepath: string) => {
    setSelectedPhoto(filepath); 
    setShowModal(true); // show the modal
  };

  const confirmDelete = () => {
    if (selectedPhoto) {
      deletePhoto(selectedPhoto); 
      setSelectedPhoto(null); // reset selection
    }
    setShowModal(false); // close the modal
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Photo Gallery</IonTitle>
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
                  {/* delete Button */}
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

        {/* confirm delete modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-content">
            <IonText color="primary">
              <h2>Delete Photo</h2>
            </IonText>
            <p>Do you really want to lose this recording of the moment in time that those particular photons were being reflected off your chosen subject? This action cannot be undone.</p>
            <div className="modal-buttons">
              <IonButton onClick={() => setShowModal(false)} color="medium">
                Cancel
              </IonButton>
              <IonButton onClick={confirmDelete} color="danger">
                Delete
              </IonButton>
            </div>
          </div>
        </IonModal>

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