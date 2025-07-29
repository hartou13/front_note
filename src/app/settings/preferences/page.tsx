'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../../components/Layout/AppLayout';
import { ThemeToggle } from '../../../components/UI/ThemeToggle';
import { useTheme } from '../../../lib/providers/ThemeProvider';

export default function PreferencesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { theme, setTheme, mounted } = useTheme();

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
        <h1 className="text-3xl font-bold text-foreground mb-6">Préférences</h1>
        
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Apparence
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Thème
                </label>
                <div className="flex items-center space-x-4">
                  <ThemeToggle variant="dropdown" />
                  {mounted && (
                    <span className="text-sm text-muted-foreground">
                      Thème actuel : {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Le thème système suit les préférences de votre système d'exploitation
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Langue
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                  <option>Français</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Notifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Notifications email
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Recevoir des notifications par email
                  </p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Notifications push
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Recevoir des notifications push
                  </p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Sauvegarder les préférences
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 