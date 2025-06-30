'use client';

import { Palette } from 'lucide-react';
import { useState } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

// Palette de couleurs prédéfinies
const PRESET_COLORS = [
  '#2973B2', // Bleu
  '#E74C3C', // Rouge
  '#27AE60', // Vert
  '#F39C12', // Orange
  '#9B59B6', // Violet
  '#1ABC9C', // Turquoise
  '#34495E', // Gris foncé
  '#E67E22', // Orange foncé
  '#3498DB', // Bleu clair
  '#2ECC71', // Vert clair
  '#E91E63', // Rose
  '#FF9800', // Ambre
  '#795548', // Marron
  '#607D8B', // Bleu gris
  '#8BC34A', // Vert lime
  '#FF5722', // Rouge orange
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  value, 
  onChange, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handlePresetColorClick = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton d'ouverture */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
      >
        <div 
          className="w-4 h-4 rounded border border-border"
          style={{ backgroundColor: value }}
        />
        <Palette className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-foreground">{value}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute top-full left-0 mt-2 p-4 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[280px]">
            {/* Couleurs prédéfinies */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-popover-foreground mb-3">
                Couleurs prédéfinies
              </h4>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handlePresetColorClick(color)}
                    className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                      value === color 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Sélecteur personnalisé */}
            <div>
              <h4 className="text-sm font-medium text-popover-foreground mb-3">
                Couleur personnalisée
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-10 h-8 border border-input rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                      onChange(e.target.value);
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1 px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 