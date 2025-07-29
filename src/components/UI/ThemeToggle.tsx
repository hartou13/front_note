'use client';

import { ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../lib/providers/ThemeProvider';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

export function ThemeToggle({ variant = 'button', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`p-2 rounded-lg ${className}`}>
        <div className="w-4 h-4 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-accent text-foreground transition-colors"
        >
          {theme === 'light' && <Sun className="w-4 h-4" />}
          {theme === 'dark' && <Moon className="w-4 h-4" />}
          {theme === 'system' && <Monitor className="w-4 h-4" />}
          <span className="hidden sm:inline">
            {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  setTheme('light');
                  setIsDropdownOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                  theme === 'light' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent text-foreground'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Clair</span>
              </button>
              
              <button
                onClick={() => {
                  setTheme('dark');
                  setIsDropdownOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent text-foreground'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Sombre</span>
              </button>
              
              <button
                onClick={() => {
                  setTheme('system');
                  setIsDropdownOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                  theme === 'system' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent text-foreground'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Système</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default button variant
  const getNextTheme = () => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'system';
    return 'light';
  };

  const getIcon = () => {
    if (theme === 'light') return Sun;
    if (theme === 'dark') return Moon;
    return Monitor;
  };

  const Icon = getIcon();

  return (
    <button
      onClick={() => setTheme(getNextTheme())}
      className={`p-2 rounded-lg hover:bg-accent text-foreground transition-colors ${className}`}
      title={`Thème actuel: ${theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
} 