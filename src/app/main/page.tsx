'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../components/Layout/AppLayout';

export default function MainPage() {
  const [userInfo, setUserInfo] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Récupérer les informations de l'utilisateur
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const email = localStorage.getItem('email');

    setUserInfo({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
    });
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Carte de bienvenue */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">
          Bienvenue, {userInfo.firstName} {userInfo.lastName} !
        </h2>
        <div className="space-y-2 text-muted-foreground">
          <p>
            <span className="font-medium">Email :</span> {userInfo.email}
          </p>
          <p>
            <span className="font-medium">Statut :</span> Connecté avec succès
          </p>
        </div>
      </div>

      {/* Statistiques ou contenu supplémentaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Activité récente
          </h3>
          <p className="text-muted-foreground">
            Aucune activité récente à afficher.
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Notifications
          </h3>
          <p className="text-muted-foreground">
            Aucune nouvelle notification.
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Accès rapide
          </h3>
          <p className="text-muted-foreground">
            Utilisez la sidebar pour naviguer.
          </p>
        </div>
      </div>
    </AppLayout>
  );
} 