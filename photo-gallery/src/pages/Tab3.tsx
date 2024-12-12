import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import './Tab3.css';

const Tab3: React.FC = () => {
  const [dataset, setDataset] = useState<any[]>([]);
  const dataURL = "https://dev-kdurkin-sql.pantheonsite.io/wp-json/twentytwentyone-child/v1/chipEndpoint";

  //  convert youtube URL to embed format
  const getEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0]; // Extract video ID
    return `https://www.youtube.com/embed/${videoId}`;
  };

  useEffect(() => {
    fetch(dataURL)
      .then(response => response.json())
      .then(data => setDataset(data));
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Chipmunk Videos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-container">
          <h1 className="page-title">Latest Videos</h1>
          <div className="grid-container">
            {dataset.map(({ ID, post_title, media_file }) => (
              <div key={ID} className="grid-item">
                <div className="card">
                  <div className="video-container">
                    <iframe
                      src={getEmbedUrl(media_file)}
                      className="video-player"
                      title={post_title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <h2 className="card-title">{post_title || 'Untitled Video'}</h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;