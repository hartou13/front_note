import { NavigationConfig, NavigationItem } from '../types/navigation';
import { pageMetadata } from './pageMetadata';

// Import du fichier JSON généré
let routesData: any = null;

// Fonction pour charger les routes côté client
async function loadRoutesClient(): Promise<any> {
  try {
    // Essayer de charger le fichier routes.json côté client
    const response = await fetch('/api/routes');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Impossible de charger les routes via API, utilisation du fallback');
  }
  
  // Fallback : générer les routes à partir des métadonnées
  return generateRoutesFromMetadata();
}

// Générer les routes à partir des métadonnées uniquement
function generateRoutesFromMetadata(): any {
  const routes = Object.entries(pageMetadata)
    .filter(([path, meta]) => !meta.hidden && meta.requiresAuth !== false)
    .map(([path, meta]) => {
      // Gérer les routes imbriquées
      if (path.includes('/') && path !== '/') {
        const segments = path.split('/').filter(Boolean);
        if (segments.length > 1) {
          // Route enfant
          return {
            path,
            hasPage: true,
            directory: segments[segments.length - 1],
            isProtected: meta.requiresAuth !== false,
            parentPath: '/' + segments.slice(0, -1).join('/')
          };
        }
      }
      
      // Route racine
      return {
        path,
        hasPage: true,
        directory: path === '/' ? 'root' : path.substring(1),
        isProtected: meta.requiresAuth !== false
      };
    });

  // Organiser les routes avec leurs enfants
  const routeMap = new Map();
  const childRoutes = new Map();

  routes.forEach(route => {
    if (route.parentPath) {
      if (!childRoutes.has(route.parentPath)) {
        childRoutes.set(route.parentPath, []);
      }
      childRoutes.get(route.parentPath).push(route);
    } else {
      routeMap.set(route.path, route);
    }
  });

  // Ajouter les enfants aux parents
  childRoutes.forEach((children, parentPath) => {
    if (routeMap.has(parentPath)) {
      routeMap.get(parentPath).children = children;
    } else {
      // Créer le parent s'il n'existe pas
      const parentSegments = parentPath.split('/').filter(Boolean);
      const parentRoute = {
        path: parentPath,
        hasPage: false,
        directory: parentSegments[parentSegments.length - 1],
        isProtected: true,
        children
      };
      routeMap.set(parentPath, parentRoute);
    }
  });

  return {
    generatedAt: new Date().toISOString(),
    routes: Array.from(routeMap.values())
  };
}

try {
  if (typeof window === 'undefined') {
    // Côté serveur - charger depuis le fichier
    const fs = require('fs');
    const path = require('path');
    const routesPath = path.join(process.cwd(), 'src', 'lib', 'navigation', 'routes.json');
    if (fs.existsSync(routesPath)) {
      routesData = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
    } else {
      // Fallback serveur
      routesData = generateRoutesFromMetadata();
    }
  } else {
    // Côté client - sera chargé de manière asynchrone
    routesData = null;
  }
} catch (error) {
  console.warn('Erreur lors du chargement des routes, utilisation du fallback');
  routesData = generateRoutesFromMetadata();
}

function createNavigationItemFromRoute(route: any): NavigationItem | null {
  // Skip si pas de page ou si masqué dans les métadonnées
  if (!route.hasPage || pageMetadata[route.path]?.hidden) {
    return null;
  }

  const metadata = pageMetadata[route.path];
  
  const item: NavigationItem = {
    id: route.path.replace(/\//g, '_') || 'root',
    label: metadata?.title || formatPathToLabel(route.path),
    href: route.path,
    icon: metadata?.icon,
    badge: metadata?.badge,
  };

  // Ajouter les enfants si ils existent
  if (route.children) {
    const children = route.children
      .map((child: any) => createNavigationItemFromRoute(child))
      .filter((child: NavigationItem | null): child is NavigationItem => child !== null)
      .sort((a: NavigationItem, b: NavigationItem) => {
        const aOrder = pageMetadata[a.href]?.order || 999;
        const bOrder = pageMetadata[b.href]?.order || 999;
        return aOrder - bOrder;
      });

    if (children.length > 0) {
      item.children = children;
    }
  }

  return item;
}

function formatPathToLabel(path: string): string {
  if (path === '/') return 'Accueil';
  
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Convertir kebab-case en format lisible
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function groupBySection(items: NavigationItem[]): any[] {
  const sections = new Map<string, NavigationItem[]>();
  
  items.forEach(item => {
    const metadata = pageMetadata[item.href];
    const sectionName = metadata?.section || 'Autres';
    
    if (!sections.has(sectionName)) {
      sections.set(sectionName, []);
    }
    
    sections.get(sectionName)!.push(item);
  });
  
  // Convertir en array et trier
  return Array.from(sections.entries())
    .map(([title, items]) => ({
      id: title.toLowerCase().replace(/\s+/g, '_'),
      title,
      items: items.sort((a, b) => {
        const aOrder = pageMetadata[a.href]?.order || 999;
        const bOrder = pageMetadata[b.href]?.order || 999;
        return aOrder - bOrder;
      }),
    }))
    .sort((a, b) => {
      // Ordre spécifique des sections
      const sectionOrder = ['Principal', 'Paramètres', 'Autres'];
      const aIndex = sectionOrder.indexOf(a.title);
      const bIndex = sectionOrder.indexOf(b.title);
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });
}

export async function generateNavigationFromScannedRoutes(): Promise<NavigationConfig> {
  // Si pas de données côté client, les charger
  if (typeof window !== 'undefined' && !routesData) {
    routesData = await loadRoutesClient();
  }

  if (!routesData) {
    // Fallback ultime
    routesData = generateRoutesFromMetadata();
  }

  // Créer les éléments de navigation à partir des routes scannées
  const navigationItems = routesData.routes
    .map((route: any) => createNavigationItemFromRoute(route))
    .filter((item: NavigationItem | null): item is NavigationItem => item !== null);

  // Grouper par section
  const sections = groupBySection(navigationItems);

  return {
    sections,
  };
}

// Version synchrone pour compatibilité
export function generateNavigationFromScannedRoutesSync(): NavigationConfig {
  const data = routesData || generateRoutesFromMetadata();

  const navigationItems = data.routes
    .map((route: any) => createNavigationItemFromRoute(route))
    .filter((item: NavigationItem | null): item is NavigationItem => item !== null);

  const sections = groupBySection(navigationItems);

  return {
    sections,
  };
}

// Information sur la dernière génération
export function getGenerationInfo() {
  return {
    generatedAt: routesData?.generatedAt || 'Unknown',
    routeCount: routesData?.routes?.length || 0,
  };
} 