import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonButton,
  IonLabel,
  IonToast,
  IonLoading,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firestoreService } from '../services/firestoreService';

const Register: React.FC = () => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleRegister = async () => {
    if (!nom || !email || !password) {
      setToastMessage('Veuillez remplir les champs obligatoires (Nom, Email, Mot de passe)');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create corresponding client document in Firestore
      await firestoreService.set('Clients', user.uid, {
        nom,
        email,
        telephone: phone,
        adresse: address,
        capital: 500, // Initial capital for new users
        createdAt: new Date()
      });

      setToastMessage('Compte créé avec succès !');
      setShowToast(true);
      
      // Navigate to home/tabs
      history.push('/tabs/add-car');
    } catch (error: any) {
      console.error("Registration error:", error);
      setToastMessage(error.message || 'Échec de la création du compte');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Créer un compte</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ padding: '1rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Rejoignez le Garage</h1>

          <IonItem lines="full">
            <IonLabel position="floating">Nom Complet *</IonLabel>
            <IonInput 
              value={nom} 
              onIonInput={e => setNom(e.detail.value!)} 
              required
            />
          </IonItem>
          
          <IonItem lines="full">
            <IonLabel position="floating">Email *</IonLabel>
            <IonInput 
              value={email} 
              type="email" 
              onIonInput={e => setEmail(e.detail.value!)} 
              required
            />
          </IonItem>

          <IonItem lines="full">
            <IonLabel position="floating">Mot de passe *</IonLabel>
            <IonInput 
              value={password} 
              type="password" 
              onIonInput={e => setPassword(e.detail.value!)} 
              required
            />
          </IonItem>

          <IonItem lines="full">
            <IonLabel position="floating">Téléphone</IonLabel>
            <IonInput 
              value={phone} 
              type="tel" 
              onIonInput={e => setPhone(e.detail.value!)} 
            />
          </IonItem>

          <IonItem lines="full">
            <IonLabel position="floating">Adresse</IonLabel>
            <IonInput 
              value={address} 
              onIonInput={e => setAddress(e.detail.value!)} 
            />
          </IonItem>

          <div style={{ marginTop: '2rem' }}>
            <IonButton expand="block" onClick={handleRegister}>
              S'inscrire
            </IonButton>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <IonButton fill="clear" onClick={() => history.push('/login')}>
              Déjà un compte ? Se connecter
            </IonButton>
          </div>
        </div>
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
        <IonLoading isOpen={loading} message="Création du compte..." />
      </IonContent>
    </IonPage>
  );
};

export default Register;
