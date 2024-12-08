import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import './Tab1.css';

const Tab1: React.FC = () => {
  const [dataset, setDataset] = useState<any[]>([]);
  const dataURL = "https://dev-kdurkin-sql.pantheonsite.io/wp-json/twentytwentyone-child/v1/rockSQLdbEndpoint";

  useEffect(() => {
    fetch(dataURL)
      .then(response => response.json())
      .then(data => setDataset(data));
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Rocks for Sale</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-container">
          <h1 className="page-title">Rocks for Sale</h1>
          <div className="grid-container merienda-thin">
            {dataset.map(({ ID, post_title, rock_image }) => (
              <a key={ID} href={`/rocks4sale/${ID}`} className="grid-item">
                <div className="card">
                  <div className="image-container">
                    <img
                      src={rock_image}
                      alt={post_title || 'Rock for Sale'}
                      className="rock-image"
                    />
                  </div>
                  <h2 className="card-title">{post_title || 'Untitled Post'}</h2>
                </div>
              </a>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;