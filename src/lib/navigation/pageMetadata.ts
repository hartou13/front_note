export interface PageMetadata {
  title: string;
  icon?: string;
  badge?: string | number;
  hidden?: boolean;
  order?: number;
  section?: string;
  requiresAuth?: boolean;
}

// Métadonnées pour chaque page
export const pageMetadata: Record<string, PageMetadata> = {
  '/main': {
    title: 'Tableau de bord',
    icon: 'Home',
    order: 1,
    section: 'Principal',
    requiresAuth: true,
  },
  '/profile': {
    title: 'Mon Profil',
    icon: 'User',
    order: 2,
    section: 'Principal',
    requiresAuth: true,
  },
  '/projects': {
    title: 'Mes Projets',
    icon: 'FolderOpen',
    order: 3,
    section: 'Principal',
    requiresAuth: true,
  },
  '/notes': {
    title: 'Notes',
    icon: 'FileText',
    order: 4,
    section: 'Principal',
    requiresAuth: true,
  },
  '/tag': {
    title: 'Tags',
    icon: 'Tag',
    order: 5,
    section: 'Principal',
    requiresAuth: true,
  },
  '/settings/preferences': {
    title: 'Préférences',
    icon: 'Settings',
    order: 1,
    section: 'Paramètres',
    requiresAuth: true,
  },
  '/settings/security': {
    title: 'Sécurité',
    icon: 'Shield',
    order: 2,
    section: 'Paramètres',
    requiresAuth: true,
  },
  '/login': {
    title: 'Connexion',
    icon: 'LogIn',
    hidden: true, // Ne pas afficher dans la navigation
    requiresAuth: false,
  },
  '/': {
    title: 'Accueil',
    hidden: true, // Redirection automatique
    requiresAuth: false,
  },
}; 