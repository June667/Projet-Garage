import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonButtons,
  IonBackButton
} from "@ionic/react";
import { firestoreService } from "../services/firestoreService";
import { auth } from "../firebaseConfig";
import { Signalement, Intervention, Voiture } from "../models";

interface ExtendedSignalement extends Signalement {
  marque: string;
  modele: string;
  intervention: Intervention | null;
}

const MyIssues: React.FC = () => {
  const [signalements, setSignalements] = useState<ExtendedSignalement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      fetchMyIssues(user?.uid || 'client_1');
    });
    return () => unsubscribe();
  }, []);

  const fetchMyIssues = async (uid: string) => {
    setLoading(true);
    try {
      // 1. Fetch user's cars
      const cars = await firestoreService.query('Voitures', 'clientId', '==', uid);
      const carsList = cars as unknown as Voiture[];

      // 2. Fetch user's signalements
      const userSignalements = await firestoreService.query('Signalements', 'clientId', '==', uid);
      const signalementsList = userSignalements as unknown as Signalement[];

      // 3. Fetch interventions catalog (trying both cases)
      let catalog = (await firestoreService.getAll('interventions')) as unknown as Intervention[];
      if (catalog.length === 0) {
        catalog = (await firestoreService.getAll('Interventions')) as unknown as Intervention[];
      }

      // 4. Map and Join
      const mapped = signalementsList.map(s => {
        const car = carsList.find(c => c.id === s.voitureId);
        const inter = catalog.find(i => i.id === s.interventionId);
        return {
          ...s,
          marque: car?.marque || 'Inconnu',
          modele: car?.modele || 'Véhicule',
          intervention: inter || null
        };
      });

      // 5. Sort by date desc
      mapped.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });

      setSignalements(mapped);
    } catch (error) {
      console.error("Error fetching signalements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const uid = auth.currentUser?.uid || 'client_1';
    await fetchMyIssues(uid);
    event.detail.complete();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'paye': return 'success';
      case 'termine':
      case 'terminé': return 'primary';
      case 'en cours': return 'warning';
      case 'en attente': return 'medium';
      default: return 'light';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/add-car" />
          </IonButtons>
          <IonTitle>Mes Signalements</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '20%' }}>
            <IonSpinner name="crescent" />
            <p>Chargement de vos signalements...</p>
          </div>
        ) : (
          <>
            {signalements.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '30%' }}>
                <IonText color="medium">
                  <p>Vous n'avez pas encore de signalements.</p>
                </IonText>
              </div>
            ) : (
              <IonList>
                {signalements.map((s) => (
                  <IonCard key={s.id} style={{ margin: '10px 0' }}>
                    <IonCardContent>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h2 style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 5px 0' }}>
                            {s.intervention?.nom || 'Signalement'}
                          </h2>
                          <p style={{ color: 'var(--ion-color-medium)', margin: '0' }}>
                            {s.marque} {s.modele}
                          </p>
                        </div>
                        <IonBadge color={getStatusColor(s.statut)} style={{ textTransform: 'uppercase' }}>
                          {s.statut?.replace('termine', 'terminé').replace('paye', 'payé') || 'EN ATTENTE'}
                        </IonBadge>
                      </div>
                      
                      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <IonText color="dark">
                          <span>{s.intervention?.prix ? `${s.intervention.prix} Ar` : 'Prix à estimer'}</span>
                        </IonText>
                        <IonText color="medium" style={{ fontSize: '0.85rem' }}>
                          {s.date?.toDate 
                            ? s.date.toDate().toLocaleDateString() 
                            : new Date(s.date).toLocaleDateString()}
                        </IonText>
                      </div>
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

export default MyIssues;
