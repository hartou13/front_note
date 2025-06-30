import { useMemo } from 'react';
import { generateNavigationFromScannedRoutesSync } from '../navigation/routeLoader';
import { NavigationConfig } from '../types/navigation';

export const useNavigation = () => {
  // Générer la navigation basée sur les métadonnées et la structure scannée
  const navigation = useMemo(() => {
    try {
      return generateNavigationFromScannedRoutesSync();
    } catch (error) {
      console.error('Erreur lors de la génération de la navigation:', error);
      // Retourner une navigation par défaut en cas d'erreur
      return {
        sections: [
          {
            id: 'main',
            title: 'Principal',
            items: [
              {
                id: 'dashboard',
                label: 'Tableau de bord',
                href: '/main',
                icon: 'Home',
              },
            ],
          },
        ],
      } as NavigationConfig;
    }
  }, []);

  return {
    data: navigation,
    isLoading: false,
    error: null,
  };
}; 