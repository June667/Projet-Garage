export interface Client {
  id?: string;
  nom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  capital: number;
}

export interface Voiture {
  id?: string;
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  clientId: string; // Foreign key to Clients
}

export interface Intervention {
  id?: string;
  nom: string;
  description: string;
  prix: number;
  duree: string;
  createdAt: any;
}

export interface Signalement {
  id?: string;
  clientId: string;
  voitureId: string;
  interventionId: string;
  date: any;
  statut?: 'en attente' | 'en cours' | 'termine' | 'terminé' | 'paye'; // Keeping status here for tracking
  repairs?: any; // To support nested repairs object
}

export interface Reparation {
  id?: string;
  signalementId: string;
  piece: string;
  prix: number;
  quantite: number;
}

