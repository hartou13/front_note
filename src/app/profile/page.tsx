'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../components/Layout/AppLayout';
import { useUpdateProfile } from '../../lib/hooks/useAuth';

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    language: 'fr',
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    language: 'fr',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();
  
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Récupérer les informations de l'utilisateur
    const firstName = localStorage.getItem('firstName') || '';
    const lastName = localStorage.getItem('lastName') || '';
    const email = localStorage.getItem('email') || '';
    const language = localStorage.getItem('language') || 'fr';

    const userData = {
      firstName,
      lastName,
      email,
      language,
    };

    setUserInfo(userData);
    setFormData(userData);
    setIsLoading(false);
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Vérifier s'il y a des changements
    const hasChanges = Object.keys(newFormData).some(
      key => newFormData[key as keyof typeof newFormData] !== userInfo[key as keyof typeof userInfo]
    );
    setHasChanges(hasChanges);
  };

  const handleSave = () => {
    updateProfileMutation.mutate({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      language: formData.language,
    }, {
      onSuccess: (data) => {
        // Mettre à jour l'état local avec les nouvelles données
        const newUserInfo = {
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          language: data.language,
        };
        setUserInfo(newUserInfo);
        setFormData(newUserInfo);
        setIsEditing(false);
        setHasChanges(false);
      },
    });
  };

  const handleCancel = () => {
    setFormData(userInfo);
    setIsEditing(false);
    setHasChanges(false);
  };

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
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Modifier
            </button>
          )}
        </div>

        {/* Messages de succès/erreur */}
        {updateProfileMutation.isSuccess && !isEditing && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              ✅ Profil mis à jour avec succès !
            </p>
          </div>
        )}

        {updateProfileMutation.error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive text-sm">
              ❌ {updateProfileMutation.error.message}
            </p>
          </div>
        )}
        
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">
            Informations personnelles
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Prénom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                  placeholder="Votre prénom"
                />
              ) : (
                <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground">
                  {userInfo.firstName || 'Non défini'}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nom de famille
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                  placeholder="Votre nom de famille"
                />
              ) : (
                <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground">
                  {userInfo.lastName || 'Non défini'}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                  placeholder="votre@email.com"
                />
              ) : (
                <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground">
                  {userInfo.email || 'Non défini'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Langue
              </label>
              {isEditing ? (
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              ) : (
                <div className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground">
                  {userInfo.language === 'fr' ? 'Français' : 
                   userInfo.language === 'en' ? 'English' : 
                   userInfo.language === 'es' ? 'Español' : 
                   userInfo.language === 'de' ? 'Deutsch' : 
                   userInfo.language || 'Non défini'}
                </div>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!hasChanges || updateProfileMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updateProfileMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                )}
                {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              
              <button
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 