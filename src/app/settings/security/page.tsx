'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../../components/Layout/AppLayout';

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
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
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-6">Sécurité</h1>
        
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Changer le mot de passe
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mot de passe actuel
                </label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nouveau mot de passe
                </label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Entrez votre nouveau mot de passe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Changer le mot de passe
              </button>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Authentification à deux facteurs
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Authentification à deux facteurs
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ajouter une couche de sécurité supplémentaire
                  </p>
                </div>
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                  Configurer
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Gérer les sessions
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Session actuelle
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cette session • Maintenant
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Actif
                </span>
              </div>
              
              <div className="pt-4 border-t border-border">
                <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors">
                  Déconnecter toutes les autres sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 