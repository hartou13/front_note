'use client';

import {
  ChevronDown,
  ChevronRight,
  Circle,
  FileText,
  FolderOpen,
  Home,
  LogIn,
  Menu,
  PocketKnife,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Tag,
  User,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useNavigation } from '../../lib/hooks/useNavigation';
import { NavigationItem } from '../../lib/types/navigation';

// Mapping des icônes
const iconMap = {
  Home,
  User,
  Settings,
  Shield,
  Menu,
  X,
  LogIn,
  Sliders,
  Circle,
  FolderOpen,
  FileText,
  PocketKnife,
  Sparkles,
  Tag
} as const;

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onMobileToggle: () => void;
  onDesktopToggle: () => void;
}

interface NavigationItemComponentProps {
  item: NavigationItem;
  currentPath: string;
  isCollapsed: boolean;
  level?: number;
}

const NavigationItemComponent: React.FC<NavigationItemComponentProps> = ({ 
  item, 
  currentPath,
  isCollapsed,
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = currentPath === item.href;
  const hasChildren = item.children && item.children.length > 0;
  
  const Icon = item.icon ? iconMap[item.icon as keyof typeof iconMap] : null;
  
  const baseClasses = `
    flex items-center w-full px-3 py-2 text-sm rounded-lg transition-all duration-200
    ${level > 0 ? 'ml-4' : ''}
    ${isCollapsed ? 'justify-center' : 'justify-between'}
  `;
  
  const activeClasses = isActive
    ? 'bg-primary text-primary-foreground shadow-sm'
    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';

  if (hasChildren && !isCollapsed) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`${baseClasses} ${activeClasses}`}
        >
          <div className="flex items-center">
            {Icon && <Icon className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'}`} />}
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavigationItemComponent
                key={child.id}
                item={child}
                currentPath={currentPath}
                isCollapsed={isCollapsed}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${baseClasses} ${activeClasses} group relative`}
      title={isCollapsed ? item.label : undefined}
    >
      <div className="flex items-center">
        {Icon && <Icon className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'}`} />}
        {!isCollapsed && (
          <>
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </div>
      
      {/* Tooltip pour mode collapsed */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </Link>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  isCollapsed, 
  onMobileToggle, 
  onDesktopToggle 
}) => {
  const { data: navigation, isLoading, error } = useNavigation();
  const currentPath = usePathname();

  if (isLoading) {
    return (
      <div className={`fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      } w-64`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      } w-64`}>
        <div className="flex items-center justify-center h-full">
          <p className="text-destructive text-sm">Erreur</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static lg:inset-0 ${
      isCollapsed ? 'lg:w-16' : 'lg:w-64'
    } w-64`}>
      {/* Header */}
      <div className={`flex items-center border-b border-sidebar-border transition-all duration-300 ${
        isCollapsed ? 'justify-center p-4' : 'justify-between p-4'
      }`} style={{ height: '65px' }}>
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">Vela</h2>
          </div>
        )}
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent transition-colors"
        >
          <X className="w-5 h-5 text-sidebar-foreground" />
        </button>
        {isCollapsed && (
          <div className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigation?.sections.map((section) => (
          <div key={section.id}>
            {section.title && !isCollapsed && (
              <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide">
                {section.title}
              </h3>
            )}
            {section.title && isCollapsed && (
              <div className="px-3 py-2 flex justify-center">
                <div className="w-6 h-px bg-sidebar-foreground/20"></div>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavigationItemComponent
                  key={item.id}
                  item={item}
                  currentPath={currentPath}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - Collapse button pour desktop */}
      <div className={`hidden lg:flex border-t border-sidebar-border p-4 ${
        isCollapsed ? 'justify-center' : 'justify-between items-center'
      }`}>
        {!isCollapsed && (
          <span className="text-xs text-sidebar-foreground/70">
            Réduire
          </span>
        )}
        <button
          onClick={onDesktopToggle}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          title={isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
        >
          <Menu className="w-4 h-4 text-sidebar-foreground" />
        </button>
      </div>
    </div>
  );
}; 