import React, { useEffect, useRef } from 'react';
import { notificationService } from '../services/notificationService';
import { firestoreService } from '../services/firestoreService';
import { auth } from '../firebaseConfig';
import { Signalement, Intervention } from '../models';

const NotificationListener: React.FC = () => {
    const prevSignalementsRef = useRef<Record<string, string>>({});
    const isFirstLoad = useRef(true);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const setupListener = (uid: string) => {
            if (unsubscribe) unsubscribe();

            console.log("Setting up notification listener for:", uid);

            unsubscribe = firestoreService.listen('Signalements', 'clientId', '==', uid, async (data) => {
                const currentData = data as unknown as Signalement[];
                const newStatusMap: Record<string, string> = {};
                
                // Get all interventions to show the name in notification
                const interventions = await firestoreService.getAll('interventions');
                const interventionsMap = (interventions as unknown as Intervention[]).reduce((acc, curr) => {
                    if (curr.id) acc[curr.id] = curr.nom;
                    return acc;
                }, {} as Record<string, string>);

                currentData.forEach(s => {
                    if (s.id && s.statut) {
                        newStatusMap[s.id] = s.statut;

                        // Check if status changed to 'termine' or 'terminé'
                        const oldStatus = prevSignalementsRef.current[s.id];
                        const isNowFinished = s.statut === 'termine' || s.statut === 'terminé';
                        const wasFinished = oldStatus === 'termine' || oldStatus === 'terminé';

                        if (!isFirstLoad.current && !wasFinished && isNowFinished) {
                            const interventionName = interventionsMap[s.interventionId] || 'Votre signalement';
                            
                            notificationService.schedule(
                                "Réparation terminée !",
                                `${interventionName} est terminée. Vous pouvez maintenant procéder au paiement.`,
                                Math.floor(Math.random() * 10000)
                            );
                        }
                    }
                });

                prevSignalementsRef.current = newStatusMap;
                isFirstLoad.current = false;
            });
        };

        const authUnsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setupListener(user.uid);
            } else {
                if (unsubscribe) unsubscribe();
                prevSignalementsRef.current = {};
                isFirstLoad.current = true;
            }
        });

        return () => {
            authUnsubscribe();
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return null; // This component doesn't render anything
};

export default NotificationListener;
