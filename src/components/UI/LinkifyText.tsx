'use client';

import React from 'react';

interface LinkifyTextProps {
  text: string;
  className?: string;
}

export const LinkifyText: React.FC<LinkifyTextProps> = ({ text, className = '' }) => {
  // Regex pour détecter les URLs (http, https, ftp, etc.)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[^\s]{2,})/g;
  
  // Fonction pour vérifier si une chaîne ressemble à une URL
  const isUrl = (str: string): boolean => {
    return /^(https?:\/\/|www\.|[^\s]+\.[^\s]{2,})/.test(str);
  };

  // Fonction pour normaliser l'URL (ajouter https:// si nécessaire)
  const normalizeUrl = (url: string): string => {
    if (url.startsWith('www.')) {
      return `https://${url}`;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  // Fonction pour diviser le texte en parties (texte normal et URLs)
  const parseText = (text: string): (string | { url: string; original: string })[] => {
    const parts: (string | { url: string; original: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      const original = match[0];
      
      // Ajouter le texte avant l'URL
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Vérifier si c'est vraiment une URL
      if (isUrl(original)) {
        parts.push({
          url: normalizeUrl(original),
          original
        });
      } else {
        parts.push(original);
      }
      
      lastIndex = match.index + original.length;
    }
    
    // Ajouter le reste du texte
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts;
  };

  const parts = parseText(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        } else {
          return (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
              onClick={(e) => {
                // Empêcher la propagation pour éviter de déclencher le clic sur la note
                e.stopPropagation();
              }}
            >
              {part.original}
            </a>
          );
        }
      })}
    </span>
  );
}; 