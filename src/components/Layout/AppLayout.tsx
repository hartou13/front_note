'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLogout } from '../../lib/hooks/useAuth';
import { pageMetadata } from '../../lib/navigation/pageMetadata';
import { Sidebar } from '../Sidebar/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userInitial, setUserInitial] = useState('U');
  const [userName, setUserName] = useState('Utilisateur');
  const pathname = usePathname();
  const logoutMutation = useLogout();

  // Charger les données utilisateur depuis localStorage
  useEffect(() => {
    const firstName = localStorage.getItem('first_name');
    const storedName = localStorage.getItem('firstName');
    
    if (firstName) {
      setUserInitial(firstName.charAt(0));
    }
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // Fermer la sidebar mobile lors du redimensionnement vers desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDesktopSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Obtenir le titre dynamique basé sur la route actuelle
  const getCurrentPageTitle = () => {
    // Vérifier que le pathname est valide
    if (!pathname || pathname === '') {
      return 'Vela';
    }

    // Vérifier d'abord les métadonnées exactes
    const currentPageMeta = pageMetadata[pathname];
    if (currentPageMeta?.title) {
      return currentPageMeta.title;
    }

    // Fallback : générer un titre à partir du pathname
    if (pathname === '/') return 'Accueil';
    
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return 'Vela';
    }
    
    const lastSegment = segments[segments.length - 1];
    
    const generatedTitle = lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return generatedTitle || 'Vela';
  };

  const pageTitle = getCurrentPageTitle();

  // Mettre à jour le titre de la page avec une logique plus robuste
  useEffect(() => {
    // Éviter de mettre à jour le titre si c'est déjà le bon
    const currentTitle = document.title;
    const newTitle = pageTitle ? `${pageTitle} - Vela` : 'Vela';
    
    if (currentTitle !== newTitle) {
      document.title = newTitle;
    }
  }, [pageTitle, pathname]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        isCollapsed={sidebarCollapsed}
        onMobileToggle={toggleMobileSidebar}
        onDesktopToggle={toggleDesktopSidebar}
      />

      {/* Main content area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 `}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 py-4" style={{ height: '64px' }}>
            {/* Left side - Mobile menu button */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-accent text-foreground transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Desktop collapse button */}
              <button
                onClick={toggleDesktopSidebar}
                className="hidden lg:flex p-2 rounded-lg hover:bg-accent text-foreground transition-colors"
                aria-label={sidebarCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Page title - Dynamic based on route */}
              <h1 className="text-xl font-semibold text-foreground">
                {pageTitle}
              </h1>
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center space-x-3">
              {/* User avatar placeholder */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {userInitial}
                  </span>
                </div>
                <span className="hidden md:block text-sm text-muted-foreground">
                  {userName}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {logoutMutation.isPending ? 'Déconnexion...' : 'Déconnexion'}
              </button>
            </div>
          </div>

          {/* Error display */}
          {logoutMutation.error && (
            <div className="mx-4 mb-3 p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">
                ❌ Erreur lors de la déconnexion : {logoutMutation.error.message}
              </p>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-auto ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-16'
        }`}>
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}; 