export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  isActive?: boolean;
  permissions?: string[];
}

export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
}

export interface NavigationConfig {
  sections: NavigationSection[];
} 