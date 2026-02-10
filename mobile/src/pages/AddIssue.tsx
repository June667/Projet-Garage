import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonButtons,
  IonBackButton,
  IonSpinner
} from '@ionic/react';
import { notificationService } from '../services/notificationService';
import { firestoreService } from '../services/firestoreService';
import { auth } from '../firebaseConfig';
import { Intervention, Voiture } from '../models';

const AddIssue: React.FC = () => {
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [interventionTypes, setInterventionTypes] = useState<Intervention[]>([]);
  const [selectedVoiture, setSelectedVoiture] = useState<string | undefined>();
  const [selectedIntervention, setSelectedIntervention] = useState<string | undefined>();
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use onAuthStateChanged to ensure we have the user before fetching
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchData(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      // Fetch user's cars
      const carsData = await firestoreService.query('Voitures', 'clientId', '==', uid);
      if (Array.isArray(carsData)) {
        setVoitures(carsData as unknown as Voiture[]);
      }

      // Fetch from lowercase 'interventions' collection
      const interventionsData = await firestoreService.getAll('interventions');
      if (Array.isArray(interventionsData) && interventionsData.length > 0) {
        setInterventionTypes(interventionsData as unknown as Intervention[]);
      } else {
        const fallBackData = await firestoreService.getAll('Interventions');
        if (Array.isArray(fallBackData)) {
            setInterventionTypes(fallBackData as unknown as Intervention[]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      setToastMessage('Session expirée. Veuillez vous reconnecter.');
      setShowToast(true);
      return;
    }

    if (!selectedVoiture || !selectedIntervention) {
      setToastMessage('Veuillez remplir tous les champs.');
      setShowToast(true);
      return;
    }

    try {
      const newSignalement = {
        interventionId: selectedIntervention,
        voitureId: selectedVoiture,
        clientId: user.uid,
        date: new Date(),
        statut: 'en attente'
      };

      await firestoreService.add('Signalements', newSignalement);

      const interventionName = interventionTypes.find(i => i.id === selectedIntervention)?.nom || 'Signalement';

      setToastMessage('Signalement enregistré avec succès !');
      setShowToast(true);
      
      await notificationService.schedule(
        "Signalement Enregistré",
        `Votre signalement pour "${interventionName}" a été pris en compte.`,
        2
      );

      setSelectedIntervention(undefined);
      setSelectedVoiture(undefined);
    } catch (error) {
      setToastMessage('Erreur lors du signalement.');
      setShowToast(true);
      console.error(error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/add-car" />
          </IonButtons>
          <IonTitle>Signaler un problème</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '20%' }}>
            <IonSpinner name="crescent" />
            <p>Chargement des données...</p>
          </div>
        ) : (
          <>
            <IonItem>
              <IonLabel position="stacked">Sélectionner une voiture</IonLabel>
              <IonSelect value={selectedVoiture} placeholder="Sélectionner votre voiture" onIonChange={e => setSelectedVoiture(e.detail.value)}>
                {voitures.length > 0 ? voitures.map(voiture => (
                  <IonSelectOption key={voiture.id} value={voiture.id}>
                    {voiture.marque} {voiture.modele} ({voiture.immatriculation})
                  </IonSelectOption>
                )) : (
                  <IonSelectOption disabled value="">Aucune voiture trouvée</IonSelectOption>
                )}
              </IonSelect>
            </IonItem>
            
            <IonItem>
              <IonLabel position="stacked">Type d'intervention nécessaire</IonLabel>
              <IonSelect value={selectedIntervention} placeholder="Sélectionner l'intervention" onIonChange={e => setSelectedIntervention(e.detail.value)}>
                {interventionTypes.length > 0 ? interventionTypes.map(type => (
                  <IonSelectOption key={type.id} value={type.id}>
                    {type.nom}
                  </IonSelectOption>
                )) : (
                  <IonSelectOption disabled value="">Aucune intervention disponible</IonSelectOption>
                )}
              </IonSelect>
            </IonItem>

            <div className="ion-padding-top">
              <IonButton expand="block" onClick={handleSubmit} color="danger" disabled={voitures.length === 0 || interventionTypes.length === 0}>
                Enregistrer le Signalement
              </IonButton>
            </div>
          </>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default AddIssue;
