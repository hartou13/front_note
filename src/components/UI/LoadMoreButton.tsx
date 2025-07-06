import { Plus } from 'lucide-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
  className?: string;
}

export function LoadMoreButton({ onClick, isLoading, hasMore, className = '' }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className={`flex justify-center pt-6 ${className}`}>
      <button
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Chargement...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Afficher plus
          </>
        )}
      </button>
    </div>
  );
} 