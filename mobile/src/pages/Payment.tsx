import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  useIonToast,
  IonSelect,
  IonSelectOption,
  IonText,
  IonSpinner,
  IonButtons,
  IonBackButton
} from "@ionic/react";
import { firestoreService } from "../services/firestoreService";
import { auth } from "../firebaseConfig";
import { Client, Signalement, Intervention, Voiture } from "../models";

interface ExtendedSignalement extends Signalement {
  marque: string;
  modele: string;
  details: Intervention | null;
  prixTotal: number;
}

const Payment: React.FC = () => {
  const [signalements, setSignalements] = useState<ExtendedSignalement[]>([]);
  const [selectedSignalement, setSelectedSignalement] = useState<ExtendedSignalement | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [present] = useIonToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        fetchData(user?.uid || 'client_1');
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      // 1. Fetch Client info
      const clientData = await firestoreService.getById('Clients', uid);
      if (clientData) {
        setClient(clientData as unknown as Client);
      }

      // 2. Fetch Client's cars
      const cars = await firestoreService.query('Voitures', 'clientId', '==', uid);
      const carsList = cars as unknown as Voiture[];

      // 3. Fetch finished signalements
      const allSignalements = await firestoreService.query('Signalements', 'clientId', '==', uid);
      const finishedSignalements = (allSignalements as unknown as Signalement[])
        .filter(s => s.statut === 'termine' || s.statut === 'terminé');

      // 4. Fetch interventions catalog
      let catalog = (await firestoreService.getAll('interventions')) as unknown as Intervention[];
      if (catalog.length === 0) {
        catalog = (await firestoreService.getAll('Interventions')) as unknown as Intervention[];
      }

      // 5. Join and Map
      const mapped = finishedSignalements.map(s => {
        const car = carsList.find(c => c.id === s.voitureId);
        const inter = catalog.find(i => i.id === s.interventionId);
        
        // Simplified: only the catalog price of the intervention
        const finalPrice = inter?.prix || 0;

        return {
          ...s,
          marque: car?.marque || 'Inconnu',
          modele: car?.modele || 'Véhicule',
          details: inter || null,
          prixTotal: finalPrice
        };
      });

      setSignalements(mapped);
    } catch (error) {
      console.error("Error fetching payment data:", error);
      present({
        message: "Erreur lors du chargement des données.",
        duration: 3000,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedSignalement || !client || !client.id) return;

    if (client.capital < selectedSignalement.prixTotal) {
      present({
        message: "Capital insuffisant pour effectuer ce paiement.",
        duration: 3000,
        color: "warning",
      });
      return;
    }

    try {
      // 1. Deduct capital from client
      const newCapital = client.capital - selectedSignalement.prixTotal;
      await firestoreService.update('Clients', client.id, { capital: newCapital });

      // 2. Update signalement status to 'payé'
      if (selectedSignalement.id) {
        await firestoreService.update('Signalements', selectedSignalement.id, { statut: 'paye' });
      }

      present({
        message: "Paiement de l'intervention effectué avec succès !",
        duration: 3000,
        color: "success",
      });

      // Refresh data
      setSelectedSignalement(null);
      const uid = auth.currentUser?.uid || 'client_1';
      fetchData(uid);
    } catch (error) {
      console.error("Payment error:", error);
      present({
        message: "Échec du paiement.",
        duration: 3000,
        color: "danger",
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/add-car" />
          </IonButtons>
          <IonTitle>Paiement</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '20%' }}>
            <IonSpinner name="crescent" />
            <p>Chargement...</p>
          </div>
        ) : (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Interventions terminées</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {signalements.length === 0 ? (
                  <IonText color="medium">
                    <p style={{ textAlign: 'center' }}>Aucune intervention terminée en attente.</p>
                  </IonText>
                ) : (
                  <IonItem>
                    <IonLabel position="stacked">Choisir une intervention</IonLabel>
                    <IonSelect 
                      placeholder="Sélectionner" 
                      value={selectedSignalement}
                      onIonChange={e => setSelectedSignalement(e.detail.value)}
                    >
                      {signalements.map(s => (
                        <IonSelectOption key={s.id} value={s}>
                          {s.marque} {s.modele} - {s.details?.nom || 'Réparation'} ({s.prixTotal.toFixed(2)} Ar)
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                )}
              </IonCardContent>
            </IonCard>

            {client && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Votre Compte</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                   <IonText color="primary">
                      <h2>Capital disponible : {client.capital.toFixed(2)} Ar</h2>
                   </IonText>
                </IonCardContent>
              </IonCard>
            )}

            {selectedSignalement && client && (
              <IonCard color="light">
                <IonCardHeader>
                  <IonCardTitle>Détails du Paiement</IonCardTitle>
                  <IonText color="dark">
                    <h3>Prix de l'intervention : {selectedSignalement.prixTotal.toFixed(2)} Ar</h3>
                  </IonText>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Résumé :</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '1rem', fontWeight: 'bold' }}>
                      <span>{selectedSignalement.details?.nom || 'Réparation'}</span>
                      <span>{selectedSignalement.prixTotal.toFixed(2)} Ar</span>
                    </div>
                  </div>

                  <IonText color="medium">
                    <p>Le montant sera directement déduit de votre capital.</p>
                  </IonText>

                  <div style={{ marginTop: "20px" }}>
                    <IonButton
                      expand="block"
                      onClick={handlePayment}
                      disabled={client.capital < selectedSignalement.prixTotal}
                    >
                      Payer {selectedSignalement.prixTotal.toFixed(2)} Ar
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Payment;
