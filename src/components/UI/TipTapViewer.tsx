'use client';

import React from 'react';

interface TipTapViewerProps {
  content: string;
  className?: string;
}

export const TipTapViewer: React.FC<TipTapViewerProps> = ({ content, className = '' }) => {
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}; 