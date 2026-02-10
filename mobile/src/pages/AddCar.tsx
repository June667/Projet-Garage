import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast
} from '@ionic/react';
import { notificationService } from '../services/notificationService';
import { firestoreService } from '../services/firestoreService';
import { auth } from '../firebaseConfig';

const AddCar: React.FC = () => {
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [annee, setAnnee] = useState<number | undefined>();
  const [immatriculation, setImmatriculation] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      setToastMessage('Vous devez être connecté pour ajouter une voiture.');
      setShowToast(true);
      return;
    }

    if (!marque || !modele || !annee || !immatriculation) {
      setToastMessage('Veuillez remplir tous les champs.');
      setShowToast(true);
      return;
    }

    try {
      await firestoreService.add('Voitures', {
        marque,
        modele,
        annee,
        immatriculation,
        clientId: user.uid
      });

      setToastMessage('Voiture ajoutée avec succès !');
      setShowToast(true);

      // Notify user safely
      await notificationService.schedule(
        "Véhicule Ajouté",
        `${marque} ${modele} a été ajouté à votre garage.`,
        3
      );

      setMarque('');
      setModele('');
      setAnnee(undefined);
      setImmatriculation('');
      
    } catch (error) {
      setToastMessage('Erreur lors de l\'ajout de la voiture.');
      setShowToast(true);
      console.error(error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ajouter une voiture</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Ajouter une voiture</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonItem>
          <IonLabel position="stacked">Marque</IonLabel>
          <IonInput value={marque} onIonInput={e => setMarque(e.detail.value!)} placeholder="ex: Toyota" />
        </IonItem>
        
        <IonItem>
          <IonLabel position="stacked">Modèle</IonLabel>
          <IonInput value={modele} onIonInput={e => setModele(e.detail.value!)} placeholder="ex: Camry" />
        </IonItem>
        
        <IonItem>
          <IonLabel position="stacked">Année</IonLabel>
          <IonInput type="number" value={annee} onIonInput={e => setAnnee(parseInt(e.detail.value!, 10))} placeholder="ex: 2022" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Immatriculation</IonLabel>
          <IonInput value={immatriculation} onIonInput={e => setImmatriculation(e.detail.value!)} placeholder="ex: 1234 ABC" />
        </IonItem>

        <div className="ion-padding-top">
            <IonButton expand="block" onClick={handleSubmit}>
            Enregistrer
            </IonButton>
        </div>

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

export default AddCar;

