import { NavigationConfig, NavigationItem, NavigationSection } from '../types/navigation';
import { pageMetadata, PageMetadata } from './pageMetadata';

interface FileSystemRoute {
  path: string;
  hasPage: boolean;
  children?: FileSystemRoute[];
}

// Simulation de l'analyse du système de fichiers
// En production, cela pourrait être généré au build time
const fileSystemRoutes: FileSystemRoute[] = [
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
  },
  {
    path: '/profile',
    hasPage: true,
  },
  {
    path: '/notes',
    hasPage: true,
  },
  {
    path: '/projects',
    hasPage: true,
  },
  {
    path: '/tag',
    hasPage: true,
  },
  {
    path: '/settings',
    hasPage: false,
    children: [
      {
        path: '/settings/preferences',
        hasPage: true,
      },
      {
        path: '/settings/security',
        hasPage: true,
      },
    ],
  },
];

function createNavigationItem(route: FileSystemRoute, metadata?: PageMetadata): NavigationItem | null {
  // Skip si pas de page ou si masqué
  if (!route.hasPage || metadata?.hidden) {
    return null;
  }

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
      .map(child => createNavigationItem(child, pageMetadata[child.path]))
      .filter((child): child is NavigationItem => child !== null)
      .sort((a, b) => {
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

function groupBySection(items: NavigationItem[]): NavigationSection[] {
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

export function generateNavigation(): NavigationConfig {
  // Créer les éléments de navigation à partir de la structure de fichiers
  const navigationItems = fileSystemRoutes
    .map(route => createNavigationItem(route, pageMetadata[route.path]))
    .filter((item): item is NavigationItem => item !== null);

  // Grouper par section
  const sections = groupBySection(navigationItems);

  return {
    sections,
  };
}

// Fonction pour rafraîchir dynamiquement les métadonnées
export function updatePageMetadata(path: string, metadata: Partial<PageMetadata>) {
  pageMetadata[path] = {
    ...pageMetadata[path],
    ...metadata,
  };
}

// Fonction pour ajouter une nouvelle route dynamiquement
export function addRoute(path: string, metadata: PageMetadata) {
  pageMetadata[path] = metadata;
  
  // Ici, on pourrait également mettre à jour fileSystemRoutes
  // mais pour simplifier, on se contente des métadonnées
} 