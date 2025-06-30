import { NavigationConfig } from '../types/navigation';
import { pageMetadata } from './pageMetadata';

interface FileSystemRoute {
  path: string;
  hasPage: boolean;
  children?: FileSystemRoute[];
  isProtected?: boolean;
}

// Fonction qui pourrait être utilisée au build time pour scanner les dossiers
export async function scanAppDirectory(): Promise<FileSystemRoute[]> {
  // Cette fonction pourrait utiliser fs.readdir en Node.js au build time
  // Pour l'instant, on simule avec la structure connue
  
  // En production, cela pourrait ressembler à :
  /*
  const fs = require('fs');
  const path = require('path');
  
  function scanDirectory(dir: string, basePath: string = ''): FileSystemRoute[] {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const routes: FileSystemRoute[] = [];
    
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('_') && !item.name.startsWith('(')) {
        const currentPath = path.join(basePath, item.name);
        const fullPath = path.join(dir, item.name);
        const hasPage = fs.existsSync(path.join(fullPath, 'page.tsx')) || 
                       fs.existsSync(path.join(fullPath, 'page.ts')) ||
                       fs.existsSync(path.join(fullPath, 'page.js')) ||
                       fs.existsSync(path.join(fullPath, 'page.jsx'));
        
        const route: FileSystemRoute = {
          path: '/' + currentPath.replace(/\\/g, '/'),
          hasPage,
          children: scanDirectory(fullPath, currentPath)
        };
        
        routes.push(route);
      }
    }
    
    return routes;
  }
  
  return scanDirectory('./src/app');
  */
  
  // Version simulée basée sur notre structure actuelle
  return [
    {
      path: '/',
      hasPage: true,
    },
    {
      path: '/login',
      hasPage: true,
    },
    {
      path: '/main',
      hasPage: true,
      isProtected: true,
    },
    {
      path: '/profile',
      hasPage: true,
      isProtected: true,
    },
    {
      path: '/settings',
      hasPage: false,
      isProtected: true,
      children: [
        {
          path: '/settings/preferences',
          hasPage: true,
          isProtected: true,
        },
        {
          path: '/settings/security',
          hasPage: true,
          isProtected: true,
        },
      ],
    },
  ];
}

// Fonction pour générer automatiquement les métadonnées manquantes
export function generateMissingMetadata(routes: FileSystemRoute[]): void {
  const processRoute = (route: FileSystemRoute) => {
    if (route.hasPage && !pageMetadata[route.path]) {
      // Générer des métadonnées automatiques
      const segments = route.path.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] || 'home';
      
      // Déterminer la section basée sur le chemin
      let section = 'Autres';
      if (route.path === '/main') section = 'Principal';
      else if (route.path === '/profile') section = 'Principal';
      else if (route.path.startsWith('/settings')) section = 'Paramètres';
      
      // Générer une icône basée sur le nom
      let icon = 'Circle';
      if (lastSegment.includes('dashboard') || lastSegment === 'main') icon = 'Home';
      else if (lastSegment.includes('profile') || lastSegment.includes('user')) icon = 'User';
      else if (lastSegment.includes('settings') || lastSegment.includes('config')) icon = 'Settings';
      else if (lastSegment.includes('security') || lastSegment.includes('lock')) icon = 'Shield';
      else if (lastSegment.includes('preferences')) icon = 'Sliders';
      
      pageMetadata[route.path] = {
        title: formatPathToTitle(route.path),
        icon,
        section,
        requiresAuth: route.isProtected || false,
        order: Object.keys(pageMetadata).length + 1,
      };
    }
    
    // Traiter les enfants récursivement
    if (route.children) {
      route.children.forEach(processRoute);
    }
  };
  
  routes.forEach(processRoute);
}

function formatPathToTitle(path: string): string {
  if (path === '/') return 'Accueil';
  if (path === '/main') return 'Tableau de bord';
  
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Convertir kebab-case/snake_case en format lisible
  return lastSegment
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Fonction principale pour générer la navigation automatiquement
export async function generateNavigationFromFileSystem(): Promise<NavigationConfig> {
  const routes = await scanAppDirectory();
  generateMissingMetadata(routes);
  
  // Réutiliser la logique de génération existante
  const { generateNavigation } = await import('./generateNavigation');
  return generateNavigation();
}

// Hook pour surveiller les changements de structure en développement
export function useFileSystemWatcher() {
  // En développement, on pourrait utiliser chokidar ou un autre watcher
  // pour régénérer automatiquement la navigation quand les fichiers changent
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 FileSystem watcher activé en mode développement');
    // Ici on pourrait implémenter un watcher real-time
  }
} 