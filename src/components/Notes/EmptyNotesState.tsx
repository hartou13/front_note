import { FileText } from 'lucide-react';

interface EmptyNotesStateProps {
  hasFilters: boolean;
  onCreateNote: () => void;
}

export function EmptyNotesState({ hasFilters, onCreateNote }: EmptyNotesStateProps) {
  return (
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        {hasFilters
          ? 'Aucune note trouvée avec les filtres sélectionnés'
          : 'Aucune note trouvée'
        }
      </h3>
      <p className="text-muted-foreground mb-6">
        {hasFilters
          ? 'Essayez de modifier vos filtres ou créez une nouvelle note'
          : 'Créez votre première note pour commencer'
        }
      </p>
      <button
        onClick={onCreateNote}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Créer une note
      </button>
    </div>
  );
}
 