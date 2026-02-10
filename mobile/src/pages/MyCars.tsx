import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonText,
  IonButtons,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail
} from '@ionic/react';
import { logOutOutline, carSportOutline, addOutline } from 'ionicons/icons';
import { firestoreService } from '../services/firestoreService';
import { auth } from '../firebaseConfig';
import { Voiture } from '../models';
import { useHistory } from 'react-router-dom';

const MyCars: React.FC = () => {
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchCars(user.uid);
      } else {
        history.push('/login');
      }
    });
    return () => unsubscribe();
  }, [history]);

  const fetchCars = async (uid: string) => {
    setLoading(true);
    try {
      const data = await firestoreService.query('Voitures', 'clientId', '==', uid);
      setVoitures(data as unknown as Voiture[]);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    if (auth.currentUser) {
      await fetchCars(auth.currentUser.uid);
    }
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mes Voitures</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/tabs/add-car" color="primary">
              <IonIcon slot="icon-only" icon={addOutline} />
            </IonButton>
            <IonButton onClick={handleLogout} color="danger">
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '20%' }}>
            <IonSpinner name="crescent" />
            <p>Chargement de votre garage...</p>
          </div>
        ) : (
          <>
            {voitures.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '30%' }}>
                <IonIcon icon={carSportOutline} style={{ fontSize: '4rem', color: '#ccc' }} />
                <IonText color="medium">
                  <p>Aucune voiture enregistrée.</p>
                </IonText>
                <IonButton fill="clear" routerLink="/tabs/add-car">
                  Ajouter ma première voiture
                </IonButton>
              </div>
            ) : (
              <IonList>
                {voitures.map((car) => (
                  <IonCard key={car.id}>
                    <IonCardHeader>
                      <IonCardSubtitle>{car.immatriculation}</IonCardSubtitle>
                      <IonCardTitle>{car.marque} {car.modele}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>Année: {car.annee}</p>
                    </IonCardContent>
                  </IonCard>
                ))}
              </IonList>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MyCars;
