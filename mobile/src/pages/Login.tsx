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
  IonLoading
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async () => {
    if (!email || !password) {
      setToastMessage('Veuillez remplir tous les champs');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      history.push('/tabs/add-car');
    } catch (error: any) {
      console.error("Login error:", error);
      setToastMessage(error.message || 'Échec de la connexion');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion Garage</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Interface Client</h1>
            
            <IonItem lines="full">
            <IonLabel position="floating">Email</IonLabel>
            <IonInput 
                value={email} 
                type="email" 
                onIonInput={e => setEmail(e.detail.value!)} 
                required
            />
            </IonItem>

            <IonItem lines="full">
            <IonLabel position="floating">Mot de passe</IonLabel>
            <IonInput 
                value={password} 
                type="password" 
                onIonInput={e => setPassword(e.detail.value!)} 
                required
            />
            </IonItem>

            <div style={{ marginTop: '2rem' }}>
                <IonButton expand="block" onClick={handleLogin}>
                Se connecter
                </IonButton>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <IonButton fill="clear" onClick={() => history.push('/register')}>
                    Pas de compte ? Créer un compte
                  </IonButton>
                </div>
            </div>
        </div>
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
        <IonLoading isOpen={loading} message="Connexion en cours..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;
